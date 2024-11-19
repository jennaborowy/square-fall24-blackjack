import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from './Chat';
import { AuthContext } from '@/app/messages/AuthContext';
import { ChatContext } from '@/app/messages/ChatContext';
import { db } from '@/firebaseConfig';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  arrayUnion: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock context values
const mockCurrentUser = { uid: 'user123' };
const mockChatData = {
  conversationId: 'conv123',
  participants: ['user123', 'user456'],
};

describe('Chat Component', () => {
  beforeEach(() => {
    // Mock the getDoc and onSnapshot functions
    getDoc.mockResolvedValue({
      exists: true,
      data: () => ({
        messages: [],
        participants: mockChatData.participants,
      }),
    });
    onSnapshot.mockImplementation((docRef, onChange) => {
      onChange({ exists: true, data: () => ({ messages: [] }) });
      return jest.fn(); // Return unsubscribe function
    });
  });

  it('should render the chat component when a conversation is selected', () => {
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: mockChatData }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Check if the message input and send button are rendered
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should display a no-chat-selected message if no conversation is active', () => {
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: {} }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Check for the "no chat selected" message
    expect(screen.getByText(/select a chat or start a new conversation/i)).toBeInTheDocument();
  });

  it('should send a message and update the chat', async () => {
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: mockChatData }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type a message
    fireEvent.change(input, { target: { value: 'Hello!' } });

    // Simulate sending the message
    fireEvent.click(sendButton);

    // Wait for the asynchronous update (e.g., messages getting updated in the state)
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    expect(updateDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ text: 'Hello!' }),
        ]),
      })
    );
  });

  it('should scroll to the bottom when new messages are added', async () => {
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ data: mockChatData }}>
          <Chat />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    const endRef = screen.getByTestId('endRef'); // Assuming this element has a data-testid="endRef"

    // Scroll to the bottom to view the last message
    await waitFor(() => expect(endRef).toBeInTheDocument());
    expect(endRef.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
