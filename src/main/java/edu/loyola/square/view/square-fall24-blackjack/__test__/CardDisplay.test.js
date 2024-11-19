import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardDisplay from '../app/gameplay/components/CardDisplay';
import { doc, getDoc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import playerHits from '../app/gameplay/components/CardDisplay'
import promptAce from '../app/gameplay/components/CardDisplay'
import handleLeaveTable from '../app/gameplay/components/CardDisplay'
const mockTableId = "table123"
jest.mock("../firebaseConfig", () => ({
  auth: {
    currentUser: {
      uid: "test-user-id"
    }
  },
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayRemove: jest.fn()
}));

// Mock fetch calls
global.fetch = jest.fn();

// Mock session storage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock child components
// eslint-disable-next-line react/display-name
jest.mock('../app/messages/chatbox/chatbox', () => () => <div>Mock ChatBox</div>);
// eslint-disable-next-line react/display-name
jest.mock('../app/gameplay/GameInfo', () => () => <div>Mock GameInfo</div>);
// eslint-disable-next-line react/display-name
jest.mock('../app/gameplay/AceModal', () => ({ showModal, onSelectValue }) => (
  <div data-testid="ace-modal">Mock AceModal</div>
));
// eslint-disable-next-line react/display-name
jest.mock('../app/gameplay/BetTypeAnimation', () => ({ children }) => (
  <div>{children}</div>
));

describe('CardDisplay Component', () => {
  const mockTableId = 'test-table-123';

  beforeEach(() => {
    jest.clearAllMocks();

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        players: ['test-user-id', 'player2-id'],
        minimum_bet: 5
      })
    });

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          players: [
            {hand: [{suit: 'hearts', rank: 'A'}]},
            {hand: [{suit: 'spades', rank: '10'}]}
          ],
          dealerHand: [{suit: 'diamonds', rank: 'K'}],
          currentPlayerIndex: 0
        })
      })
    );
  });

  describe('Initial Render and Error Cases', () => {
    // Mock console.error before tests
    let consoleErrorSpy;

    beforeEach(() => {
      // Clear all mocks
      jest.clearAllMocks();

      // Spy on console.error
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Default mock for getDoc
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          players: ['test-user-id', 'player2-id'],
          minimum_bet: 5
        })
      });

      // Mock sessionStorage
      mockSessionStorage.getItem.mockReturnValue(null);
    });

    afterEach(() => {
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('handles missing tableId', async () => {
      await act(async () => {
        render(<CardDisplay tableId={null} />);
      });

      // Wait for component to finish initial render
      await waitFor(() => {
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('gameTableId');
      });
    });

    it('handles Firestore errors', async () => {
      // Mock Firestore error
      getDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await act(async () => {
        render(<CardDisplay tableId={mockTableId} />);
      });

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading players:',
          expect.any(Error)
        );
      });
    });

    it('handles non-existent table', async () => {
      // Mock non-existent table
      getDoc.mockResolvedValueOnce({
        exists: () => false,
        data: () => null
      });

      await act(async () => {
        render(<CardDisplay tableId={mockTableId} />);
      });

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Table document doesn't exist");
      });
    });

    it('handles invalid players array', async () => {
      // Mock invalid players data
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          players: null,
          minimum_bet: 5
        })
      });

      await act(async () => {
        render(<CardDisplay tableId={mockTableId} />);
      });

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "No players found in table data or invalid players array"
        );
      });
    });

    it('handles empty players array', async () => {
      // Mock empty players array
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          players: [],
          minimum_bet: 5
        })
      });

      await act(async () => {
        render(<CardDisplay tableId={mockTableId} />);
      });

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "No players found in table data or invalid players array"
        );
      });
    });

    it('handles undefined players field', async () => {
      // Mock missing players field
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          minimum_bet: 5
        })
      });

      await act(async () => {
        render(<CardDisplay tableId={mockTableId} />);
      });

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "No players found in table data or invalid players array"
        );
      });
    });
  });


    it('handles ace prompt scenario', async () => {
      render(<CardDisplay tableId={mockTableId}/>);

      await act(async () => {
        const betInput = screen.getByLabelText(/Amount/i);
        fireEvent.change(betInput, {target: {value: '100'}});

        const startButton = screen.getByText(/Start Game/i);
        fireEvent.click(startButton);
      });

      // Trigger ace prompt
      await act(async () => {
        global.fetch.mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              players: [
                {hand: [{suit: 'hearts', rank: 'A'}]}
              ],
              dealerHand: [{suit: 'diamonds', rank: 'K'}],
              currentPlayerIndex: 0,
              hasAce: true
            })
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('ace-modal')).toBeInTheDocument();
      });
    });
  });

      it('disables start button when bet is invalid', async () => {
        render(<CardDisplay tableId={mockTableId}/>);

        const startButton = screen.getByText(/Start Game/i);
        expect(startButton).toBeDisabled();

        const betInput = screen.getByLabelText(/Amount/i);
        fireEvent.change(betInput, {target: {value: '25'}});

        await waitFor(() => {
          expect(startButton).not.toBeDisabled();
        });
      });

    describe('Player Turn Management', () => {
      it('correctly identifies and handles dealer turn', async () => {
        render(<CardDisplay tableId={mockTableId}/>);

        // Start game
        const betInput = screen.getByLabelText(/Amount/i);
        fireEvent.change(betInput, {target: {value: '25'}});
        const startButton = screen.getByText(/Start Game/i);
        fireEvent.click(startButton);

        // Simulate dealer turn
        await act(async () => {
          global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                players: [
                  {hand: [{suit: 'hearts', rank: 'K'}]}
                ],
                dealerHand: [{suit: 'diamonds', rank: 'A'}, {suit: 'clubs', rank: '6'}],
                currentPlayerIndex: -1,
                isDealerTurn: true
              })
            })
          );
        });

        // Verify dealer turn UI state
        await waitFor(() => {
          const actionButtons = screen.queryAllByRole('button', {name: /hit|stand/i});
          expect(actionButtons).toHaveLength(0);
        });
      });

      it('handles multiple player turns correctly', async () => {
        render(<CardDisplay tableId={mockTableId}/>);

        // Start game
        const betInput = screen.getByLabelText(/Amount/i);
        fireEvent.change(betInput, {target: {value: '25'}});
        const startButton = screen.getByText(/Start Game/i);
        fireEvent.click(startButton);

        // First player stands
        const standButton = await screen.findByText(/Stand/i);
        fireEvent.click(standButton);

        // Verify next player's turn
        await waitFor(() => {
          expect(setCurrentPlayerIndex).toHaveBeenCalledWith(1);
        });
      });
    });

    describe('Session Storage Management', () => {
      it('retrieves tableId from session storage when not provided', () => {
        mockSessionStorage.getItem.mockReturnValue('stored-table-id');
        render(<CardDisplay tableId={null}/>);
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('gameTableId');
      });

      it('saves tableId to session storage on successful load', async () => {
        render(<CardDisplay tableId={mockTableId}/>);
        await waitFor(() => {
          expect(mockSessionStorage.setItem).toHaveBeenCalledWith('gameTableId', mockTableId);
        });
      });



  describe('CardDisplay Component', () => {
    const mockTableId = 'test-table-123';

    beforeEach(() => {
      jest.clearAllMocks();

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          players: ['test-user-id', 'player2-id'],
          minimum_bet: 5
        })
      });

      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            players: [
              {hand: [{suit: 'hearts', rank: 'A'}]},
              {hand: [{suit: 'spades', rank: '10'}]}
            ],
            dealerHand: [{suit: 'diamonds', rank: 'K'}],
            currentPlayerIndex: 0
          })
        })
      );
    });

    describe('Initial Render and Error Cases', () => {
      it('handles missing tableId', async () => {
        render(<CardDisplay tableId={null}/>);
        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('gameTableId');
      });

      it('handles Firestore errors', async () => {
        getDoc.mockRejectedValueOnce(new Error('Firestore error'));
        render(<CardDisplay tableId={mockTableId}/>);
        await waitFor(() => {
          expect(console.error).toHaveBeenCalled();
        });
      });

      it('accepts valid bet amount', async () => {
        const { betInput } = await renderAndGetBetInput();

        await act(async () => {
          fireEvent.change(betInput, { target: { value: '100' } });
        });

        // Check that no error messages are shown
        expect(screen.queryByText(/Your bet should be/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/You cannot bet/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Your bet must satisfy/i)).not.toBeInTheDocument();

        // Verify the Start Game button is enabled
        const startButton = screen.getByText(/Start Game/i);
        expect(startButton).not.toBeDisabled();
      });

      it('handles minimum bet amount exactly', async () => {
        const { betInput } = await renderAndGetBetInput();

        await act(async () => {
          fireEvent.change(betInput, { target: { value: '5' } });
        });

        // Verify no error messages
        expect(screen.queryByText(/You cannot bet less than/i)).not.toBeInTheDocument();

        // Verify the Start Game button is enabled
        const startButton = screen.getByText(/Start Game/i);
        expect(startButton).not.toBeDisabled();
      });

      it('disables start button with invalid bet', async () => {
        const { betInput } = await renderAndGetBetInput();

        await act(async () => {
          fireEvent.change(betInput, { target: { value: 'invalid' } });
        });

        const startButton = screen.getByText(/Start Game/i);
        expect(startButton).toBeDisabled();
      });

      it('handles empty bet input', async () => {
        const { betInput } = await renderAndGetBetInput();

        await act(async () => {
          fireEvent.change(betInput, { target: { value: '' } });
        });

        const startButton = screen.getByText(/Start Game/i);
        expect(startButton).toBeDisabled();
      });
  });
  });
    });


