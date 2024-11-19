import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../app/lobby/managefriends/UserList.js';

describe('UserList Component', () => {
    const mockUsers = [
        {
            uid: 'user1',
            username: 'testuser1',
            firstName: 'Test',
            lastName: 'User1'
        },
        {
            uid: 'user2',
            username: 'testuser2',
            firstName: 'Test',
            lastName: 'User2'
        }
    ];

    const mockUpdateFriend = jest.fn(() => Promise.resolve());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user list correctly', () => {
        render(<UserList userList={mockUsers} updateFriend={mockUpdateFriend} />);

        expect(screen.getByText('Find New Friends')).toBeInTheDocument();
        expect(screen.getByText('@testuser1')).toBeInTheDocument();
        expect(screen.getByText('@testuser2')).toBeInTheDocument();
        expect(screen.getByText('Test User1')).toBeInTheDocument();
        expect(screen.getByText('Test User2')).toBeInTheDocument();
    });

    test('handles empty user list', () => {
        render(<UserList userList={[]} updateFriend={mockUpdateFriend} />);

        expect(screen.getByText('Find New Friends')).toBeInTheDocument();
        expect(screen.queryByText('@testuser1')).not.toBeInTheDocument();
    });

    test('calls updateFriend when Add Friend button is clicked', async () => {
        render(<UserList userList={mockUsers} updateFriend={mockUpdateFriend} />);

        const addButtons = screen.getAllByText('Add Friend');
        fireEvent.click(addButtons[0]);

        expect(mockUpdateFriend).toHaveBeenCalledWith(mockUsers[0]);
        await waitFor(() => {
            expect(mockUpdateFriend).toHaveBeenCalledTimes(1);
        });
    });

    test('handles updateFriend error', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockError = new Error('Update failed');
        const mockUpdateFriendError = jest.fn(() => Promise.reject(mockError));

        render(<UserList userList={mockUsers} updateFriend={mockUpdateFriendError} />);

        const addButtons = screen.getAllByText('Add Friend');
        fireEvent.click(addButtons[0]);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(mockError);
        });

        consoleSpy.mockRestore();
    });
});
