import { render, screen, waitFor } from '@testing-library/react';
import { AuthContextProvider, AuthContext } from '@/app/messages/AuthContext';
import { auth } from '@/firebaseConfig';
import '@testing-library/jest-dom';

// Mock Firebase Auth
jest.mock('@/firebaseConfig', () => ({
  auth: {
    currentUser: null, // Initially, no user
    onAuthStateChanged: jest.fn((callback) => {
      callback(null); // Simulate no user (logged out)
      return jest.fn(); // return unsubscribe function
    }),
  },
}));
jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(() => ({
    empty: false,
    docs: [{ id: 'mockUserId', data: () => ({ username: 'testFriend' }) }]
  })),
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(data => data),
  serverTimestamp: jest.fn(() => new Date())
}));

describe('AuthContextProvider', () => {
  it('should render children when no user is logged in', async () => {
    // Render the component wrapped with the AuthContextProvider
    render(
      <AuthContextProvider>
        <AuthContext.Consumer>
          {(value) => (
            <div>{value.currentUser ? value.currentUser.username : 'No User'}</div>
          )}
        </AuthContext.Consumer>
      </AuthContextProvider>
    );

    // Initially, no user should be set
    expect(screen.getByText('No User')).toBeInTheDocument();
  });

  it('should update context when user is logged in', async () => {
    // Mock Firebase to simulate logged-in user
    auth.currentUser = { uid: '123', displayName: 'Test User' };
    auth.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(auth.currentUser); // Simulate user login
      return jest.fn();
    });

    // Render the component wrapped with the AuthContextProvider
    render(
      <AuthContextProvider>
        <AuthContext.Consumer>
          {(value) => (
            <div>{value.currentUser ? value.currentUser.username : 'No User'}</div>
          )}
        </AuthContext.Consumer>
      </AuthContextProvider>
    );

    // Wait for the context to update and check the user
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should set currentUser to null when user logs out', async () => {
    // Simulate a logout
    auth.currentUser = null;
    auth.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(null); // Simulate user logout
      return jest.fn();
    });

    // Render the component wrapped with the AuthContextProvider
    render(
      <AuthContextProvider>
        <AuthContext.Consumer>
          {(value) => (
            <div>{value.currentUser ? value.currentUser.username : 'No User'}</div>
          )}
        </AuthContext.Consumer>
      </AuthContextProvider>
    );

    // Wait for the context to update and check that no user is set
    await waitFor(() => {
      expect(screen.getByText('No User')).toBeInTheDocument();
    });
  });
});
