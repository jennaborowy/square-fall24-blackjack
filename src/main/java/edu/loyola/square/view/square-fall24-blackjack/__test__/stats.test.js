import {fireEvent, render, screen} from "@testing-library/react";
import '@testing-library/jest-dom/jest-globals';
import Stats from "../app/lobby/stats/page"
import {describe, expect, test, jest, beforeEach, beforeAll, afterAll} from "@jest/globals";
import React from "react";
import {getDoc} from "firebase/firestore";

const mockDoc = {
    id: 'mockUserId',
    data: jest.fn().mockReturnValue({
        name: 'John Doe',
        email: 'john.doe@example.com',

    }),
};

jest.mock('firebase/firestore', ()=> ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn()
}))

describe('Stats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("opens right signup page", async () => {
        render(<Stats/>);
        const placeElement = await screen.findByText('Total Wins:');
        expect(placeElement).toBeInTheDocument();
    });

    test("show user stats", async () => {
        const docSnap = await getDoc(mockDoc)
    })
});