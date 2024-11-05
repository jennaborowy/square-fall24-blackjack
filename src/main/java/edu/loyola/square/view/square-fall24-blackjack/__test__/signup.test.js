import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test, jest, beforeEach} from '@jest/globals'
import Signup from "../app/signup/page"

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

global.fetch = jest.fn();

const mockSetSuccess = jest.fn();
const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
        setErrMsg("Password fields do not match.");
        setErr(true);
        return;
    }

    const body = {
        "username": username,
        "password": password,
        "email": email,
        "firstName": first,
        "lastName": last,
    };

    setErr(null);
    try {
        const response = await fetch('http://localhost:8080/api/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            setSuccess(true);
        } else {
            const errorData = await response.json();
            setErrMsg(errorData.message);
            setErr(true);
        }
    } catch (error) {
        setErrMsg(error.message);
        setErr(true);
    }
};

describe('Signup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("opens right signup page", async () => {
        render(<Signup/>);
        const placeElement = await screen.findByPlaceholderText('First Name');
        expect(placeElement).toBeInTheDocument();
    });

    test('should update username state when username input changes', async () => {

        const e = {preventDefault: jest.fn()};
        const password = "password123";
        const confirm = "password123";
        await handleSubmit(e);

        expect(mockSetSuccess).toHaveBeenCalledWith(true);
    });

});