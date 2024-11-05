import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/jest-globals';
import Layout from "../app/lobby/layout"
import {describe, expect, test, jest} from "@jest/globals";
import React from "react";



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
        const linkElement = screen.getByText(/Manage Friends/i);
        expect(linkElement).toBeInTheDocument();
    });

});