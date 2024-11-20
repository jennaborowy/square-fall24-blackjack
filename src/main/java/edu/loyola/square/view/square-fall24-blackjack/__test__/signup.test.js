import {fireEvent, getByText, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test, jest, beforeEach, it} from '@jest/globals'
import Signup from "../app/signup/page"
import {useRouter} from "next/navigation";
import '@testing-library/jest-dom';
import React from 'react';

jest.mock("next/navigation", () => ({
    useRouter: jest.fn()
}));

jest.mock('@mui/material/Dialog', () => {
    return function Dialog({ children, open }) {
        return open ? <div data-testid="modal-content">{children}</div> : null;
    };
});

jest.mock('@mui/material/DialogTitle', () => {
    return function DialogTitle({ children }) {
        return <div data-testid="dialog-title">{children}</div>;
    };
});

jest.mock('@mui/material/DialogContent', () => {
    return function DialogContent({ children }) {
        return <div data-testid="dialog-content">{children}</div>;
    };
});

jest.mock('@mui/material/DialogContentText', () => {
    return function DialogContentText({ children }) {
        return <div data-testid="dialog-text">{children}</div>;
    };
});

jest.mock('@mui/material/DialogActions', () => {
    return function DialogActions({ children }) {
        return <div data-testid="dialog-actions">{children}</div>;
    };
});

describe('Signup', () => {
    const mockRouter = {
        push: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
        global.fetch = jest.fn();
    });


    it("opens right signup page", async () => {
        render(<Signup/>);
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByText('Create Account')).toBeInTheDocument();
    });


    it('handle a sucessful submit', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true
            })
        );

        render(<Signup />);

        // Simulate user input for password fields
        const firstInput = screen.getByPlaceholderText('First Name');
        const lastInput = screen.getByPlaceholderText('Last Name');
        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const emailInput = screen.getByPlaceholderText('Email');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

        fireEvent.input(firstInput, { target: { value: 'test123' } });
        fireEvent.input(lastInput, { target: { value: 'test123' } });
        fireEvent.input(usernameInput, { target: { value: 'test123' } });
        fireEvent.input(passwordInput, { target: { value: 'test1234' } });
        fireEvent.input(emailInput, { target: { value: 'test123@' } });
        fireEvent.input(confirmPasswordInput, { target: { value: 'test1234' } });

        const createAccountButton = screen.getByTitle('submit');
        // Simulate form submission
        fireEvent.click(createAccountButton)

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });
    });

    it('passwords do not match', async () => {
        render(<Signup />);

        // Simulate user input for password fields
        const firstInput = screen.getByPlaceholderText('First Name');
        const lastInput = screen.getByPlaceholderText('Last Name');
        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const emailInput = screen.getByPlaceholderText('Email');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

        fireEvent.input(firstInput, { target: { value: 'test123' } });
        fireEvent.input(lastInput, { target: { value: 'test123' } });
        fireEvent.input(usernameInput, { target: { value: 'test123' } });
        fireEvent.input(passwordInput, { target: { value: 'test1234' } });
        fireEvent.input(emailInput, { target: { value: 'test123@' } });
        fireEvent.input(confirmPasswordInput, { target: { value: 'test12345' } });

        const createAccountButton = screen.getByTitle('submit');
        // Simulate form submission
        fireEvent.click(createAccountButton)

        await waitFor(() => {
            expect(screen.getByText('Password fields do not match.')).toBeInTheDocument();
        });
    });


    it('handles server error response', async () => {
        const errorMessage = 'Username already exists';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: errorMessage })
            })
        );

        render(<Signup />);

        // Fill out form
        fireEvent.input(screen.getByPlaceholderText('First Name'), {
            target: { name: 'first', value: 'John' }
        });
        fireEvent.input(screen.getByPlaceholderText('Last Name'), {
            target: { name: 'last', value: 'Doe' }
        });
        fireEvent.input(screen.getByPlaceholderText('Username'), {
            target: { name: 'username', value: 'johndoe' }
        });
        fireEvent.input(screen.getByPlaceholderText('Email'), {
            target: { name: 'email', value: 'john@example.com' }
        });
        fireEvent.input(screen.getByPlaceholderText('Password'), {
            target: { name: 'password', value: 'password123' }
        });
        fireEvent.input(screen.getByPlaceholderText('Confirm Password'), {
            target: { name: 'confirm', value: 'password123' }
        });

        // Submit form
        fireEvent.click(screen.getByText('Create Account'));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    test('should update state when input changes', async () => {
        render(<Signup />);
        const firstInput = screen.getByPlaceholderText('First Name');
        const lastInput = screen.getByPlaceholderText('Last Name');
        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const emailInput = screen.getByPlaceholderText('Email');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

        fireEvent.input(firstInput, { target: { value: 'test123' } });
        fireEvent.input(lastInput, { target: { value: 'test123' } });
        fireEvent.input(usernameInput, { target: { value: 'test123' } });
        fireEvent.input(passwordInput, { target: { value: 'test123' } });
        fireEvent.input(emailInput, { target: { value: 'test123' } });
        fireEvent.input(confirmPasswordInput, { target: { value: 'test123' } });
    });

});