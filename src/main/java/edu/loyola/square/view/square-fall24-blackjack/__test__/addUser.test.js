import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddUser } from '@/app/messages/list/chatList/addUser/addUser';
import { AuthContext } from '@/app/messages/AuthContext';
import { ChatContext } from '@/app/messages/ChatContext';
import userEvent from "firebase-mock/browser/firebasemock";


// Mock the entire firebase/firestore module
jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(() => ({
    empty: false,
    docs: [{ id: 'mockUserId', data: () => ({ username: 'testFriend' }) }]
  })),
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(data => data),
  serverTimestamp: jest.fn(() => new Date())
}));

jest.mock('@/firebaseConfig', () => ({
  getFirestore: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: jest.fn().mockReturnValue(true),
    id: 'testUserId', // Add `id` here if used at the top level
    data: jest.fn().mockReturnValue({
      id: 'testUserId',
      username: 'testFriend',
    }),
  }),
}))
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

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

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


  describe('Chat Creation', () => {

    const { getDocs, setDoc, getDoc, updateDoc } = require('firebase/firestore');

    // Define mock data for users
    const mockUser = [
      {
        id: 'mockUserId',
        username: 'testFriend',
      },
    ];
    getDocs.mockImplementation(() =>
      Promise.resolve({
        empty: false,
        docs: mockUser.map(user => ({
          id: user.id,
          data: () => user
        }))
      })
    );


    it('should create a new chat and update userChats for both users', async () => {
      const mockSetDoc = jest.fn();
      const mockUpdateDoc = jest.fn();
      const mockDispatch = jest.fn();


      // Mock Firestore functions to simulate behavior
      require('firebase/firestore').setDoc.mockImplementation(mockSetDoc);
      require('firebase/firestore').getDoc.mockImplementation((docRef) => {
        if (docRef.data.id === 'userChats_testUserId') {
          return Promise.resolve({
            exists: () => true,
            data: () => ({
              id: 'testUserId', // Include the expected 'id' field
              username: 'testFriend',
              chats: [],
          }),
          });
        }
        return Promise.resolve({ exists: () => false });
      });
      require('firebase/firestore').updateDoc.mockImplementation(mockUpdateDoc);

      render(
        <AddUser />,
        { wrapper: Wrapper }
      );

      const searchInput = screen.getByPlaceholderText('username');
      const searchButton = screen.getByText('Search');

      // Mock user input for searching a friend
      fireEvent.change(searchInput, { target: { value: 'testFriend' } });
      fireEvent.click(searchButton);

      // Ensure the search result appears
      await waitFor(() => {
        expect(screen.getByText('testFriend')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add User');
      expect(addButton).toBeInTheDocument();

      // Mock the add user functionality
      await fireEvent.click(addButton);

      // Assert Firestore calls and dispatch
      await waitFor(() => {
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            conversationId: expect.any(String),
            createdAt: expect.any(Date),
            messages: [],
            participants: expect.arrayContaining(['mockUserId']),
          })
        );

        expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'CHANGE_USER',
          payload: expect.objectContaining({
            user: expect.objectContaining({ username: 'testFriend' }),
            chatId: expect.any(String),
            conversationId: expect.any(String),
          }),
        });
      });
    });
  });


});
});