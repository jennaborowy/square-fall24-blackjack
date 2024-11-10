import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, it, test, jest} from '@jest/globals'
import Lobby from "@/app/lobby/page";
import React from "react";
import TableList from "@/app/lobby/TableList"
import JoinTableButton from "@/app/lobby/JoinTableButton";

// Mock function for onJoinTable
const mockHandleJoinTable = jest.fn();

describe('lobby page', () => {
    test("opens right lobby page", async () => {
        render(<Lobby />);
        const linkElement = screen.getByTitle("lobby");
        expect(linkElement).toBeInTheDocument();
    });

    it('handles joining table', async () => {
        render(<Lobby/>);

        render(<JoinTableButton />)
        const iconButton = screen.getByTitle('join');
        fireEvent.click(iconButton);
    })


});