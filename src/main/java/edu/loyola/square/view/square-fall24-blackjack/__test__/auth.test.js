import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth, AuthContext } from '../app/context/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "@/firebaseConfig";

// Mock Firebase auth
jest.mock('@/firebaseConfig', () => ({
    auth: {}
}));

// Mock Firebase onAuthStateChanged
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn()
}));

// Test component to access auth context
const TestComponent = () => {
    const { currentUser } = useAuth();
    return (
        <div>
            {currentUser ? (
                <>
                    <div data-testid="user-id">{currentUser.uid}</div>
                    <div data-testid="user-name">{currentUser.displayName}</div>
                </>
            ) : (
                <div data-testid="no-user">No user</div>
            )}
        </div>
    );
};

describe('Auth Context and Provider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
    });

    describe('AuthProvider Tests', () => {
        it('provides initial null user state', () => {
            onAuthStateChanged.mockImplementation((auth, callback) => {
                // Don't call callback immediately
                return () => {};
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('no-user')).toBeInTheDocument();
        });

        it('updates state when user signs in', async () => {
            const mockUser = {
                uid: 'test-uid',
                displayName: 'Test User'
            };

            onAuthStateChanged.mockImplementation((auth, callback) => {
                callback(mockUser);
                return () => {};
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user-id')).toHaveTextContent('test-uid');
                expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
            });
        });

    });

    describe('useAuth Hook Tests', () => {

        it('provides current user data', async () => {
            const mockUser = {
                uid: 'test-uid',
                displayName: 'Test User'
            };

            onAuthStateChanged.mockImplementation((auth, callback) => {
                callback(mockUser);
                return () => {};
            });

            const TestConsumer = () => {
                const { currentUser } = useAuth();
                return (
                    <div data-testid="user-data">
                        {currentUser?.uid}-{currentUser?.displayName}
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <TestConsumer />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user-data')).toHaveTextContent('test-uid-Test User');
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('handles user with missing display name', async () => {
            const mockUser = {
                uid: 'test-uid',
                // displayName is undefined
            };

            onAuthStateChanged.mockImplementation((auth, callback) => {
                callback(mockUser);
                return () => {};
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user-id')).toHaveTextContent('test-uid');
                expect(screen.getByTestId('user-name')).toBeEmpty();
            });
        });

        it('handles multiple rapid auth state changes', async () => {
            let authCallback;
            onAuthStateChanged.mockImplementation((auth, callback) => {
                authCallback = callback;
                return () => {};
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Simulate rapid auth state changes
            act(() => {
                authCallback({ uid: 'user1', displayName: 'User 1' });
                authCallback({ uid: 'user2', displayName: 'User 2' });
                authCallback(null);
                authCallback({ uid: 'user3', displayName: 'User 3' });
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-id')).toHaveTextContent('user3');
            });
        });
    });
});