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

jest.mock('@/app/lobby/TableList', () => {
    return function MockTableList({ tables, onJoinTable }) {
        return (
            <div data-testid="table-list">
                {tables.map(table => (
                    <button
                        key={table.id}
                        onClick={() => onJoinTable(table.id)}
                        data-testid={`join-table-${table.id}`}
                    >
                        Join {table.table_Name}
                    </button>
                ))}
            </div>
        );
    };
});

jest.mock('@/app/lobby/CreateTableButton', () => {
    return function MockCreateTableButton({ onTableCreate }) {
        return (
            <button
                onClick={() => onTableCreate({
                    tableName: 'Test Table',
                    playerAmount: 4,
                    minBet: 100
                })}
                data-testid="create-table-button"
            >
                Create Table
            </button>
        );
    };
});

// Mock MUI Dialog
jest.mock('@mui/material/Dialog', () => {
    return function Dialog({ children, open }) {
        return open ? <div data-testid="dialog-content">{children}</div> : null;
    };
});

describe('Lobby Component', () => {
    const mockRouter = {
        push: jest.fn()
    };
    const mockUser = { uid: 'test-uid' };


    const mockUnsubscribe = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);


        mockRouter.push.mockReset();
        mockUnsubscribe.mockClear();


        // Mock getDoc for user chip balance
        getDoc.mockImplementation(() => ({
            exists: () => true,
            data: () => ({ chipBalance: 1000 })
        }));
    });

    it('renders lobby components correctly', () => {
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
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback({ uid: 'test-user-id' });
            return mockUnsubscribe;
        });
        render(<Lobby />);

        expect(screen.getByText('Welcome to the Lobby!')).toBeInTheDocument();
        expect(screen.getByTestId('table-list')).toBeInTheDocument();
        expect(screen.getByTestId('create-table-button')).toBeInTheDocument();
    });

    it('handles null user', () => {
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
        auth.currentUser = null;
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback(null);
            return mockUnsubscribe;
        });
        render(<Lobby />);

        expect(screen.getByText('Welcome to the Lobby!')).toBeInTheDocument();
        expect(screen.getByTestId('table-list')).toBeInTheDocument();
        expect(screen.getByTestId('create-table-button')).toBeInTheDocument();
    });

    it('handles chip balance reset when balance is 0', async () => {
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
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });

        getDoc.mockImplementationOnce(() => ({
            exists: () => true,
            data: () => ({ chipBalance: 0 })
        }));

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByText("It seems that youve ran out of chips... Have some more")).toBeInTheDocument();
            expect(screen.getByText("New chip balance: 2500")).toBeInTheDocument();
        });

    });

    it('handles table creation', async () => {
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
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });

        const mockDocRef = { id: 'new-table-id' };
        addDoc.mockResolvedValueOnce(mockDocRef);
        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                players: [],
                createdBy: mockUser.uid
            })
        });

        render(<Lobby />);

        fireEvent.click(screen.getByTestId('create-table-button'));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/gameplay/new-table-id');
        });
    });
    it('handles joining existing table', async () => {
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });

        const mockTable = {
            id: 'table1',
            table_Name: 'Table 1',
            players: ['user1'],
            max_players: 2,
            minimum_bet: 100,
            createdBy: 'user1'
        };

        onSnapshot.mockImplementation((query, callback) => {
            callback({
                docs: [{
                    id: mockTable.id,
                    data: () => mockTable
                }]
            });
            return jest.fn();
        });

        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({
                players: ['user1'],
                max_players: 2,
                createdBy: 'user1'
            })
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByTestId(`join-table-${mockTable.id}`)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId(`join-table-${mockTable.id}`));

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
            expect(mockRouter.push).toHaveBeenCalledWith(`/gameplay/${mockTable.id}`);
        });
    });

    it('displays current chip balance', async () => {
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });

        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ chipBalance: 1000 })
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByText('$1000')).toBeInTheDocument();
        });
    });

    it('closes chip balance popup', async () => {
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });

        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ chipBalance: 0 })
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByText(/It seems that youve ran out of chips/)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Ok'));

        await waitFor(() => {
            expect(screen.queryByText(/It seems that youve ran out of chips/)).not.toBeInTheDocument();
        });
    });


    it('handles addDoc error during table creation', async () => {
        auth.currentUser = mockUser;
        auth.onAuthStateChanged.mockImplementation(callback => {
            callback(mockUser);
            return mockUnsubscribe;
        });
        // Mock console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock addDoc to throw an error
        const mockError = new Error('Failed to add document');
        addDoc.mockRejectedValueOnce(mockError);

        render(<Lobby />);

        // Trigger table creation
        fireEvent.click(screen.getByTestId('create-table-button'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error creating table: ",
                mockError
            );
            // Verify navigation didn't occur
            expect(mockRouter.push).not.toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

});