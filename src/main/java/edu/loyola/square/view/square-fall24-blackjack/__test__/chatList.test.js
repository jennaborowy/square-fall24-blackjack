import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import ChatList from '@/app/messages/list/chatList/ChatList';
import { AuthContext } from "@/app/messages/AuthContext";
import { ChatContext } from "@/app/messages/ChatContext";
import '@testing-library/jest-dom';
import {onSnapshot, doc, getDoc} from "firebase/firestore";

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn((db, path) => ({ id: path, data: jest.fn() })), // Mock Firestore `doc`
  onSnapshot: jest.fn((ref, callback) => {
    setTimeout(() => {
      callback({
        exists: () => true,
        data: () => ({
          chats: [
            { chatId: '1', receiverId: '2', receiverName: 'Friend 1', lastMessage: 'Hello' },
            { chatId: '2', receiverId: '3', receiverName: 'Friend 2', lastMessage: 'How are you?' },
          ],
        }),
      });
    }, 0); // Mimic asynchronous behavior
    return jest.fn(); // Unsubscribe mock
  }),
  getDoc: jest.fn((docRef) => {
    if (docRef.id === "validId") {
      return Promise.resolve({
        exists: () => true,
        data: () => ({ name: "Test User" }),
      });
    } else {
      return Promise.resolve({ exists: () => false });
    }
  }),
}));

// Mock context values
const mockAuthContext = {
  currentUser: {
    uid: 'testUserId',
    username: 'Test User',
  },
};

const mockChatContext = {
  dispatch: jest.fn(),
};


describe('ChatList Component', () => {
  it('renders a list of chats', async () => {
    // Mock Firestore data
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          chats: [
            { chatId: '1', receiverId: '2', receiverName: 'Friend 1', lastMessage: 'Hello' },
            { chatId: '2', receiverId: '3', receiverName: 'Friend 2', lastMessage: 'How are you?' },
          ]
        })
      });
      return jest.fn(); // Unsubscribe mock
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ChatList />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Check that chats are rendered
    await waitFor(() => {
      expect(screen.getByText('Friend 1')).toBeInTheDocument();
      expect(screen.getByText('Friend 2')).toBeInTheDocument();
    });
  });

  it('opens and closes the add user form', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ChatList />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Check that AddUser is not visible initially
    expect(screen.queryByText('AddUser Component')).toBeNull();

    // Click on the add button
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    // Check that AddUser is visible after clicking
    expect(screen.getByText('AddUser Component')).toBeInTheDocument();

    // Click on the remove button to close the AddUser form
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    // Check that AddUser is no longer visible
    expect(screen.queryByText('AddUser Component')).toBeNull();
  });


  it('selects a chat and dispatches the correct action', () => {
    const mockChat = {
      chatId: '1',
      receiverId: '2',
      receiverName: 'Friend 1',
      lastMessage: 'Hello',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ChatList />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Click on a chat
    fireEvent.click(screen.getByText('Friend 1'));

    // Check if dispatch was called with the correct payload
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CHANGE_USER',
      payload: {
        user: { ...mockChat, uid: mockChat.receiverId },
        chatId: 'testUserId_2',
        conversationId: 'testUserId_2',
      }
    });
  });
});
