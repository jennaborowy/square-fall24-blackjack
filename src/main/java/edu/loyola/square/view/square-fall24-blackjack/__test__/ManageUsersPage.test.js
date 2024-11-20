import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManageUsers from '../app/lobby/manageusers/page';
import { useAuth } from '@/app/context/auth';
import AllUsers from '@/app/lobby/manageusers/AllUsers';
import SelectedUser from '@/app/lobby/manageusers/SelectedUser';

// Mock the auth context
jest.mock('@/app/context/auth', () => ({
    useAuth: jest.fn()
}));

// Mock the child components
jest.mock('@/app/lobby/manageusers/AllUsers', () => {
    return jest.fn(({ userList, setSelectedUser }) => (
        <div data-testid="all-users">
            <button onClick={() => setSelectedUser(userList[0])}>Select First User</button>
        </div>
    ));
});

jest.mock('@/app/lobby/manageusers/SelectedUser', () => {
    return jest.fn(({ userInfo, setErr, setErrMsg, setSuccess, setSuccessMsg }) => (
        <div data-testid="selected-user">
            {userInfo && <div>Selected: {userInfo.username}</div>}
            <button onClick={() => {
                setErr(true);
                setErrMsg('Test Error');
            }}>Trigger Error</button>
            <button onClick={() => {
                setSuccess(true);
                setSuccessMsg('Test Success');
            }}>Trigger Success</button>
        </div>
    ));
});

describe('ManageUsers Component', () => {
    const mockUsers = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
    ];

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock fetch
        global.fetch = jest.fn();

        // Mock auth context
        useAuth.mockImplementation(() => ({
            currentUser: { uid: 'test-uid' }
        }));
    });

    it('renders main components', () => {
        render(<ManageUsers />);

        expect(screen.getByTestId('all-users')).toBeInTheDocument();
        expect(screen.getByTestId('selected-user')).toBeInTheDocument();
    });

    it('fetches and displays user list successfully', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUsers)
            })
        );

        render(<ManageUsers />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/user/',
                expect.any(Object)
            );
        });

        expect(AllUsers).toHaveBeenCalledWith(
            expect.objectContaining({
                userList: expect.any(Array)
            }),
            expect.any(Object)
        );
    });

    it('handles fetch error gracefully', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Failed to fetch'))
        );

        render(<ManageUsers />);

        await waitFor(() => {
            expect(consoleLogSpy).toHaveBeenCalledWith(
                'err in fetch: ',
                'Failed to fetch'
            );
        });

        consoleLogSpy.mockRestore();
    });


    it('shows error dialog', async () => {
        render(<ManageUsers />);

        const errorButton = screen.getByText('Trigger Error');
        fireEvent.click(errorButton);

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Test Error')).toBeInTheDocument();
    });

    it('shows success dialog', async () => {
        render(<ManageUsers />);

        const successButton = screen.getByText('Trigger Success');
        fireEvent.click(successButton);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Test Success')).toBeInTheDocument();
    });

    it('closes dialog with exit button', async () => {
        render(<ManageUsers />);

        // Trigger error dialog
        const errorButton = screen.getByText('Trigger Error');
        fireEvent.click(errorButton);

        // Click exit button
        const exitButton = screen.getByText('Exit');
        fireEvent.click(exitButton);

        await waitFor(() => {
            expect(screen.queryByText('Error')).not.toBeInTheDocument();
            expect(screen.queryByText('Test Error')).not.toBeInTheDocument();
        });
    });

    it('handles state when no current user', async () => {
        useAuth.mockImplementation(() => ({
            currentUser: null
        }));

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUsers)
            })
        );

        render(<ManageUsers />);

        await waitFor(() => {
            expect(AllUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    userList: []
                }),
                expect.any(Object)
            );
        });
    });

});