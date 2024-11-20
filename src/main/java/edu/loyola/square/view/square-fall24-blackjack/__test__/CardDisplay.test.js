import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import CardDisplay from '../app/gameplay/components/CardDisplay';

// Mock Firebase Auth and Firestore
jest.mock('@/firebaseConfig', () => ({
    auth: {
        currentUser: {
            uid: 'test-user-id'
        }
    },
    db: {}
}));

// Mock components
jest.mock('../app/messages/tablechat/tablechat', () => {
    return function MockTableChat({ onClose, db, tableId }) {
        return (
            <div data-testid="mock-table-chat">
                <button onClick={onClose}>Close Table Chat</button>
            </div>
        );
    };
});

jest.mock('@/app/messages/chatbox/chatbox', () => {
    return function MockChatBox({ onClose }) {
        return (
            <div data-testid="mock-chat-box">
                <button onClick={onClose}>Close Chat</button>
            </div>
        );
    };
});

// Mock session storage
const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Enhanced Firestore mocking with more game states
jest.mock('firebase/firestore', () => {
    let mockData = {
        minimum_bet: 10,
        players: ['test-user-id', 'player-2'],
        playerBets: {
            'test-user-id': { amount: 100, isValid: true },
            'player-2': { amount: 150, isValid: true }
        },
        playerHands: {
            'test-user-id': [{ rank: '10', suit: 'H' }],
            'player-2': [{ rank: 'J', suit: 'S' }]
        },
        dealerHand: [{ rank: 'A', suit: 'S' }],
        gameStarted: false,
        playerIndex: 0,
        handledAces: {},
        playerStatuses: {},
        gameStatus: { endStatus: 'IN_PROGRESS' }
    };

    const updateMockData = (newData) => {
        mockData = { ...mockData, ...newData };
    };

    return {
        doc: jest.fn(),
        getDoc: jest.fn(() => Promise.resolve({
            exists: () => true,
            data: () => ({ ...mockData })
        })),
        deleteDoc: jest.fn(),
        updateDoc: jest.fn((ref, updates) => {
            updateMockData(updates);
            return Promise.resolve();
        }),
        onSnapshot: jest.fn((ref, callback) => {
            callback({
                exists: () => true,
                data: () => ({ ...mockData })
            });
            return jest.fn(); // Cleanup function
        }),
        arrayRemove: jest.fn()
    };
});

// Enhanced API response mocking
const mockFetchResponses = {
    gamestart: {
        dealerHand: [{ rank: 'K', suit: 'H' }],
        players: [
            { hand: [{ rank: '10', suit: 'S' }], value: 10, isActive: true },
            { hand: [{ rank: 'J', suit: 'C' }], value: 10, isActive: true }
        ],
        currentPlayerIndex: 0,
        gameStatus: { endStatus: "CONTINUE" }
    },
    hit: {
        dealerHand: [{ rank: 'K', suit: 'H' }],
        players: [
            { hand: [{ rank: '10', suit: 'S' }, { rank: '7', suit: 'H' }], value: 17, isActive: true },
            { hand: [{ rank: 'J', suit: 'C' }], value: 10, isActive: true }
        ],
        currentPlayerIndex: 0,
        gameStatus: { endStatus: "CONTINUE" }
    },
    stand: {
        dealerHand: [{ rank: 'K', suit: 'H' }, { rank: '6', suit: 'D' }],
        players: [
            { hand: [{ rank: '10', suit: 'S' }], value: 10, isActive: false },
            { hand: [{ rank: 'J', suit: 'C' }], value: 10, isActive: true }
        ],
        currentPlayerIndex: 1,
        gameStatus: { endStatus: "NEXT_PLAYER" }
    },
    dealerTurn: {
        dealerHand: [{ rank: 'K', suit: 'H' }, { rank: '6', suit: 'D' }, { rank: '5', suit: 'C' }],
        dealerValue: 21,
        gameStatus: { endStatus: "GAME_OVER" }
    },
    setAce: {
        players: [{ hand: [{ rank: 'A', suit: 'H' }], value: 11, isActive: true }],
        gameStatus: { endStatus: "CONTINUE" }
    }
};

global.fetch = jest.fn((url) => {
    const endpoint = url.split('/').pop();
    if (!mockFetchResponses[endpoint]) {
        return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
    }
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponses[endpoint])
    });
});

