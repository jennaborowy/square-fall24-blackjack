import {fireEvent, getByText, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test, jest, beforeEach, it} from '@jest/globals'
import Signup from "../app/signup/page"
import handleSubmit from "../app/signup/page"
import userEvent from "firebase-mock/browser/firebasemock";
import {useRouter} from "next/navigation";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn()
}));

global.fetch = jest.fn();


describe('Signup', () => {
    const mockSetErrMsg = jest.fn();
    const mockSetErr = jest.fn();
    const mockSetSuccess = jest.fn();
    const fillForm = async (user = {}) => {
        const defaultUser = {
            username: 'testuser',
            password: 'Password123!',
            confirm: 'Password123!',
            email: 'test@example.com',
            first: 'John',
            last: 'Doe',
            ...user
        };

        await userEvent.type(screen.getByPlaceholderText(/Username/i), defaultUser.username);
        await userEvent.type(screen.getByPlaceholderText(/Password/i), defaultUser.password);
        await userEvent.type(screen.getByPlaceholderText(/Confirm Password/i), defaultUser.confirm);
        await userEvent.type(screen.getByPlaceholderText(/Email/i), defaultUser.email);
        await userEvent.type(screen.getByPlaceholderText(/First Name/i), defaultUser.first);
        await userEvent.type(screen.getByPlaceholderText(/Last Name/i), defaultUser.last);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("opens right signup page", async () => {
        render(<Signup/>);
        const placeElement = await screen.findByPlaceholderText('First Name');
        expect(placeElement).toBeInTheDocument();
    });

    it('handle a submit', async () => {
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

        expect(mockSetErr()).toBe(true);
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

        expect(mockSetErr()).toBe(true);
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