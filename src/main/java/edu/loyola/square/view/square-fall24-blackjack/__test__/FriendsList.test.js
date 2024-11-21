import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FriendsList from '../app/lobby/managefriends/FriendsList.js';

describe('FriendsList Component', () => {
    const mockFriends = [
        {
            uid: 'friend1',
            username: 'frienduser1',
            firstName: 'Friend',
            lastName: 'User1'
        },
        {
            uid: 'friend2',
            username: 'frienduser2',
            firstName: 'Friend',
            lastName: 'User2'
        }
    ];

    const mockUpdateFriend = jest.fn(() => Promise.resolve());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders friends list correctly', () => {
        render(<FriendsList detailedFriends={mockFriends} updateFriend={mockUpdateFriend} />);

        expect(screen.getByText('View Current Friends')).toBeInTheDocument();
        expect(screen.getByText('@frienduser1')).toBeInTheDocument();
        expect(screen.getByText('@frienduser2')).toBeInTheDocument();
        expect(screen.getByText('Friend User1')).toBeInTheDocument();
        expect(screen.getByText('Friend User2')).toBeInTheDocument();
    });

    test('handles empty friends list', () => {
        render(<FriendsList detailedFriends={[]} updateFriend={mockUpdateFriend} />);

        expect(screen.getByText('View Current Friends')).toBeInTheDocument();
        expect(screen.queryByText('@frienduser1')).not.toBeInTheDocument();
    });

    test('handles null friends list', () => {
        render(<FriendsList detailedFriends={null} updateFriend={mockUpdateFriend} />);

        expect(screen.getByText('View Current Friends')).toBeInTheDocument();
        expect(screen.queryByText('@frienduser1')).not.toBeInTheDocument();
    });

    test('calls updateFriend when Remove Friend button is clicked', async () => {
        render(<FriendsList detailedFriends={mockFriends} updateFriend={mockUpdateFriend} />);

        const removeButtons = screen.getAllByText('Remove Friend');
        fireEvent.click(removeButtons[0]);

        expect(mockUpdateFriend).toHaveBeenCalledWith(mockFriends[0]);
        await waitFor(() => {
            expect(mockUpdateFriend).toHaveBeenCalledTimes(1);
        });
    });

    test('handles updateFriend error', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockError = new Error('Update failed');
        const mockUpdateFriendError = jest.fn(() => Promise.reject(mockError));

        render(<FriendsList detailedFriends={mockFriends} updateFriend={mockUpdateFriendError} />);

        const removeButtons = screen.getAllByText('Remove Friend');
        fireEvent.click(removeButtons[0]);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(mockError);
        });

        consoleSpy.mockRestore();
    });
});