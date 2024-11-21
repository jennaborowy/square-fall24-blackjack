import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTableButton from '../app/lobby/CreateTableButton';

// Mock MUI Dialog components
jest.mock('@mui/material/Dialog', () => {
    return function Dialog({ children, open }) {
        return open ? <div data-testid="dialog-content">{children}</div> : null;
    };
});

jest.mock('@mui/material/DialogTitle', () => {
    return function DialogTitle({ children }) {
        return <div data-testid="dialog-title">{children}</div>;
    };
});

jest.mock('@mui/material/DialogContent', () => {
    return function DialogContent({ children }) {
        return <div data-testid="dialog-content-section">{children}</div>;
    };
});

jest.mock('@mui/material/DialogActions', () => {
    return function DialogActions({ children }) {
        return <div data-testid="dialog-actions">{children}</div>;
    };
});

describe('CreateTableButton Component', () => {
    const mockOnTableCreate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial Render and Dialog Operation', () => {
        test('renders create table button', () => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            expect(screen.getByText('Create Table')).toBeInTheDocument();
        });

        test('opens dialog when create button is clicked', () => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
            expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
            expect(screen.getByText('Create New Table')).toBeInTheDocument();
        });

        test('closes dialog when cancel button is clicked', () => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);

            // Open dialog
            fireEvent.click(screen.getByText('Create Table'));
            expect(screen.getByTestId('dialog-content')).toBeInTheDocument();

            // Close dialog
            fireEvent.click(screen.getByText('Cancel'));
            expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
        });

        test('shows validation errors when form is submitted empty', async () => {
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Table name is required')).toBeInTheDocument();
                expect(screen.getByText('Player amount is required')).toBeInTheDocument();
                expect(screen.getByText('Minimum bet is required')).toBeInTheDocument();
            });

            expect(mockOnTableCreate).not.toHaveBeenCalled();
        });

    });

    describe('Input Handling', () => {
        beforeEach(() => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));
        });

        test('handles text input for table name', () => {
            const input = screen.getByPlaceholderText('Enter table name');
            fireEvent.change(input, { target: { value: 'Test Table' } });
            expect(input.value).toBe('Test Table');
        });

        test('handles numeric input for player amount', () => {
            const input = screen.getByRole('spinbutton');
            fireEvent.change(input, { target: { value: '4' } });
            expect(input.value).toBe('4');
        });

        test('filters non-numeric input for minimum bet', () => {
            const input = screen.getByPlaceholderText('Enter minimum bet');
            fireEvent.change(input, { target: { value: 'abc123def' } });
            expect(input.value).toBe('123');
        });

        test('clears form after closing dialog', () => {
            // Fill in all fields
            fireEvent.change(screen.getByPlaceholderText('Enter table name'), {
                target: { value: 'Test Table' }
            });
            fireEvent.change(screen.getByRole('spinbutton'), {
                target: { value: '4' }
            });
            fireEvent.change(screen.getByPlaceholderText('Enter minimum bet'), {
                target: { value: '100' }
            });

            // Close dialog
            fireEvent.click(screen.getByText('Cancel'));

            // Reopen dialog
            fireEvent.click(screen.getByText('Create Table'));

            // Check if fields are cleared
            expect(screen.getByPlaceholderText('Enter table name').value).toBe('');
            expect(screen.getByRole('spinbutton').value).toBe('');
            expect(screen.getByPlaceholderText('Enter minimum bet').value).toBe('');
        });
    });

    describe('Form Submission', () => {
        test('successfully submits form with valid data', async () => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));

            // Fill in all fields with valid data
            fireEvent.change(screen.getByPlaceholderText('Enter table name'), {
                target: { value: 'Test Table' }
            });
            fireEvent.change(screen.getByRole('spinbutton'), {
                target: { value: '4' }
            });
            fireEvent.change(screen.getByPlaceholderText('Enter minimum bet'), {
                target: { value: '100' }
            });

            // Submit form
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(mockOnTableCreate).toHaveBeenCalledWith({
                    tableName: 'Test Table',
                    playerAmount: 4,
                    minBet: 100
                });
            });

            // Check if dialog is closed
            expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
        });

        test('clears errors when input is corrected', async () => {
            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));

            // Submit empty form to trigger errors
            fireEvent.click(screen.getByText('Create'));

            await waitFor(() => {
                expect(screen.getByText('Table name is required')).toBeInTheDocument();
            });

            // Correct the input
            fireEvent.change(screen.getByPlaceholderText('Enter table name'), {
                target: { value: 'Test Table' }
            });

            // Error should be cleared
            expect(screen.queryByText('Table name is required')).not.toBeInTheDocument();
        });
    });

    describe('Error States', () => {
        test('handles console logging of submission data', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            render(<CreateTableButton onTableCreate={mockOnTableCreate} />);
            fireEvent.click(screen.getByText('Create Table'));

            // Fill in valid data
            fireEvent.change(screen.getByPlaceholderText('Enter table name'), {
                target: { value: 'Test Table' }
            });
            fireEvent.change(screen.getByRole('spinbutton'), {
                target: { value: '4' }
            });
            fireEvent.change(screen.getByPlaceholderText('Enter minimum bet'), {
                target: { value: '100' }
            });

            // Submit form
            fireEvent.click(screen.getByText('Create'));

            expect(consoleSpy).toHaveBeenCalledWith(
                "Submitting table data:",
                expect.objectContaining({
                    tableName: 'Test Table',
                    playerAmount: 4,
                    minBet: 100
                })
            );

            consoleSpy.mockRestore();
        });
    });
});