describe('CardDisplay Component Error Handling', () => {
    const mockTableId = 'test-table-id';

    beforeEach(() => {
        jest.clearAllMocks();
        delete window.location;
        window.location = { href: '' };
        mockSessionStorage.clear();
        // Restore fetch mock to default success state
        global.fetch.mockImplementation((url) => {
            const endpoint = url.split('/').pop();
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockFetchResponses[endpoint] || {})
            });
        });
    });

    // Test backend error responses
    test('handles failed game start', async () => {
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
                error: "Server error during game start"
            })
        }));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '50' } });
            fireEvent.click(screen.getByText(/Start Game/i));
        });

        expect(console.error).toHaveBeenCalled();
    });

    test('handles hit action failure', async () => {
        // First mock success for game start
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockFetchResponses.gamestart)
        }));

        // Then mock failure for hit
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({
                error: "Invalid player state for hit",
                playerStatus: "PLAYER_BUST",
                playerIndex: 0,
                currentPlayer: "test-user-id"
            })
        }));

        render(<CardDisplay tableId={mockTableId} />);

        // Start game
        await act(async () => {
            fireEvent.click(screen.getByText(/Start Game/i));
        });

        // Try to hit
        await act(async () => {
            fireEvent.click(screen.getByText(/Hit/i));
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Hit failed")
        );
    });

    test('handles stand action failure', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockFetchResponses.gamestart)
            }))
            .mockImplementationOnce(() => Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({
                    error: "Invalid player state for stand"
                })
            }));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            fireEvent.click(screen.getByText(/Start Game/i));
            fireEvent.click(screen.getByText(/Stand/i));
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Stand failed")
        );
    });

    test('handles ace prompt failure', async () => {
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({
                error: "Invalid ace value selection"
            })
        }));

        render(<CardDisplay tableId={mockTableId} />);

        // Simulate hand with ace
        act(() => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['test-user-id'],
                    playerIndex: 0,
                    playerHands: {
                        'test-user-id': [{ rank: 'A', suit: 'H' }]
                    },
                    handledAces: {}
                })
            });
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Set Ace to 1/i));
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Prompt Ace failed")
        );
    });

    test('handles dealer turn failure', async () => {
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
                error: "Dealer play failed"
            })
        }));

        render(<CardDisplay tableId={mockTableId} />);

        // Simulate game state where dealer should play
        act(() => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['test-user-id'],
                    playerIndex: 1, // Past last player
                    playerHands: {
                        'test-user-id': [{ rank: '10', suit: 'H' }]
                    },
                    playerTurnComplete: {
                        'test-user-id': true
                    }
                })
            });
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Dealer play failed")
        );
    });

    test('handles network timeout', async () => {
        global.fetch.mockImplementationOnce(() => new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 1000);
        }));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            fireEvent.click(screen.getByText(/Start Game/i));
        });

        expect(console.error).toHaveBeenCalled();
    });

    test('handles invalid table ID', async () => {
        // Mock Firebase error for invalid table
        jest.mocked(jest.requireMock('firebase/firestore').getDoc)
            .mockImplementationOnce(() => Promise.resolve({
                exists: () => false,
                data: () => null
            }));

        render(<CardDisplay tableId="invalid-table-id" />);

        expect(screen.queryByText(/Start Game/i)).not.toBeInTheDocument();
    });

    test('handles Firebase update failures', async () => {
        // Mock Firebase updateDoc to fail
        jest.mocked(jest.requireMock('firebase/firestore').updateDoc)
            .mockImplementationOnce(() => Promise.reject(new Error('Firebase update failed')));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '50' } });
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Error updating bet in Firestore")
        );
    });

    test('handles Firebase subscription errors', async () => {
        // Mock Firebase onSnapshot to emit error
        jest.mocked(jest.requireMock('firebase/firestore').onSnapshot)
            .mockImplementationOnce((_, __, errorCallback) => {
                errorCallback(new Error('Subscription error'));
                return jest.fn();
            });

        render(<CardDisplay tableId={mockTableId} />);

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Error in real-time listener")
        );
    });

    test('handles endgame failure', async () => {
        global.fetch.mockImplementationOnce(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
                error: "Failed to end game"
            })
        }));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            fireEvent.click(screen.getByText(/Leave Game/i));
        });

        expect(console.error).toHaveBeenCalled();
        // Should still redirect to lobby even on failure
        expect(window.location.href).toBe('/lobby');
    });

    test('handles multiple simultaneous errors', async () => {
        // Mock both Firebase and API failures
        jest.mocked(jest.requireMock('firebase/firestore').updateDoc)
            .mockImplementationOnce(() => Promise.reject(new Error('Firebase update failed')));

        global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API failed')));

        render(<CardDisplay tableId={mockTableId} />);

        await act(async () => {
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '50' } });
            fireEvent.click(screen.getByText(/Start Game/i));
        });

        expect(console.error).toHaveBeenCalledTimes(2);
    });

    test('handles invalid game state transitions', async () => {
        render(<CardDisplay tableId={mockTableId} />);

        // Try to hit without game started
        await act(async () => {
            const hitButton = screen.getByText(/Hit/i);
            fireEvent.click(hitButton);
        });

        // Try to stand without game started
        await act(async () => {
            const standButton = screen.getByText(/Stand/i);
            fireEvent.click(standButton);
        });

        // Try to handle ace without proper state
        act(() => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: false,
                    players: ['test-user-id'],
                    playerIndex: 0,
                    playerHands: {
                        'test-user-id': [{ rank: 'A', suit: 'H' }]
                    }
                })
            });
        });

        expect(screen.queryByText(/Set Ace to 1/i)).not.toBeInTheDocument();
    });

    test('processes game results correctly', async () => {
        render(<CardDisplay tableId={mockTableId} />);

        // Mock Firestore document snapshots for users
        const mockUserData = {
            'test-user-id': {
                totalWins: 5,
                totalLosses: 3,
                chipBalance: 1000
            },
            'player-2': {
                totalWins: 2,
                totalLosses: 1,
                chipBalance: 500
            }
        };

        // Mock getDoc to return user data
        jest.mocked(jest.requireMock('firebase/firestore').getDoc)
            .mockImplementation((docRef) => {
                const userId = docRef.path.split('/').pop();
                return Promise.resolve({
                    exists: () => true,
                    data: () => mockUserData[userId]
                });
            });

        // Set up initial game state
        await act(async () => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['test-user-id', 'player-2'],
                    playerBets: {
                        'test-user-id': { amount: 100, isValid: true },
                        'player-2': { amount: 150, isValid: true }
                    },
                    playerHands: {
                        'test-user-id': [{ rank: '10', suit: 'H' }, { rank: '8', suit: 'C' }],
                        'player-2': [{ rank: 'K', suit: 'S' }, { rank: '5', suit: 'D' }]
                    },
                    dealerHand: [{ rank: 'J', suit: 'H' }, { rank: '7', suit: 'S' }],
                    playerIndex: 2 // Past all players to trigger dealer turn
                })
            });
        });

        // Trigger game end with different scenarios
        await act(async () => {
            const mockResults = {
                dealerHand: [{ rank: 'J', suit: 'H' }, { rank: '7', suit: 'S' }],
                players: [
                    { hand: [{ rank: '10', suit: 'H' }, { rank: '8', suit: 'C' }], value: 18 },
                    { hand: [{ rank: 'K', suit: 'S' }, { rank: '5', suit: 'D' }], value: 25 }
                ],
                dealerValue: 17
            };

            // Mock dealer turn response
            global.fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResults)
            }));

            // Stand to trigger dealer turn
            fireEvent.click(screen.getByText(/Stand/i));
        });

        // Verify user stats were updated correctly
        const updateDocMock = jest.mocked(jest.requireMock('firebase/firestore').updateDoc);

        // First player wins (18 vs dealer's 17)
        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalWins: 6,
                chipBalance: 1100 // Original 1000 + 100 bet
            })
        );

        // Second player busts (25)
        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalLosses: 2,
                chipBalance: 350 // Original 500 - 150 bet
            })
        );
    });

    test('handles missing user data during game results', async () => {
        render(<CardDisplay tableId={mockTableId} />);

        // Mock getDoc to return non-existent user
        jest.mocked(jest.requireMock('firebase/firestore').getDoc)
            .mockImplementation(() => Promise.resolve({
                exists: () => false,
                data: () => null
            }));

        await act(async () => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['non-existent-user'],
                    playerBets: {
                        'non-existent-user': { amount: 100, isValid: true }
                    },
                    playerHands: {
                        'non-existent-user': [{ rank: '10', suit: 'H' }]
                    },
                    dealerHand: [{ rank: 'J', suit: 'H' }],
                    playerIndex: 1
                })
            });
        });

        // Verify that the game continues without error
        expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
    });

    test('processes all possible game outcomes', async () => {
        render(<CardDisplay tableId={mockTableId} />);

        const mockUserData = {
            'player-1': { totalWins: 0, totalLosses: 0, chipBalance: 1000 },
            'player-2': { totalWins: 0, totalLosses: 0, chipBalance: 1000 },
            'player-3': { totalWins: 0, totalLosses: 0, chipBalance: 1000 },
            'player-4': { totalWins: 0, totalLosses: 0, chipBalance: 1000 },
            'player-5': { totalWins: 0, totalLosses: 0, chipBalance: 1000 }
        };

        // Mock getDoc for all users
        jest.mocked(jest.requireMock('firebase/firestore').getDoc)
            .mockImplementation((docRef) => {
                const userId = docRef.path.split('/').pop();
                return Promise.resolve({
                    exists: () => true,
                    data: () => mockUserData[userId]
                });
            });

        // Set up game with multiple scenarios
        await act(async () => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
                    playerBets: {
                        'player-1': { amount: 100, isValid: true }, // Will bust
                        'player-2': { amount: 100, isValid: true }, // Will win
                        'player-3': { amount: 100, isValid: true }, // Will lose
                        'player-4': { amount: 100, isValid: true }, // Will push
                        'player-5': { amount: 100, isValid: true }  // Will get blackjack
                    },
                    playerHands: {
                        'player-1': [{ rank: '10', suit: 'H' }, { rank: 'K', suit: 'C' }, { rank: '5', suit: 'D' }], // 25 (bust)
                        'player-2': [{ rank: '10', suit: 'H' }, { rank: '9', suit: 'C' }], // 19 (win)
                        'player-3': [{ rank: '10', suit: 'H' }, { rank: '5', suit: 'C' }], // 15 (lose)
                        'player-4': [{ rank: '10', suit: 'H' }, { rank: '7', suit: 'C' }], // 17 (push)
                        'player-5': [{ rank: 'A', suit: 'H' }, { rank: 'K', suit: 'C' }]  // 21 (blackjack)
                    },
                    dealerHand: [{ rank: '10', suit: 'H' }, { rank: '7', suit: 'S' }] // 17
                })
            });
        });

        const updateDocMock = jest.mocked(jest.requireMock('firebase/firestore').updateDoc);

        // Verify all outcomes were processed correctly
        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalLosses: 1,
                chipBalance: 900 // Player 1 - Bust
            })
        );

        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalWins: 1,
                chipBalance: 1100 // Player 2 - Win
            })
        );

        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalLosses: 1,
                chipBalance: 900 // Player 3 - Lose
            })
        );

        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                chipBalance: 1000 // Player 4 - Push (no change)
            })
        );

        expect(updateDocMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                totalWins: 1,
                chipBalance: 1150 // Player 5 - Blackjack (1.5x payout)
            })
        );
    });

    test('handles database errors during result processing', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<CardDisplay tableId={mockTableId} />);

        // Mock updateDoc to fail
        jest.mocked(jest.requireMock('firebase/firestore').updateDoc)
            .mockRejectedValueOnce(new Error('Database error'));

        await act(async () => {
            jest.mocked(jest.requireMock('firebase/firestore').onSnapshot).mock.calls[0][1]({
                exists: () => true,
                data: () => ({
                    gameStarted: true,
                    players: ['test-user-id'],
                    playerBets: {
                        'test-user-id': { amount: 100, isValid: true }
                    },
                    playerHands: {
                        'test-user-id': [{ rank: '10', suit: 'H' }, { rank: 'K', suit: 'C' }]
                    },
                    dealerHand: [{ rank: '10', suit: 'H' }, { rank: '7', suit: 'S' }],
                    playerIndex: 1
                })
            });
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});