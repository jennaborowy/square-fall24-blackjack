import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTableButton from '../app/lobby/CreateTableButton';

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

jest.mock('@mui/material', () => ({
    Dialog: ({ children, open, onClose }) => (
        open ? <div data-testid="mock-dialog" onClick={onClose}>{children}</div> : null
    ),
    DialogContent: ({ children }) => <div>{children}</div>,
    DialogContentText: ({ children }) => <div>{children}</div>,
    DialogTitle: ({ children }) => <div>{children}</div>,
    DialogActions: ({ children }) => <div>{children}</div>,
}));

describe('CreateTableButton', () => {
    const mockOnTableCreate = jest.fn();

    beforeEach(() => {
        mockOnTableCreate.mockClear();
        mockConsoleLog.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders create table button', () => {
        render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
        expect(screen.getByText('Create Table')).toBeInTheDocument();
    });

    it('opens dialog when create table button is clicked', () => {
        render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
        fireEvent.click(screen.getByText('Create Table'));
        expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
        expect(screen.getByText('Create New Table')).toBeInTheDocument();
    });

    it('closes dialog when clicking outside', () => {
        render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
        fireEvent.click(screen.getByText('Create Table'));
        fireEvent.click(screen.getByTestId('mock-dialog'));
        expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
        });

        it('shows validation errors when form is submitted empty', async () => {
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Table name is required')).toBeInTheDocument();
                expect(screen.getByText('Player amount is required')).toBeInTheDocument();
                expect(screen.getByText('Minimum bet is required')).toBeInTheDocument();
            });

            expect(mockOnTableCreate).not.toHaveBeenCalled();
        });

        it('validates player amount range - below minimum', async () => {
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);

            fireEvent.change(playerAmountInput, { target: { value: '0' } });
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Player amount must be between 1 and 6')).toBeInTheDocument();
            });
        });

        it('validates player amount range - above maximum', async () => {
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);

            fireEvent.change(playerAmountInput, { target: { value: '7' } });
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Player amount must be between 1 and 6')).toBeInTheDocument();
            });
        });

        it('validates minimum bet is positive', async () => {
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(minBetInput, { target: { value: '-100' } });
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Minimum bet must be a positive integer')).toBeInTheDocument();
            });
        });

        it('validates minimum bet is a number', async () => {
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);
            const tableNameInput = screen.getByLabelText(/Table Name/i);
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);

            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });
            fireEvent.change(playerAmountInput, { target: { value: '4' } });
            fireEvent.change(minBetInput, { target: { value: 'abc' } });
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Minimum bet must be a positive integer')).toBeInTheDocument();
            });
        });

        it('clears errors when input values change', async () => {
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Table name is required')).toBeInTheDocument();
            });

            const tableNameInput = screen.getByLabelText(/Table Name/i);
            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });

            expect(screen.queryByText('Table name is required')).not.toBeInTheDocument();
        });

        it('handles non-numeric input in player amount field', () => {
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);

            fireEvent.change(playerAmountInput, { target: { value: 'abc' } });
            expect(playerAmountInput.value).toBe('');
        });

        it('only allows numbers in minimum bet field', () => {
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(minBetInput, { target: { value: 'abc123def' } });
            expect(minBetInput.value).toBe('123');
        });
    });

    describe('Form State and Error Handling', () => {
        beforeEach(() => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
        });

        it('resets both form data and errors when dialog is closed', () => {
            const tableNameInput = screen.getByLabelText(/Table Name/i);

            fireEvent.change(tableNameInput, { target: { value: 'Test' } });
            fireEvent.click(screen.getByText('Create'));

            fireEvent.click(screen.getByText('Cancel'));

            fireEvent.click(screen.getByText('Create Table'));

            expect(tableNameInput.value).toBe('');
            expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
        });

        it('properly validates player amount when value exists but is invalid', async () => {
            const tableNameInput = screen.getByLabelText(/Table Name/i);
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            // Fill form with valid data except player amount
            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });
            fireEvent.change(playerAmountInput, { target: { value: '0' } });  // Invalid value
            fireEvent.change(minBetInput, { target: { value: '100' } });

            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Player amount must be between 1 and 6')).toBeInTheDocument();
            });
        });

        it('handles different input field changes correctly', () => {
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(playerAmountInput, { target: { name: 'playerAmount', value: '5' } });
            expect(playerAmountInput.value).toBe('5');

            fireEvent.change(minBetInput, { target: { name: 'minBet', value: 'abc123def' } });
            expect(minBetInput.value).toBe('123');

            const tableNameInput = screen.getByLabelText(/Table Name/i);
            fireEvent.change(tableNameInput, { target: { name: 'tableName', value: 'Test 123' } });
            expect(tableNameInput.value).toBe('Test 123');
        });

        it('handles complete form submission cycle with all validations', async () => {
            const tableNameInput = screen.getByLabelText(/Table Name/i);
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });
            fireEvent.change(playerAmountInput, { target: { value: '7' } }); // Invalid
            fireEvent.change(minBetInput, { target: { value: '-100' } }); // Invalid

            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Player amount must be between 1 and 6')).toBeInTheDocument();
                expect(screen.getByText('Minimum bet must be a positive integer')).toBeInTheDocument();
            });

            fireEvent.change(playerAmountInput, { target: { value: '6' } });
            fireEvent.change(minBetInput, { target: { value: '100' } });

            fireEvent.click(screen.getByText('Create'));

            expect(mockOnTableCreate).toHaveBeenCalledWith({
                tableName: 'Test Table',
                playerAmount: 6,
                minBet: 100
            });

            // Verify dialog is closed and console.log was called
            expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
            expect(mockConsoleLog).toHaveBeenCalledWith("Submitting table data:", expect.any(Object));
        });
    });

    describe('Form Submission', () => {
        beforeEach(() => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
        });

        it('successfully submits form with valid data - minimum values', async () => {
            const tableNameInput = screen.getByLabelText(/Table Name/i);
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });
            fireEvent.change(playerAmountInput, { target: { value: '1' } });
            fireEvent.change(minBetInput, { target: { value: '1' } });

            fireEvent.click(screen.getByText('Create'));

            expect(mockOnTableCreate).toHaveBeenCalledWith({
                tableName: 'Test Table',
                playerAmount: 1,
                minBet: 1
            });
        });

        it('successfully submits form with valid data - maximum values', async () => {
            const tableNameInput = screen.getByLabelText(/Table Name/i);
            const playerAmountInput = screen.getByLabelText(/Player Amount/i);
            const minBetInput = screen.getByLabelText(/Minimum Bet/i);

            fireEvent.change(tableNameInput, { target: { value: 'Test Table' } });
            fireEvent.change(playerAmountInput, { target: { value: '6' } });
            fireEvent.change(minBetInput, { target: { value: '1000' } });

            fireEvent.click(screen.getByText('Create'));

            expect(mockOnTableCreate).toHaveBeenCalledWith({
                tableName: 'Test Table',
                playerAmount: 6,
                minBet: 1000
            });
        });
    });
});