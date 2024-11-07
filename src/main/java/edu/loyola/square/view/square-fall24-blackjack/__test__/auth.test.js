import { render, act } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider, useAuth } from '@/app/context/auth';
import { onAuthStateChanged } from 'firebase/auth';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, jest, it, beforeEach} from '@jest/globals'

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
}));

// Mock firebaseConfig
jest.mock('../firebaseConfig', () => ({
    auth: {},
}));

// Test component to consume the context
const TestComponent = () => {
    const { currentUser } = useAuth();
    return <div data-testid="user">{currentUser?.displayName}</div>;
};

describe('AuthContext', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('provides null user by default', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('user').textContent).toBe('');
    });

    it('updates user when auth state changes to logged in', async () => {
        // Mock the Firebase auth state change
        const mockUser = {
            uid: '123',
            displayName: 'Test User',
        };

        onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => {}; // Cleanup function
        });

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for state update
        await act(async () => {
            await Promise.resolve();
        });

        expect(getByTestId('user').textContent).toBe('Test User');
    });

    it('handles logout correctly', async () => {
        // Mock the Firebase auth state change for logout
        onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(null);
            return () => {}; // Cleanup function
        });

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for state update
        await act(async () => {
            await Promise.resolve();
        });

        expect(getByTestId('user').textContent).toBe('');
    });

    it('provides setCurrentUser through context', () => {
        let contextValue;

        const TestConsumer = () => {
            contextValue = useContext(AuthContext);
            return null;
        };

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(contextValue.setCurrentUser).toBeDefined();
        expect(typeof contextValue.setCurrentUser).toBe('function');
    });

    it('calls onAuthStateChanged on mount', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
    });

    it('useAuth hook throws error when used outside AuthProvider', () => {
        // Suppress console.error for this test as we expect an error
        const consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow();

        consoleSpy.mockRestore();
    });
});