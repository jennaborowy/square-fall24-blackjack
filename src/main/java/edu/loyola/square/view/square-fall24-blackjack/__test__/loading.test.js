import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals'
import {describe, expect, test} from '@jest/globals'
import Load from "@/app/loading/loading";
import React from "react";

describe('loading page', () => {
    test("opens right loading page", async () => {
        render(<Load/>);
        const linkElement = screen.getByText("/logo-gif-transparent.gif");
        expect(linkElement).toBeInTheDocument();
    });
});