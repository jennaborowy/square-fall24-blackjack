import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Stats from '../app/lobby/stats/page';
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

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
    doc: jest.fn(),
    getDoc: jest.fn()
}));

describe('Stats Component', () => {
    const mockUser = {
        uid: 'test-uid'
    };

    const mockUserData = {
        totalWins: 10,
        totalLosses: 5,
        chipBalance: 1000
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial empty state correctly', () => {
        render(<Stats />);

        expect(screen.getByText('Total wins:')).toBeInTheDocument();
        expect(screen.getByText('Total losses:')).toBeInTheDocument();
        expect(screen.getByText('Current Chip Total: $')).toBeInTheDocument();
    });


    it('handles non-authenticated state', async () => {
        // Mock no authenticated user
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback(null);
            return jest.fn();
        });

        render(<Stats />);

        await waitFor(() => {
            expect(screen.getByText('Total wins:')).toBeInTheDocument();
            expect(screen.getByText('Total losses:')).toBeInTheDocument();
            expect(screen.getByText('Current Chip Total: $')).toBeInTheDocument();
            expect(getDoc).not.toHaveBeenCalled();
        });
    });

    it('verifies image properties', () => {
        render(<Stats />);

        const image = screen.getByAltText('');
        expect(image).toHaveAttribute('src', '/stats-transformed.png');
        expect(image).toHaveAttribute('height', '150');
        expect(image).toHaveAttribute('width', '400');
        expect(image.style.margin).toBe('20px');
        expect(image.style.alignSelf).toBe('center');
    });

    it('handles Firestore error gracefully', async () => {
        // Mock auth state
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback(mockUser);
            return jest.fn();
        });

        // Mock Firestore error
        doc.mockReturnValue('mock-doc-ref');
        getDoc.mockRejectedValue(new Error('Firestore error'));

        render(<Stats />);

        await waitFor(() => {
            expect(screen.getByText('Total wins:')).toBeInTheDocument();
            expect(screen.getByText('Total losses:')).toBeInTheDocument();
            expect(screen.getByText('Current Chip Total: $')).toBeInTheDocument();
        });
    });

    it('renders user stats when authenticated and data exists', async () => {
        auth.currentUser = mockUser;

        // Mock auth state
        auth.onAuthStateChanged.mockImplementation((callback) => {
            callback(mockUser);
            return jest.fn();
        });

        // Mock Firestore document snapshot
        doc.mockReturnValue('mock-doc-ref');
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({
                totalWins: mockUserData.totalWins,
                totalLosses: mockUserData.totalLosses,
                chipBalance: mockUserData.chipBalance
            })
        });

        render(<Stats />);

        await waitFor(() => {
            expect(screen.getByText(`Total wins: ${mockUserData.totalWins}`)).toBeInTheDocument();
            expect(screen.getByText(`Total losses: ${mockUserData.totalLosses}`)).toBeInTheDocument();
            expect(screen.getByText(`Current Chip Total: $${mockUserData.chipBalance}`)).toBeInTheDocument();
        });
    });

});