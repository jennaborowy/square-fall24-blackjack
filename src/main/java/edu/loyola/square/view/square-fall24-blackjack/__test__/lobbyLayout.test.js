import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/jest-globals';
import Layout from "../app/lobby/layout"
import {describe, expect, test, jest, it} from "@jest/globals";
import React from "react";
import {onAuthStateChanged} from "firebase/auth";

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
}));

// Mock firebaseConfig
jest.mock('../firebaseConfig', () => ({
    auth: {},
}));

jest.mock("next/navigation", () => ({
    useRouter() {
        return {
            prefetch: () => null
        };
    }
}));

describe('layout lobby page', () => {
    test("opens right lobby page", async () => {
        render(<Layout/>);
        const linkElement = screen.getByTitle('menu');
        expect(linkElement).toBeInTheDocument();
    });

    it('render nav button', async () => {
        render(<Layout />);

        const iconButton = screen.getByTitle('menu');
        fireEvent.click(iconButton);
        expect(iconButton).toBeInTheDocument();
    })

    it('open user menu button', async () => {
        render(<Layout />);

        const iconButton = screen.getByTitle('settings');
        fireEvent.click(iconButton);
        expect(iconButton).toBeInTheDocument();
    })

    it('close user menu button', async () => {
        render(<Layout />);

        const iconButton = screen.getByTitle('close menu');
        fireEvent.click(iconButton);
        expect(iconButton).toBeInTheDocument();
    })

    it('exits', async () => {
        render(<Layout />);

        const iconButton = screen.getByTitle('exit');
        fireEvent.click(iconButton);
        expect(iconButton).toBeInTheDocument();
    })

});