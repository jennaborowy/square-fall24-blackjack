import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test} from '@jest/globals'
import Signup from "../app/signup/page"
import Login from "@/app/login/page";


jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

global.fetch = jest.fn();

describe('Signup', () => {
    test("opens right signup page", async () => {
        render(<Signup/>);
        const placeElement = await screen.findByPlaceholderText('First Name');
        expect(placeElement).toBeInTheDocument();
    });

    test('should update username state when username input changes', () => {
        const {getByLabelText} = render(<Signup/>);

        const usernameInput = getByLabelText(/username/i);
        fireEvent.change(usernameInput, {target: {value: 'newUsername'}});
        expect(usernameInput.value).toBe('newUsername');
    });

});