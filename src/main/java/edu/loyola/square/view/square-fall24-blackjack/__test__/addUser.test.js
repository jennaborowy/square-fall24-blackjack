import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddUser } from '@/app/messages/list/chatList/addUser/addUser';
import { AuthContext } from '@/app/messages/AuthContext';
import { ChatContext } from '@/app/messages/ChatContext';
import userEvent from "firebase-mock/browser/firebasemock";
import {collection, doc, query} from "firebase/firestore";
import * as firestore from 'firebase/firestore';


// Mock the entire firebase/firestore module
jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(() => ({
    empty: false,
    docs: [{ id: 'mockUserId', data: () => ({ username: 'testFriend' }) }]
  })),

  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(data => data),
  serverTimestamp: jest.fn(() => new Date())
}));


const mockDispatch = jest.fn();  // Define it here, outside the describe block
const mockCurrentUser = {
  uid: 'test-uid',
  username: 'test-user'
};

const mockUser = {  // Add this if you're referencing mockUser in your test
  username: 'test-user'
};

const Wrapper = ({ children }) => {
  return (
    <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
      <ChatContext.Provider value={{ data: {}, dispatch: mockDispatch }}>
        {children}
      </ChatContext.Provider>
    </AuthContext.Provider>
  );
};

// Mock firebase config
jest.mock('@/firebaseConfig', () => ({
  db: {},
  auth: {}

}));

describe('Your Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

describe('AddUser Component', () => {
  const mockCurrentUser = {
    uid: 'currentUser123',
    username: 'testUser'
  };

  const mockDispatch = jest.fn();


  const renderAddUser = () => {
    return render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ dispatch: mockDispatch }}>
          <AddUser />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );
  };

  describe('User Search', () => {
    it('should handle regular user search successfully', async () => {
      const mockFriendUser = {
        id: 'friend123',
        username: 'friendUser',
        uid: 'friend123'
      };

      // Mock the Firebase functions for this test
      const { getDocs, getDoc } = require('firebase/firestore');

      getDocs.mockImplementation(() =>
        Promise.resolve({
          empty: false,
          docs: [{
            id: mockFriendUser.id,
            data: () => mockFriendUser
          }]
        })
      );

      getDoc.mockImplementation(() =>
        Promise.resolve({
          exists: () => true,
          data: () => ({
            friends: [mockFriendUser.id]
          })
        })
      );

      renderAddUser();

      const searchInput = screen.getByPlaceholderText('username');
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'friendUser' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('friendUser')).toBeInTheDocument();
      });
    });

    it('should handle admin search successfully', async () => {
      const mockAdmins = [
        { id: 'admin1', username: 'admin1', role: 'admin', uid: 'admin1' },
        { id: 'admin2', username: 'admin2', role: 'admin', uid: 'admin2' }
      ];

      const { getDocs } = require('firebase/firestore');

      getDocs.mockImplementation(() =>
        Promise.resolve({
          empty: false,
          docs: mockAdmins.map(admin => ({
            id: admin.id,
            data: () => admin
          }))
        })
      );

      renderAddUser();

      const searchInput = screen.getByPlaceholderText('username');
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'admin' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        mockAdmins.forEach(admin => {
          expect(screen.getByText(admin.username)).toBeInTheDocument();
        });
      });
    });

    it('should handle no users found', async () => {
      const { getDocs } = require('firebase/firestore');

      getDocs.mockImplementation(() =>
        Promise.resolve({
          empty: true,
          docs: []
        })
      );

      const consoleSpy = jest.spyOn(console, 'log');

      renderAddUser();

      const searchInput = screen.getByPlaceholderText('username');
      const searchButton = screen.getByText('Search');

      fireEvent.change(searchInput, { target: { value: 'nonexistentUser' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('No user found with that username.');
      });

      consoleSpy.mockRestore();
    });
  });


  it('should successfully create a chat with a regular user', async () => {
    // Mock the Firebase functions we'll use
    const mockFriend = {
      id: 'friend123',
      uid: 'friend123',
      username: 'testFriend'
    };

    const { getDocs, getDoc, setDoc, updateDoc } = require('firebase/firestore');

    // Mock search results
    getDocs.mockImplementation(() => Promise.resolve({
      empty: false,
      docs: [{
        id: mockFriend.id,
        data: () => ({ ...mockFriend, friends: ['test-uid'] })
      }]
    }));

    // Mock sequential getDoc calls
    getDoc
      // First call - checking current user's friends
      .mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        data: () => ({
          friends: [mockFriend.id]
        })
      }))
      // Second call - checking if conversation exists
      .mockImplementationOnce(() => Promise.resolve({
        exists: () => false
      }))
      // Third and fourth calls - checking userChats
      .mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        data: () => ({
          chats: []
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        exists: () => true,
        data: () => ({
          chats: []
        })
      }));

    // Spy on Firebase operations
    const setDocSpy = jest.spyOn(require('firebase/firestore'), 'setDoc');
    const updateDocSpy = jest.spyOn(require('firebase/firestore'), 'updateDoc');

    // Render the component
    render(<AddUser />, { wrapper: Wrapper });

    // Search for the user
    const searchInput = screen.getByPlaceholderText('username');
    const searchButton = screen.getByText('Search');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'testFriend' } });
      fireEvent.click(searchButton);
    });

    // Wait for search results and verify user appears
    await waitFor(() => {
      expect(screen.getByText('testFriend')).toBeInTheDocument();
    });

    // Click the Add User button
    const addButton = screen.getByRole('button', { name: /add user/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Verify the chat creation process
    await waitFor(() => {
      // Check if conversation document was created
      expect(setDocSpy).toHaveBeenCalledWith(
        expect.any(Object), // conversation doc reference
        expect.objectContaining({
          messages: [],
          participants: expect.arrayContaining(['test-uid', 'friend123']),
          username: 'testFriend',
          currentUser: 'test-user'
        })
      );

      expect(updateDocSpy).toHaveBeenCalledTimes(1);

      // Verify chat context was updated
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CHANGE_USER',
        payload: expect.objectContaining({
          user: expect.objectContaining({
            username: 'testFriend',
            uid: 'friend123'
          })
        })
      });
    });

    // Clean up spies
    setDocSpy.mockRestore();
    updateDocSpy.mockRestore();
  });

  it('should handle errors during chat creation', async () => {
    // Mock the Firebase functions with an error scenario
    const { getDocs, getDoc, setDoc } = require('firebase/firestore');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock successful search
    getDocs.mockImplementation(() => Promise.resolve({
      empty: false,
      docs: [{
        id: 'friend123',
        data: () => ({
          uid: 'friend123',
          username: 'testFriend',
          friends: ['test-uid']
        })
      }]
    }));

    // Mock user verification
    getDoc.mockImplementationOnce(() => Promise.resolve({
      exists: () => true,
      data: () => ({
        friends: ['friend123']
      })
    }));

    // Mock setDoc to throw an error
    setDoc.mockRejectedValue(new Error('Failed to create chat'));

    // Render component
    render(<AddUser />, { wrapper: Wrapper });

    // Perform search
    const searchInput = screen.getByPlaceholderText('username');
    const searchButton = screen.getByText('Search');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'testFriend' } });
      fireEvent.click(searchButton);
    });

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('testFriend')).toBeInTheDocument();
    });

    // Click add user button
    const addButton = screen.getByRole('button', { name: /add user/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Verify error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating chat:',
        expect.any(Error)
      );
    });

    // Clean up
    consoleSpy.mockRestore();
  });
});
});
