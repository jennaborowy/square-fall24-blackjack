import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test, jest, beforeEach} from '@jest/globals'
import Login from "../app/login/page"

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}))

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(()=>({})),
    createUserWithEmailAndPassword: jest.fn()
}))

jest.mock('firebase/firestore', ()=> ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn()
}))

jest.mock('../firebaseConfig', ()=> ({
    db: {}
}))

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

describe('Login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("opens right login page", async () => {
        render(<Login/>);
        const placeElement = await screen.findByPlaceholderText('Username');
        expect(placeElement).toBeInTheDocument();
    });
});
/*
    test("submits username and password", async () => {
        const username = "me";
        const password = "password";
        const onSubmit = jest.fn();
        render(<Login onSubmit={onSubmit}/>);

       fireEvent.change(screen.getByPlaceholderText("Username"), {target: {value: username}});

       fireEvent.change(screen.getByPlaceholderText("Password"), {target: {value: password}});

       fireEvent.click(screen.getByText("Submit"));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/user/login', expect.any(Object));

    });

//    test("submits username and password", async () => {
//        const username = "me";
//        const password = "password";
//        const onSubmit = jest.fn();
 //       render(<Login onSubmit={onSubmit}/>);
//
 //       fireEvent.change(screen.getByPlaceholderText("Username"), {target: {value: username}});
//
//        fireEvent.change(screen.getByPlaceholderText("Password"), {target: {value: password}});
//
//        fireEvent.click(screen.getByText("Submit"));
//
//        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/user/login', expect.any(Object));

//    });
    test('should update username state when username input changes', () => {
        const { getByLabelText } = render(<Login />);

        const usernameInput = getByLabelText(/username/i);
        fireEvent.change(usernameInput, { target: { value: 'newUsername' } });
        expect(usernameInput.value).toBe('newUsername');
    });

    test('should update password state when password input changes', () => {
        const { getByLabelText } = render(<Login />);

        const passwordInput = getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'newPassword' } });
        expect(passwordInput.value).toBe('newPassword');
    });
});
*/
