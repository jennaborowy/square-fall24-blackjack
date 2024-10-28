import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {afterEach, describe, expect, test} from '@jest/globals'
import Login from "../app/login/page"

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

describe('Login', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("opens right login page",async () => {
        render(<Login />);
        const placeElement = await screen.findByPlaceholderText('Username');
        expect(placeElement).toBeInTheDocument();
    });

//    test("submits username and password", async () => {
//        const username = "me";
//        const password = "password";
//        const onSubmit = jest.fn();
//        render(<Login onSubmit={onSubmit}/>);
//
//       fireEvent.change(screen.getByPlaceholderText("Username"), {target: {value: username}});
//
//       fireEvent.change(screen.getByPlaceholderText("Password"), {target: {value: password}});
//
//        fireEvent.click(screen.getByText("Submit"));
//
//        expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent('Invalid username or password');
 //   });
});