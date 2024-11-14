import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableList from '../app/lobby/TableList';

// Mock the CSS imports
jest.mock('../app/lobby/TableList.css', () => ({}));

// Mock child components with correct paths
jest.mock('../app/lobby/JoinTableButton', () => {
    return function MockJoinTableButton({ tableId, onJoinTable }) {
        return (
            <button
                data-testid={`join-table-${tableId}`}
                onClick={() => onJoinTable(tableId)}
            >
                Join Table
            </button>
        );
    };
});

jest.mock('../app/lobby/TableInfoButton', () => {
    return function MockTableInfoButton({ tableId }) {
        return (
            <button data-testid={`table-info-${tableId}`}>
                Table Info
            </button>
        );
    };
});

describe('TableList Component', () => {
    const mockTables = [
        {
            id: 1,
            table_Name: 'Test Table 1',
            max_players: 6,
            players: ['player1', 'player2'],
            minimum_bet: 10
        },
        {
            id: 2,
            table_Name: 'Test Table 2',
            max_players: 8,
            players: ['player1'],
            minimum_bet: 20
        }
    ];

    const mockUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
    ];

    const mockOnJoinTable = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );
        expect(screen.getByText('Test Table 1')).toBeInTheDocument();
    });

    test('displays correct number of tables', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );
        const tableElements = screen.getAllByRole('heading');
        expect(tableElements).toHaveLength(2);
    });

    test('displays correct table information', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );

        expect(screen.getByText('Test Table 1')).toBeInTheDocument();
        expect(screen.getByText(/Max Players: 6 \| Current Players: 2 \| Min Bet: \$10/)).toBeInTheDocument();
    });

    test('renders join and info buttons for each table', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );

        mockTables.forEach(table => {
            expect(screen.getByTestId(`join-table-${table.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`table-info-${table.id}`)).toBeInTheDocument();
        });
    });

    test('calls onJoinTable with correct table ID when join button is clicked', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );

        fireEvent.click(screen.getByTestId('join-table-1'));
        expect(mockOnJoinTable).toHaveBeenCalledWith(1);
    });

    test('displays "No tables available" message when tables array is empty', () => {
        render(
            <TableList
                tables={[]}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );

        expect(screen.getByText('No tables available. Create a new one to get started!')).toBeInTheDocument();
    });

    test('applies correct CSS classes for styling', () => {
        render(
            <TableList
                tables={mockTables}
                onJoinTable={mockOnJoinTable}
                users={mockUsers}
            />
        );

        const container = screen.getByRole('generic');
        expect(container).toHaveClass('TableList-container');
        expect(container).toHaveClass('mt-4');
        expect(container).toHaveClass('p-10');
    });
});