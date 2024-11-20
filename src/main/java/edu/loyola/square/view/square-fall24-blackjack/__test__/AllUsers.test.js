import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AllUsers from '../app/lobby/manageusers/AllUsers';

describe('AllUsers List', () => {
    const mockUsers = [
        {
            uid: 'user1',
            username: 'testuser1',
            firstName: 'Test',
            lastName: 'User1'
        },

    ];

    const mockSetSelectedUser = jest.fn(() => Promise.resolve());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user list correctly', () => {
        render(<AllUsers userList={mockUsers} setSelectedUser={mockSetSelectedUser} />);

        expect(screen.getByText('All Users')).toBeInTheDocument();
        expect(screen.getByText('@testuser1')).toBeInTheDocument();
        expect(screen.getByText('Test User1')).toBeInTheDocument();
    });

    test('handles empty user list', () => {
        render(<AllUsers userList={[]} setSelectedUser={mockSetSelectedUser} />);

        expect(screen.getByText('All Users')).toBeInTheDocument();
        expect(screen.queryByText('@testuser1')).not.toBeInTheDocument();
    });

    test('calls setSelectedUser when Select User button is clicked', async () => {
        render(<AllUsers userList={mockUsers} setSelectedUser={mockSetSelectedUser} />);

        const button = screen.getByText('Select User');
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockSetSelectedUser).toHaveBeenCalledTimes(1);
        });
    });


});

