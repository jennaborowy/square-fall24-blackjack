import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import Chat from '@/app/messages/chat/chat';
import { AuthContext } from '@/app/messages/AuthContext';
import { ChatContext } from '@/app/messages/ChatContext';
import {getDoc, onSnapshot, updateDoc} from "firebase/firestore";
import '@testing-library/jest-dom';

// Mock Firebase functions
jest.mock('firebase/firestore', () => {
  const mockDoc = jest.fn((db, collection, id) => ({
    path: `${collection}/${id}`
  }));

  return {
    doc: mockDoc,
    getDoc: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn(),
    arrayUnion: jest.fn(data => data),
    serverTimestamp: jest.fn(() => new Date('2024-01-01T00:00:00Z')),
    getFirestore: jest.fn()
  };
});
// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000'
  }
});

describe('Chat Component', () => {
  const mockScrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  const mockCurrentUser = {
    uid: 'currentUser123'
  };

  const mockChatData = {
    conversationId: 'conversation123',
    participants: ['currentUser123', 'otherUser456']
  };

  const mockDispatch = jest.fn();


  const mockConversationData = {
    messages: [
      {
        id: '1',
        senderId: 'currentUser123',
        text: 'Hello',
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        senderId: 'otherUser456',
        text: 'Hi there',
        createdAt: '2024-01-01T10:01:00Z'
      }
    ],
    participants: ['currentUser123', 'otherUser456']
  };

  const mockUserChatsData = {
    chats: [
      {
        chatId: 'conversation123',
        lastMessage: 'Previous message',
        updatedAt: Date.now() - 1000,
        isSeen: false
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();

    // Mock getDoc implementation
    getDoc.mockImplementation((ref) => {
      if (ref.path?.includes('conversations')) {
        return Promise.resolve({
          exists: () => true,
          data: () => mockConversationData
        });
      }
      // Mock userChats document
      if (ref.path?.includes('userChats')) {
        return Promise.resolve({
          exists: () => true,
          data: () => mockUserChatsData
        });
      }
      // Mock users document
      return Promise.resolve({
        exists: () => true,
        data: () => ({
          username: 'TestUser'
        })
      });
    });


    // Mock onSnapshot implementation
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => mockConversationData
      });
      return () => {};
    });
    updateDoc.mockImplementation(() => Promise.resolve());
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: mockChatData, dispatch: mockDispatch }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('renders empty state when no conversation is selected', () => {
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: { conversationId: null }, dispatch: mockDispatch }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Select a chat or start a new conversation')).toBeInTheDocument();
  });

  test('renders messages from Firebase', async () => {
    await act(async () => {
      renderComponent();
    });

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  test('sends a new message', async () => {
    await act(async () => {
      renderComponent();
    });

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.click(sendButton);
    });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        messages: expect.any(Object),
        lastUpdate: expect.any(Date)
      })
    );
  });

  test('does not send empty messages', async () => {
    await act(async () => {
      renderComponent();
    });

    const sendButton = screen.getByText('Send');

    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('formats time correctly', async () => {
    await act(async () => {
      renderComponent();
    });

    // Wait for any asynchronous operations
    await act(async () => {
      await Promise.resolve();
    });

    // Match the existing time elements in the DOM
    const timeElements = screen.getAllByText((content, element) =>
      element.tagName.toLowerCase() === 'span' && content.trim().endsWith('AM')
    );

    // Check that the times rendered correctly
    expect(timeElements).toHaveLength(2); // Adjust this based on expected count
    expect(timeElements[0]).toHaveTextContent('05:00 AM');
    expect(timeElements[1]).toHaveTextContent('05:01 AM');
  });


  test('applies correct message styling for own messages', async () => {
    await act(async () => {
      renderComponent();
    });

    const messages = document.querySelectorAll('.message');
    const ownMessage = document.querySelector('.message.own');

    expect(messages.length).toBe(2); // Total messages
    expect(ownMessage).toBeInTheDocument(); // At least one own message
  });
});
