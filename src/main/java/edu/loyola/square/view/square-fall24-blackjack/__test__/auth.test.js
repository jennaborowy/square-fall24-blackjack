import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../app/context/auth.js';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase onAuthStateChanged
jest.mock('firebase/auth', () => ({
    ...jest.requireActual('firebase/auth'),
    onAuthStateChanged: jest.fn(),
}));

// Test Component that consumes AuthContext
const TestComponent = () => {
    const { currentUser } = useAuth();
    return <div>{currentUser ? currentUser.displayName : 'No user'}</div>;
};

test('renders with no user by default', () => {
    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );
    expect(screen.getByText('No user')).toBeInTheDocument();
});

test('sets currentUser when Firebase auth state changes', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
        callback(mockUser); // Simulate user login
    });

    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
});

test('shows "No user" when Firebase auth state is null', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
        callback(null); // Simulate user logout
    });

    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());
});

test('provides currentUser through AuthContext', async () => {
    const mockUser = { uid: '123', displayName: 'Test User' };

    // Mock useAuth's currentUser value for this test
    const mockUseAuth = jest.spyOn(require('../app/context/auth.js'), 'useAuth');
    mockUseAuth.mockReturnValue({ currentUser: mockUser });

    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
});
