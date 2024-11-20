import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedUser from '../app/lobby/manageusers/SelectedUser';
import { updateDoc, getDocs } from "firebase/firestore";


jest.mock('@/firebaseConfig', () => ({
    db: {}
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn()
}));

describe('SelectedUser Component', () => {
    const mockUserInfo = {
        uid: '123',
        username: 'testUser',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
    };

    const mockSetErr = jest.fn();
    const mockSetErrMsg = jest.fn();
    const mockSetSuccess = jest.fn();
    const mockSetSuccessMsg = jest.fn();

    beforeEach(() => {
        global.fetch = jest.fn();
        mockSetErr.mockClear();
        mockSetErrMsg.mockClear();
        mockSetSuccess.mockClear();
        mockSetSuccessMsg.mockClear();
    });

    it('renders user information correctly', () => {
        render(
            <SelectedUser
                userInfo={mockUserInfo}
                setErr={mockSetErr}
                setErrMsg={mockSetErrMsg}
                setSuccess={mockSetSuccess}
                setSuccessMsg={mockSetSuccessMsg}
            />
        );

        expect(screen.getByText(`${mockUserInfo.username}'s Info`)).toBeInTheDocument();
        expect(screen.getByText(mockUserInfo.firstName)).toBeInTheDocument();
        expect(screen.getByText(mockUserInfo.lastName)).toBeInTheDocument();
        expect(screen.getByText(mockUserInfo.email)).toBeInTheDocument();
    });

    describe('Password Reset', () => {
        it('handles successful password reset', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true
                })
            );

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const passwordInput = screen.getByPlaceholderText('Enter New Password');
            const submitButton = screen.getByText('Reset Password');

            fireEvent.input(passwordInput, { target: { value: 'newPassword123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetSuccess).toHaveBeenCalledWith(true);
                expect(mockSetSuccessMsg).toHaveBeenCalledWith('Successfully reset password.');
            });
        });

        it('handles password reset error', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false
                })
            );

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const passwordInput = screen.getByPlaceholderText('Enter New Password');
            const submitButton = screen.getByText('Reset Password');

            fireEvent.input(passwordInput, { target: { value: 'short' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith('Check that the new password is at least 8 characters long.');
            });
        });
    });

    describe('Username Change', () => {
        it('handles successful username change', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true
                })
            );

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const usernameInput = screen.getByPlaceholderText('Enter New Username');
            const submitButton = screen.getByText('Reset Username');

            fireEvent.input(usernameInput, { target: { value: 'newUsername' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetSuccess).toHaveBeenCalledWith(true);
                expect(mockSetSuccessMsg).toHaveBeenCalledWith('Successfully reset username.');
            });
        });

        it('handles empty username error', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false
                })
            );
            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const usernameInput = screen.getByPlaceholderText('Enter New Username');
            const submitButton = screen.getByText('Reset Username');

            fireEvent.input(usernameInput, { target: { value: '   ' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith('Username field must be populated to update');
            });
        });

        it('handles duplicate username error', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false
                })
            );
            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const emailInput = screen.getByPlaceholderText('Enter New Username');
            const submitButton = screen.getByText('Reset Username');

            fireEvent.input(emailInput, { target: { value: 'testUser' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith('Username is already taken');
            });
        });
    });

    describe('Email Change', () => {
        it('handles successful email change', async () => {
            const mockQuerySnapshot = { empty: true };
            getDocs.mockResolvedValueOnce(mockQuerySnapshot);
            updateDoc.mockResolvedValueOnce();

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const emailInput = screen.getByPlaceholderText('Enter New Email');
            const submitButton = screen.getByText('Reset Email');

            fireEvent.input(emailInput, { target: { value: 'newemail@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetSuccess).toHaveBeenCalledWith(true);
                expect(mockSetSuccessMsg).toHaveBeenCalledWith('Successfully reset email.');
            });
        });

        it('handles duplicate email error', async () => {
            const mockQuerySnapshot = { empty: false };
            getDocs.mockResolvedValueOnce(mockQuerySnapshot);

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const emailInput = screen.getByPlaceholderText('Enter New Email');
            const submitButton = screen.getByText('Reset Email');

            fireEvent.input(emailInput, { target: { value: 'existing@example.com' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith('Email is already in use');
            });
        });

        it('handles empty email error', async () => {
            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const usernameInput = screen.getByPlaceholderText('Enter New Email');
            const submitButton = screen.getByText('Reset Email');

            fireEvent.input(usernameInput, { target: { value: '   ' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith("Email field must be populated to update");
            });
        });

    });

    describe('Name Changes', () => {
        it('handles successful first name change', async () => {
            updateDoc.mockResolvedValueOnce();

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const firstNameInput = screen.getByPlaceholderText('Enter New First Name');
            const submitButton = screen.getByText('Reset First Name');

            fireEvent.input(firstNameInput, { target: { value: 'Jane' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetSuccess).toHaveBeenCalledWith(true);
                expect(mockSetSuccessMsg).toHaveBeenCalledWith('Successfully reset first name.');
            });
        });

        it('handles empty first name error', async () => {
            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const usernameInput = screen.getByPlaceholderText('Enter New First Name');
            const submitButton = screen.getByText('Reset First Name');

            fireEvent.input(usernameInput, { target: { value: '   ' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith("First name field must be populated to update");
            });
        });

        it('handles successful last name change', async () => {
            updateDoc.mockResolvedValueOnce();

            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const lastNameInput = screen.getByPlaceholderText('Enter New Last Name');
            const submitButton = screen.getByText('Reset Last Name');

            fireEvent.input(lastNameInput, { target: { value: 'Smith' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetSuccess).toHaveBeenCalledWith(true);
                expect(mockSetSuccessMsg).toHaveBeenCalledWith('Successfully reset last name.');
            });
        });

        it('handles empty last name error', async () => {
            render(
                <SelectedUser
                    userInfo={mockUserInfo}
                    setErr={mockSetErr}
                    setErrMsg={mockSetErrMsg}
                    setSuccess={mockSetSuccess}
                    setSuccessMsg={mockSetSuccessMsg}
                />
            );

            const usernameInput = screen.getByPlaceholderText('Enter New Last Name');
            const submitButton = screen.getByText('Reset Last Name');

            fireEvent.input(usernameInput, { target: { value: '   ' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSetErr).toHaveBeenCalledWith(true);
                expect(mockSetErrMsg).toHaveBeenCalledWith("Last name field must be populated to update");
            });
        });
    });
});