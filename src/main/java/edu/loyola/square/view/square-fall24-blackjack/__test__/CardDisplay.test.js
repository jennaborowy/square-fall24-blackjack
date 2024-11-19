import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardDisplay from '../app/gameplay/components/CardDisplay';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';

// Mock Firebase
jest.mock("../firebaseConfig", () => ({
    auth: {
        currentUser: {
            uid: "test-user-id"
        }
    },
    db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayRemove: jest.fn()
}));

// Mock fetch calls
global.fetch = jest.fn();

// Mock session storage
const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage
});

// Mock child components
jest.mock('../app/messages/chatbox/chatbox', () => () => <div>Mock ChatBox</div>);
jest.mock('../app/gameplay/GameInfo', () => () => <div>Mock GameInfo</div>);
jest.mock('../app/gameplay/AceModal', () => ({ showModal, onSelectValue }) => (
    <div data-testid="ace-modal">Mock AceModal</div>
));
jest.mock('../app/gameplay/BetTypeAnimation', () => ({ children }) => (
    <div>{children}</div>
));

describe('CardDisplay Component', () => {
    const mockTableId = 'test-table-123';

    beforeEach(() => {
        jest.clearAllMocks();

        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                players: ['test-user-id', 'player2-id'],
                minimum_bet: 5
            })
        });

        global.fetch.mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    players: [
                        { hand: [{ suit: 'hearts', rank: 'A' }] },
                        { hand: [{ suit: 'spades', rank: '10' }] }
                    ],
                    dealerHand: [{ suit: 'diamonds', rank: 'K' }],
                    currentPlayerIndex: 0
                })
            })
        );
    });

    describe('Initial Render and Error Cases', () => {
        it('handles missing tableId', async () => {
            render(<CardDisplay tableId={null} />);
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('gameTableId');
        });

        it('handles Firestore errors', async () => {
            getDoc.mockRejectedValueOnce(new Error('Firestore error'));
            render(<CardDisplay tableId={mockTableId} />);
            await waitFor(() => {
                expect(console.error).toHaveBeenCalled();
            });
        });

        it('handles non-existent table', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => false
            });
            render(<CardDisplay tableId={mockTableId} />);
            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith("Table document doesn't exist");
            });
        });

        it('handles invalid players array', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                data: () => ({
                    players: null,
                    minimum_bet: 5
                })
            });
            render(<CardDisplay tableId={mockTableId} />);
            await waitFor(() => {
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe('Betting Validation', () => {
        it('handles non-numeric bet input', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            const betInput = screen.getByLabelText(/Amount/i);
            fireEvent.change(betInput, { target: { value: 'abc' } });
            await waitFor(() => {
                expect(screen.getByText(/Your bet should be a valid number!/i)).toBeInTheDocument();
            });
        });

        it('handles bet above maximum', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            const betInput = screen.getByLabelText(/Amount/i);
            fireEvent.change(betInput, { target: { value: '20000' } });
            await waitFor(() => {
                expect(screen.getByText(/You cannot bet more than/i)).toBeInTheDocument();
            });
        });

        it('handles invalid bet increment', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            const betInput = screen.getByLabelText(/Amount/i);
            fireEvent.change(betInput, { target: { value: '7' } });
            await waitFor(() => {
                expect(screen.getByText(/Your bet must satisfy increments/i)).toBeInTheDocument();
            });
        });

        it('handles failed bet validation request', async () => {
            getDoc.mockRejectedValueOnce(new Error('Validation error'));
            render(<CardDisplay tableId={mockTableId} />);
            const betInput = screen.getByLabelText(/Amount/i);
            fireEvent.change(betInput, { target: { value: '100' } });
            await waitFor(() => {
                expect(screen.getByText(/Error validating bet/i)).toBeInTheDocument();
            });
        });
    });

    describe('Game Actions and State Changes', () => {
        it('handles failed game start', async () => {
            global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to start')));
            render(<CardDisplay tableId={mockTableId} />);

            const betInput = screen.getByLabelText(/Amount/i);
            fireEvent.change(betInput, { target: { value: '100' } });

            const startButton = await waitFor(() => screen.getByText(/Start Game/i));
            fireEvent.click(startButton);

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith('Game failed to start', expect.any(Error));
            });
        });

        it('handles hit action when not current player', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            await act(async () => {
                const betInput = screen.getByLabelText(/Amount/i);
                fireEvent.change(betInput, { target: { value: '100' } });

                const startButton = screen.getByText(/Start Game/i);
                fireEvent.click(startButton);
            });

            // Set different current player
            await act(async () => {
                global.fetch.mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            players: [
                                { hand: [{ suit: 'hearts', rank: 'A' }] }
                            ],
                            dealerHand: [{ suit: 'diamonds', rank: 'K' }],
                            currentPlayerIndex: 1
                        })
                    })
                );
            });

            const hitButton = await screen.findByText(/Hit/i);
            fireEvent.click(hitButton);
            expect(fetch).not.toHaveBeenCalledWith('http://localhost:8080/hit', expect.any(Object));
        });

        it('handles stand action when game is over', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            await act(async () => {
                const betInput = screen.getByLabelText(/Amount/i);
                fireEvent.change(betInput, { target: { value: '100' } });

                const startButton = screen.getByText(/Start Game/i);
                fireEvent.click(startButton);
            });

            // Set game over state
            await act(async () => {
                global.fetch.mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            players: [
                                { hand: [{ suit: 'hearts', rank: '10' }, { suit: 'spades', rank: 'K' }] }
                            ],
                            dealerHand: [{ suit: 'diamonds', rank: 'K' }],
                            currentPlayerIndex: 0,
                            gameStatus: {
                                endStatus: "GAME_OVER",
                                endMessage: "Game Over!"
                            }
                        })
                    })
                );
            });

            const standButton = await screen.findByText(/Stand/i);
            fireEvent.click(standButton);
            expect(fetch).not.toHaveBeenCalledWith('http://localhost:8080/stand', expect.any(Object));
        });

        it('handles ace prompt scenario', async () => {
            render(<CardDisplay tableId={mockTableId} />);

            await act(async () => {
                const betInput = screen.getByLabelText(/Amount/i);
                fireEvent.change(betInput, { target: { value: '100' } });

                const startButton = screen.getByText(/Start Game/i);
                fireEvent.click(startButton);
            });

            // Trigger ace prompt
            await act(async () => {
                global.fetch.mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            players: [
                                { hand: [{ suit: 'hearts', rank: 'A' }] }
                            ],
                            dealerHand: [{ suit: 'diamonds', rank: 'K' }],
                            currentPlayerIndex: 0,
                            hasAce: true
                        })
                    })
                );
            });

            await waitFor(() => {
                expect(screen.getByTestId('ace-modal')).toBeInTheDocument();
            });
        });
    });

    describe('Game Chat Functionality', () => {
        it('toggles chat visibility', async () => {
            render(<CardDisplay tableId={mockTableId} />);
            const chatIcon = screen.getByRole('button', { name: /message/i });
            fireEvent.click(chatIcon);
            expect(screen.getByText('Mock ChatBox')).toBeInTheDocument();
        });
    });
});