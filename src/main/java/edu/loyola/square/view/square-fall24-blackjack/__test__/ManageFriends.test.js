import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManageFriends from '../app/lobby/managefriends/page.js';
import { useAuth } from '@/app/context/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection } from 'firebase/firestore';

// Mock the modules
jest.mock('@/app/context/auth');
jest.mock('firebase/firestore');
jest.mock('@/firebaseConfig', () => ({
    db: {}
}));

// Mock data
const mockCurrentUser = {
    uid: 'test-user-123',
    username: 'test-user',
    email: 'test@example.com'
};

const mockUsers = [
    { uid: 'user1', username: 'user1', email: 'user1@example.com' },
    { uid: 'user2', username: 'user2', email: 'user2@example.com' }
];

const mockFriends = [
    { uid: 'friend1', username: 'friend1', email: 'friend1@example.com' }
];

// Setup fetch mock
global.fetch = jest.fn();

describe('ManageFriends Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock useAuth
        useAuth.mockReturnValue({ currentUser: mockCurrentUser });

        // Mock fetch response for user list
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockUsers)
        });

        // Mock collection and doc functions
        collection.mockImplementation((db, name) => ({
            type: 'collection',
            path: name
        }));

        doc.mockImplementation((dbOrCollection, ...pathSegments) => {
            const path = dbOrCollection.type === 'collection'
                ? `${dbOrCollection.path}/${pathSegments[0]}`
                : `${pathSegments[0]}/${pathSegments[1]}`;

            return {
                type: 'document',
                path: path,
                id: pathSegments[pathSegments.length - 1]
            };
        });

        // Mock getDoc responses
        getDoc.mockImplementation((ref) => {
            if (ref.id === mockCurrentUser.uid) {
                return Promise.resolve({
                    data: () => ({ friends: mockFriends.map(f => f.uid) })
                });
            }
            const mockFriend = mockFriends.find(f => f.uid === ref.id);
            if (mockFriend) {
                return Promise.resolve({
                    data: () => mockFriend
                });
            }
            const mockUser = mockUsers.find(u => u.uid === ref.id);
            return Promise.resolve({
                data: () => mockUser
            });
        });

        // Mock updateDoc to resolve successfully by default
        updateDoc.mockResolvedValue();
    });

    test('renders user list and friends list', async () => {
        render(<ManageFriends />);

        // Wait for lists to populate
        await waitFor(() => {
            expect(screen.getByText('@user1')).toBeInTheDocument();
            expect(screen.getByText('@friend1')).toBeInTheDocument();
            expect(screen.queryByText('@test-user')).not.toBeInTheDocument();
        });
    });

    test('adds a friend successfully', async () => {
        render(<ManageFriends />);

        // Wait for the component to load
        await waitFor(() => {
            // Find all add friend buttons
            const addButtons = screen.getAllByRole('button', { name: /add/i });
            // Click the first add button
            fireEvent.click(addButtons[0]);
        });

        // Confirm in the modal
        await waitFor(() => {
            expect(screen.getByText(/Add @.+\?/)).toBeInTheDocument();
        });

        // Click Yes in the modal
        fireEvent.click(screen.getByText('Yes'));

        // Verify updateDoc was called with correct parameters
        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                {
                    friends: arrayUnion('user1')
                }
            );
        });
    });

    test('removes a friend successfully', async () => {
        render(<ManageFriends />);

        // Wait for the component to load
        await waitFor(() => {
            // Find all add friend buttons
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            // Click the first add button
            fireEvent.click(removeButtons[0]);
        });

        // Confirm in the modal
        await waitFor(() => {
            expect(screen.getByText(/Remove @.+\?/)).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Yes'));

        // Verify updateDoc was called with correct parameters
        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                {
                    friends: arrayRemove('friend1')
                }
            );
        });
    });

    test('handles API error gracefully', async () => {
        // Mock console.log
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        // Mock fetch to immediately reject
        global.fetch = jest.fn(() =>
            Promise.reject(new Error('API Error'))
        );

        render(<ManageFriends />);

        // Need to wait for the next tick to allow promise rejection to be handled
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify the error was logged
        expect(consoleSpy).toHaveBeenCalledWith("err in fetch: ", "API Error");

        // Clean up
        consoleSpy.mockRestore();
    });

    test('handles Firebase error gracefully', async () => {
        // Mock console.log to check for error logging
        const consoleSpy = jest.spyOn(console, 'log');

        // Mock updateDoc to reject
        updateDoc.mockRejectedValueOnce(new Error('Firebase Error'));

        render(<ManageFriends />);

        // Wait for the component to load
        await waitFor(() => {
            // Find all add friend buttons
            const addButtons = screen.getAllByRole('button', { name: /add/i });
            // Click the first add button
            fireEvent.click(addButtons[0]);
        });

        // Confirm in the modal
        await waitFor(() => {
            expect(screen.getByText(/Add @.+\?/)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Yes'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('error adding friend: ', new Error('Firebase Error'));
        });
    });

    test('modal can be cancelled', async () => {
        render(<ManageFriends />);

        // Wait for the component to load
        await waitFor(() => {
            // Find all add friend buttons
            const addButtons = screen.getAllByRole('button', { name: /add/i });
            // Click the first add button
            fireEvent.click(addButtons[0]);
        });

        // Confirm in the modal
        await waitFor(() => {
            expect(screen.getByText(/Add @.+\?/)).toBeInTheDocument();
        });

        // Click No
        fireEvent.click(screen.getByText('No'));

        // Verify modal is closed
        await waitFor(() => {
            expect(screen.queryByText('Add @user1?')).not.toBeInTheDocument();
        });

        // Verify updateDoc was not called
        expect(updateDoc).not.toHaveBeenCalled();
    });
});