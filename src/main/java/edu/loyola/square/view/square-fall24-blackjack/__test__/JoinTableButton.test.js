import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import JoinTableButton from '../app/lobby/JoinTableButton';
import { useRouter } from 'next/navigation';
import { auth } from '../firebaseConfig';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('../firebaseConfig', () => ({
    auth: {
        currentUser: null
    }
}));

jest.mock('../app/lobby/JoinTable.css', () => ({}));

describe('JoinTableButton Component', () => {
    const mockRouter = {
        push: jest.fn()
    };

    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const defaultProps = {
        tableId: 'table123',
        table: {
            max_players: 6,
            players: ['player1', 'player2'],
            name: 'Test Table'
        },
        onJoinTable: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
        window.sessionStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        test('renders with all props combinations', () => {
            const { rerender } = render(<JoinTableButton {...defaultProps} />);
            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<JoinTableButton tableId="123" onJoinTable={jest.fn()} />);
            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<JoinTableButton tableId="123" onJoinTable={jest.fn()} table={null} />);
            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<JoinTableButton tableId="123" onJoinTable={jest.fn()} table={{}} />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        test('handles null and undefined values in table object', () => {
            const { rerender } = render(
                <JoinTableButton
                    {...defaultProps}
                    table={{
                        max_players: null,
                        players: undefined,
                        name: null
                    }}
                />
            );
            expect(screen.getByRole('button')).toHaveTextContent('Join Table');

            rerender(
                <JoinTableButton
                    {...defaultProps}
                    table={{
                        max_players: undefined,
                        players: null,
                        name: undefined
                    }}
                />
            );
            expect(screen.getByRole('button')).toHaveTextContent('Join Table');
        });
    });

    describe('Authentication Handling', () => {
        test('handles all authentication states', async () => {
            auth.currentUser = null;
            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.getByText('Please log in to join a table')).toBeInTheDocument();
            });

            auth.currentUser = undefined;
            rerender(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.getByText('Please log in to join a table')).toBeInTheDocument();
            });

            auth.currentUser = {};
            rerender(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.getByText('Please log in to join a table')).toBeInTheDocument();
            });
        });

        test('handles authentication state changes', async () => {
            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            // Start with no user
            auth.currentUser = null;
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.getByText('Please log in to join a table')).toBeInTheDocument();
            });

            // Change to authenticated user
            auth.currentUser = { uid: 'user123' };
            rerender(<JoinTableButton {...defaultProps} />);
            defaultProps.onJoinTable.mockResolvedValueOnce(true);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(sessionStorage.getItem('playerId')).toBe('user123');
            });
        });
    });

    describe('Table State Handling', () => {
        test('handles all possible table states', () => {
            const tableStates = [
                { max_players: 0, players: [] },
                { max_players: 1, players: [] },
                { max_players: 1, players: ['player1'] },
                { max_players: 2, players: ['player1'] },
                { max_players: 2, players: ['player1', 'player2'] },
                { max_players: 2, players: ['player1', 'player2', 'player3'] },
            ];

            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            tableStates.forEach(tableState => {
                rerender(<JoinTableButton {...defaultProps} table={{ ...defaultProps.table, ...tableState }} />);
                const button = screen.getByRole('button');
                const isFull = (tableState.players?.length || 0) >= (tableState.max_players || 0);
                expect(button).toHaveTextContent(isFull ? 'Table Full' : 'Join Table');
                expect(button).toHaveStyle({ opacity: isFull ? '0.5' : '1' });
            });
        });
    });

    describe('Join Table Process', () => {
        test('handles all steps of successful join process', async () => {
            auth.currentUser = { uid: 'user123' };
            defaultProps.onJoinTable.mockResolvedValueOnce(true);

            render(<JoinTableButton {...defaultProps} />);

            await act(async () => {
                fireEvent.click(screen.getByRole('button'));
            });

            await waitFor(() => {
                expect(defaultProps.onJoinTable).toHaveBeenCalledWith('table123', 'user123');
                expect(sessionStorage.getItem('gameTableId')).toBe('table123');
                expect(sessionStorage.getItem('playerId')).toBe('user123');
                expect(sessionStorage.getItem('tableName')).toBe('Test Table');
                expect(mockRouter.push).toHaveBeenCalledWith('/gameplay/table123');
            });
        });

        test('handles failed join process with different error types', async () => {
            auth.currentUser = { uid: 'user123' };

            const errorTypes = [
                new Error('Network error'),
                new TypeError('Type error'),
                new Error('Server error'),
                { message: 'Custom error object' },
                'String error',
                null
            ];

            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            for (const error of errorTypes) {
                defaultProps.onJoinTable.mockRejectedValueOnce(error);

                await act(async () => {
                    fireEvent.click(screen.getByRole('button'));
                });

                await waitFor(() => {
                    expect(screen.getByText('Failed to join table. Please try again.')).toBeInTheDocument();
                });

                rerender(<JoinTableButton {...defaultProps} />);
            }
        });
    });

    describe('Session Storage Handling', () => {
        test('handles session storage errors', async () => {
            auth.currentUser = { uid: 'user123' };
            defaultProps.onJoinTable.mockResolvedValueOnce(true);

            const storageErrors = [
                new Error('QuotaExceededError'),
                new Error('SecurityError'),
                new Error('Unknown Error')
            ];

            for (const error of storageErrors) {
                jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
                    throw error;
                });

                render(<JoinTableButton {...defaultProps} />);

                await act(async () => {
                    fireEvent.click(screen.getByRole('button'));
                });

                await waitFor(() => {
                    expect(screen.getByText('Failed to join table. Please try again.')).toBeInTheDocument();
                    expect(mockConsoleError).toHaveBeenCalled();
                });
            }
        });
    });

    describe('Error State Management', () => {
        test('handles error state transitions', async () => {
            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.getByText('Please log in to join a table')).toBeInTheDocument();
            });

            auth.currentUser = { uid: 'user123' };
            defaultProps.onJoinTable.mockResolvedValueOnce(true);
            rerender(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.queryByText('Please log in to join a table')).not.toBeInTheDocument();
            });
        });
    });

    describe('Style and UI States', () => {
        test('applies all possible style combinations', () => {
            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            let button = screen.getByRole('button');
            expect(button).toHaveStyle({
                color: 'white',
                textTransform: 'none',
                fontWeight: '500',
                opacity: '1',
                cursor: 'pointer'
            });

            rerender(
                <JoinTableButton
                    {...defaultProps}
                    table={{
                        ...defaultProps.table,
                        max_players: 2,
                        players: ['player1', 'player2']
                    }}
                />
            );

            button = screen.getByRole('button');
            expect(button).toHaveStyle({
                opacity: '0.5',
                cursor: 'not-allowed',
                pointerEvents: 'none'
            });
        });

        test('handles dynamic style updates', async () => {
            const { rerender } = render(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                const errorMessage = screen.getByText('Please log in to join a table');
                expect(errorMessage).toHaveStyle({
                    color: 'red',
                    marginTop: '5px'
                });
            });

            auth.currentUser = { uid: 'user123' };
            defaultProps.onJoinTable.mockResolvedValueOnce(true);
            rerender(<JoinTableButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(screen.queryByText('Please log in to join a table')).not.toBeInTheDocument();
            });
        });
    });
});