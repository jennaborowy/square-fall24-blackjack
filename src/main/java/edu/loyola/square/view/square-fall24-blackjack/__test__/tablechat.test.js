import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableChat from '@/app/messages/tablechat/tablechat';
import { auth } from '@/firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('firebase/auth');
jest.mock('@/firebaseConfig', () => ({
  auth: {},
  db: {}
}));

describe('TableChat Component', () => {
  const mockDb = {};
  const mockTableId = 'test-table-id';
  const mockUser = {
    uid: 'test-user-id'
  };
  const mockOnClose = jest.fn();
  const mockMessages = [
    {
      id: '1',
      senderId: 'test-user-id',
      text: 'Hello',
      createdAt: '2024-03-19T10:00:00.000Z'
    },
    {
      id: '2',
      senderId: 'other-user-id',
      text: 'Hi there',
      createdAt: '2024-03-19T10:01:00.000Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock crypto.randomUUID
    global.crypto = {
      randomUUID: () => 'test-uuid'
    };

    // Mock auth state
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    // Mock Firestore snapshot
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          messages: mockMessages
        })
      });
      return () => {};
    });
  });

  test('renders chat box with messages', async () => {
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={mockOnClose}
        />
      );
    });

    expect(screen.getByText('Table Name')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  test('handles message sending', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ messages: mockMessages })
    });

    updateDoc.mockResolvedValueOnce();

    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={mockOnClose}
        />
      );
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
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: 'test-uuid',
            text: 'New message',
            senderId: mockUser.uid
          })
        ])
      })
    );

    expect(input.value).toBe('');
  });

  test('closes chat when close button is clicked', async () => {
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={mockOnClose}
        />
      );
    });

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles empty message input', async () => {
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={mockOnClose}
        />
      );
    });

    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  test('formats time correctly', async () => {
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={mockOnClose}
        />
      );
    });

    const timeString = new Date('2024-03-19T10:00:00.000Z').toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    expect(screen.getByText(new RegExp(timeString))).toBeInTheDocument();
  });
});

describe('TableChat Message Display', () => {
  const mockDb = {};
  const mockTableId = 'test-table-id';
  const mockUser = {
    uid: 'test-user-id'
  };
  const mockMessages = [
    {
      id: '1',
      senderId: 'test-user-id',  // Current user's message
      text: 'Hello from me',
      createdAt: '2024-03-19T10:00:00.000Z',
      username: 'CurrentUser'
    },
    {
      id: '2',
      senderId: 'other-user-id', // Other user's message
      text: 'Hello from other',
      createdAt: '2024-03-19T10:01:00.000Z',
      username: 'OtherUser'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock crypto globally
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: jest.fn(() => 'test-uuid')
      }
    });

    // Mock auth state
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    // Mock Firestore snapshot
    onSnapshot.mockImplementation((docRef, callback) => {
      callback({
        exists: () => true,
        data: () => ({
          messages: mockMessages
        })
      });
      return () => {};
    });

    doc.mockImplementation(() => ({ id: mockTableId }));
  });

  test('messages are displayed with correct styling based on sender', async () => {
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={() => {}}
        />
      );
    });

    // Get message containers
    const messageContainers = screen.getAllByRole('generic').filter(
      element => element.className.includes('message')
    );

    // Verify we have two messages
    expect(messageContainers).toHaveLength(2);

    // Check current user's message styling
    const currentUserMessage = messageContainers.find(
      container => container.textContent.includes('Hello from me')
    );
    expect(currentUserMessage).toHaveClass('message own');

    // Check other user's message styling
    const otherUserMessage = messageContainers.find(
      container => container.textContent.includes('Hello from other')
    );
    expect(otherUserMessage).toHaveClass('message');
    expect(otherUserMessage).not.toHaveClass('own');

    // Verify message content
    expect(screen.getByText('Hello from me')).toBeInTheDocument();
    expect(screen.getByText('Hello from other')).toBeInTheDocument();

    // Verify timestamps are formatted correctly
    const expectedTime = new Date('2024-03-19T10:00:00.000Z').toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(new RegExp(expectedTime))).toBeInTheDocument();

    // Verify usernames are displayed
    expect(screen.getByText(/CurrentUser/)).toBeInTheDocument();
    expect(screen.getByText(/OtherUser/)).toBeInTheDocument();
  });

  test('message list updates when new messages arrive', async () => {
    // Initial render
    await act(async () => {
      render(
        <TableChat
          db={mockDb}
          tableId={mockTableId}
          onClose={() => {}}
        />
      );
    });

    // Verify initial messages
    expect(screen.getByText('Hello from me')).toBeInTheDocument();
    expect(screen.getByText('Hello from other')).toBeInTheDocument();

    // Simulate new message arriving via onSnapshot
    const updatedMessages = [
      ...mockMessages,
      {
        id: '3',
        senderId: 'third-user-id',
        text: 'New message arrived',
        createdAt: '2024-03-19T10:02:00.000Z',
        username: 'ThirdUser'
      }
    ];

    await act(async () => {
      onSnapshot.mock.calls[0][1]({
        exists: () => true,
        data: () => ({
          messages: updatedMessages
        })
      });
    });

    // Verify new message appears
    expect(screen.getByText('New message arrived')).toBeInTheDocument();
    expect(screen.getByText(/ThirdUser/)).toBeInTheDocument();

    // Verify all messages are still present
    expect(screen.getAllByRole('generic').filter(
      element => element.className.includes('message')
    )).toHaveLength(3);
  });
});