import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../app/login/page';
import { useRouter } from 'next/navigation';
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock Firebase auth
jest.mock('@/firebaseConfig', () => ({
    auth: {
        currentUser: null
    }
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn()
}));

// Mock MUI Dialog components
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

describe('Login Component', () => {
    const mockRouter = {
        push: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
        global.fetch = jest.fn();
    });

    const fillLoginForm = (username = 'testuser', password = 'password123') => {
        fireEvent.input(screen.getByTitle('username'), {
            target: { name: 'username', value: username }
        });
        fireEvent.input(screen.getByTitle('Enter password'), {
            target: { name: 'password', value: password }
        });
    };

    it('renders login form correctly', () => {
        render(<Login />);

        expect(screen.getByTitle('username')).toBeInTheDocument();
        expect(screen.getByTitle('Enter password')).toBeInTheDocument();
        expect(screen.getByTitle('login')).toBeInTheDocument();
        expect(screen.getByText('Sign up for Account')).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        const mockEmail = 'test@example.com';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ email: mockEmail })
            })
        );

        signInWithEmailAndPassword.mockResolvedValueOnce({});

        render(<Login />);
        fillLoginForm();
        fireEvent.click(screen.getByTitle('login'));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, mockEmail, 'password123');
            expect(mockRouter.push).toHaveBeenCalledWith('/lobby');
        });
    });

    it('handles invalid credentials from server', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 401
            })
        );

        render(<Login />);
        fillLoginForm();
        fireEvent.click(screen.getByTitle('login'));

        await waitFor(() => {
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Error');
            expect(screen.getByTestId('dialog-text')).toHaveTextContent('User credentials invalid');
        });
    });

    it('handles network error', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        render(<Login />);
        fillLoginForm();
        fireEvent.click(screen.getByTitle('login'));

        await waitFor(() => {
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Error');
            expect(screen.getByTestId('dialog-text')).toHaveTextContent('User credentials invalid');
        });
    });

    it('handles Firebase authentication error', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ email: 'test@example.com' })
            })
        );

        signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Firebase auth error'));

        render(<Login />);
        fillLoginForm();
        fireEvent.click(screen.getByTitle('login'));

        await waitFor(() => {
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Error');
            expect(screen.getByTestId('dialog-text')).toHaveTextContent('User credentials invalid');
        });
    });

    it('closes error dialog when clicking exit', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 401
            })
        );

        render(<Login />);
        fillLoginForm();
        fireEvent.click(screen.getByTitle('login'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Exit'));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
        });
    });

    it('handles form input changes correctly', () => {
        render(<Login />);

        const usernameInput = screen.getByTitle('username');
        const passwordInput = screen.getByTitle('Enter password');

        fireEvent.input(usernameInput, {
            target: { name: 'username', value: 'testuser' }
        });
        fireEvent.input(passwordInput, {
            target: { name: 'password', value: 'testpass' }
        });

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('testpass');
    });

});