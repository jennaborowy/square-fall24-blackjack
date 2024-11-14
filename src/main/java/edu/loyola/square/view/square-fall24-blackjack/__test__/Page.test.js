import React from 'react';
import { render, screen } from '@testing-library/react';
import GamePage from '../app/gameplay/[tableId]/page';
import CardDisplay from '../app/gameplay/components/CardDisplay';

// Mock the Next.js navigation hook
jest.mock('next/navigation', () => ({
    useParams: jest.fn()
}));

// Mock the CardDisplay component
jest.mock('../app/gameplay/components/CardDisplay', () => {
    return jest.fn(() => <div data-testid="mock-card-display">Mocked CardDisplay</div>);
});

describe('GamePage Component', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render loading state when tableId is not provided', () => {
        // Mock useParams to return empty object
        require('next/navigation').useParams.mockReturnValue({});

        render(<GamePage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(CardDisplay).not.toHaveBeenCalled();
    });

    it('should render loading state when params is undefined', () => {
        // Mock useParams to return undefined
        require('next/navigation').useParams.mockReturnValue(undefined);

        render(<GamePage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(CardDisplay).not.toHaveBeenCalled();
    });

    it('should render CardDisplay with correct tableId when provided', () => {
        const mockTableId = 'table-123';
        // Mock useParams to return tableId
        require('next/navigation').useParams.mockReturnValue({ tableId: mockTableId });

        render(<GamePage />);

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-card-display')).toBeInTheDocument();
        expect(CardDisplay).toHaveBeenCalledWith({ tableId: mockTableId }, {});
    });

    it('should log params to console', () => {
        const mockTableId = 'table-123';
        const mockParams = { tableId: mockTableId };
        const consoleSpy = jest.spyOn(console, 'log');

        require('next/navigation').useParams.mockReturnValue(mockParams);

        render(<GamePage />);

        expect(consoleSpy).toHaveBeenCalledWith('Params in GamePage:', mockParams);
        consoleSpy.mockRestore();
    });

    // Test error handling
    it('should handle invalid tableId gracefully', () => {
        // Mock useParams to return invalid tableId
        require('next/navigation').useParams.mockReturnValue({ tableId: '' });

        render(<GamePage />);

        expect(screen.getByTestId('mock-card-display')).toBeInTheDocument();
        expect(CardDisplay).toHaveBeenCalledWith({ tableId: '' }, {});
    });
});