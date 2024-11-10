import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/jest-globals';
import Stats from "../app/lobby/stats/page"
import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import React from "react";


describe('Stats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("opens right stats page", async () => {
        render(<Stats/>);
        const placeElement = await screen.findByText('Total Wins:');
        expect(placeElement).toBeInTheDocument();
    });

});