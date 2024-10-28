import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test} from '@jest/globals'
import Signup from "../app/signup/page"


jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

global.fetch = jest.fn();

describe('Signup', () => {
    test("opens right signup page",async () => {
        render(<Signup />);
        const placeElement = await screen.findByPlaceholderText('First Name');
        expect(placeElement).toBeInTheDocument();
    });

});