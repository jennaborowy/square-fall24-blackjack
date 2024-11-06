import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/jest-globals';
import Main from "../app/page"
import {describe, expect, test, jest} from "@jest/globals";
import React from "react";


jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

describe('Main page', () => {
    test("opens right main page",async () => {
        render(<Main/>);
        const linkElement = screen.getByText(/signup/i);
        expect(linkElement).toBeInTheDocument();
    });

    test('navigate to signup when link is clicked', async () => {
        render(<Main />);
        const link = screen.getByText(/signup/i);
        fireEvent.click(link);
        expect(await screen.findByText("Signup")).toBeInTheDocument();
    });

    test('navigate to login when link is clicked', async () => {
        render(<Main />);
        const link = screen.getByText(/login/i);
        fireEvent.click(link);
        expect(await screen.findByText("Login")).toBeInTheDocument();
    });

    test('handle open', async () => {
        render(<Main />);
        expect(screen.queryByText('Ok')).not.toBeInTheDocument();
        const button = screen.getByText('Tutorial');
        fireEvent.click(button);
        expect(screen.getByText('Ok')).toBeInTheDocument();
    });

    test('handle close', async () => {
        render(<Main />);
        expect(screen.queryByText('Ok')).not.toBeInTheDocument();
        const button = screen.getByText('Tutorial');
        fireEvent.click(button);
        expect(screen.getByText('Ok')).toBeInTheDocument();
        const button2 = screen.getByText('Ok');
        fireEvent.click(button2);
        expect(screen.queryByText('Tutorial')).toBeInTheDocument();
    });

});