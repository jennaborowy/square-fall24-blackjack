import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lobby from '../app/lobby/page';
import { auth, db } from "@/firebaseConfig";
import { collection, addDoc, onSnapshot, query, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock Firebase
jest.mock('@/firebaseConfig', () => ({
    auth: {
        currentUser: null,
        onAuthStateChanged: jest.fn()
    },
    db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
    arrayUnion: jest.fn()
}));

// Mock child components
jest.mock('@/app/lobby/TableList', () => {
    return jest.fn(({ tables, onJoinTable }) => (
        <div data-testid="table-list">
            {tables.map(table => (
                <div key={table.id}>
                    <span>{table.table_Name}</span>
                    <button onClick={() => onJoinTable(table.id)}>Join Table</button>
                </div>
            ))}
        </div>
    ));
});

jest.mock('@/app/lobby/CreateTableButton', () => {
    return jest.fn(({ onTableCreate }) => (
        <button
            data-testid="create-table-button"
            onClick={() => onTableCreate({
                tableName: 'Test Table',
                playerAmount: '4',
                minBet: 100
            })}
        >
            Create Table
        </button>
    ));
});

describe('Lobby Component', () => {
    const mockRouter = {
        push: jest.fn()
    };
    const mockUser = { uid: 'test-uid' };
    const mockTables = [
        {
            id: 'table1',
            table_Name: 'Table 1',
            players: ['user1'],
            max_players: 4,
            minimum_bet: 100,
            createdBy: 'user1'
        }
    ];
    const mockUsers = [
        { id: 'user1', username: 'TestUser1' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
        auth.currentUser = mockUser;

        // Mock onSnapshot for tables and users
        onSnapshot.mockImplementation((query, callback) => {
            callback({
                docs: mockTables.map(table => ({
                    id: table.id,
                    data: () => table
                }))
            });
            return jest.fn(); // Cleanup function
        });

        // Mock getDoc for user chip balance
        getDoc.mockImplementation(() => ({
            exists: () => true,
            data: () => ({ chipBalance: 1000 })
        }));
    });

    it('renders lobby components correctly', () => {
        render(<Lobby />);

        expect(screen.getByText('Welcome to the Lobby!')).toBeInTheDocument();
        expect(screen.getByTestId('table-list')).toBeInTheDocument();
        expect(screen.getByTestId('create-table-button')).toBeInTheDocument();
    });

    it('handles chip balance reset when balance is 0', async () => {
        getDoc.mockImplementationOnce(() => ({
            exists: () => true,
            data: () => ({ chipBalance: 0 })
        }));

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByText("It seems that youve ran out of chips... Have some more")).toBeInTheDocument();
            expect(screen.getByText("New chip balance: 2500")).toBeInTheDocument();
        });

        // Test popup close
        fireEvent.click(screen.getByText('Ok'));
        expect(screen.queryByText("It seems that youve ran out of chips... Have some more")).not.toBeInTheDocument();
    });

    it('handles table creation', async () => {
        addDoc.mockResolvedValueOnce({ id: 'new-table-id' });
        updateDoc.mockResolvedValueOnce();

        render(<Lobby />);

        const createButton = screen.getByTestId('create-table-button');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    table_Name: 'Test Table',
                    max_players: 4,
                    minimum_bet: 100,
                    players: [],
                    createdBy: 'test-uid'
                })
            );
            expect(mockRouter.push).toHaveBeenCalledWith('/gameplay/new-table-id');
        });
    });

    it('handles joining existing table', async () => {
        getDoc.mockImplementationOnce(() => ({
            exists: () => true,
            data: () => ({
                players: ['user1'],
                max_players: 4,
                createdBy: 'user1'
            })
        }));

        render(<Lobby />);

        const joinButton = screen.getByText('Join Table');
        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    players: expect.anything()
                })
            );
            expect(mockRouter.push).toHaveBeenCalledWith('/gameplay/table1');
        });
    });

    it('prevents joining full table', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        getDoc.mockImplementationOnce(() => ({
            exists: () => true,
            data: () => ({
                players: ['user1', 'user2', 'user3', 'user4'],
                max_players: 4,
                createdBy: 'user1'
            })
        }));

        render(<Lobby />);

        const joinButton = screen.getByText('Join Table');
        fireEvent.click(joinButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error joining table:',
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    it('handles table creation error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        addDoc.mockRejectedValueOnce(new Error('Failed to create table'));

        render(<Lobby />);

        const createButton = screen.getByTestId('create-table-button');
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error creating table: ',
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    it('handles realtime updates to tables', async () => {
        const updatedTables = [
            ...mockTables,
            {
                id: 'table2',
                table_Name: 'Table 2',
                players: ['user2'],
                max_players: 4,
                minimum_bet: 100,
                createdBy: 'user2'
            }
        ];

        render(<Lobby />);

        // Simulate realtime update
        onSnapshot.mockImplementationOnce((query, callback) => {
            callback({
                docs: updatedTables.map(table => ({
                    id: table.id,
                    data: () => table
                }))
            });
            return jest.fn();
        });

        await waitFor(() => {
            expect(screen.getByText('Table 2')).toBeInTheDocument();
        });
    });

    it('handles cleanup on unmount', () => {
        const unsubscribeMock = jest.fn();
        onSnapshot.mockImplementation(() => unsubscribeMock);

        const { unmount } = render(<Lobby />);
        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('handles user not authenticated', () => {
        auth.currentUser = null;
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback(null);
            return jest.fn();
        });

        render(<Lobby />);

        expect(screen.getByText('Welcome to the Lobby!')).toBeInTheDocument();
        expect(screen.queryByText('$')).toBeInTheDocument();
    });
});