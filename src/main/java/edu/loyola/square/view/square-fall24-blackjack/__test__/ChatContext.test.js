import { render, screen, fireEvent } from '@testing-library/react';
import { ChatContextProvider, ChatContext } from '@/app/messages/ChatContext'; // Adjust the import as needed
import { useContext } from 'react';
import '@testing-library/jest-dom';

describe('ChatContextProvider', () => {

  // Helper component to consume the context and render the values
  const TestComponent = () => {
    const { data, dispatch } = useContext(ChatContext);  // This should be inside the functional component
    return (
      <div>
        <div>
          <div data-testid="chatId">{data.chatId !== null ? data.chatId : 'null'}</div>
          <div data-testid="user">{data.user ? data.user.username : 'No User'}</div>
          <div data-testid="conversationId">{data.conversationId !== null ? data.conversationId : 'null'}</div>
        </div>
        <button
          onClick={() =>
            dispatch({
              type: 'CHANGE_USER',
              payload: {
                user: {username: 'TestUser'},
                chatId: 'chat123',
                conversationId: 'conv123',
              },
            })
          }
        >
          Change User
        </button>
        <button
          onClick={() =>
            dispatch({
              type: 'SET_CONVERSATION_ID',
              payload: 'conv456',
            })
          }
        >
          Set Conversation ID
        </button>
      </div>
    );
  };

  it('should render initial state with null values', () => {
    render(
      <ChatContextProvider>
        <TestComponent/>
      </ChatContextProvider>
    );

    expect(screen.getByTestId('chatId').textContent).toBe('null');
    expect(screen.getByTestId('user').textContent).toBe('No User');
    expect(screen.getByTestId('conversationId').textContent).toBe('null');
  });

  it('should update state when CHANGE_USER action is dispatched', () => {
    render(
      <ChatContextProvider>
        <TestComponent />
      </ChatContextProvider>
    );

    fireEvent.click(screen.getByText('Change User'));

    expect(screen.getByTestId('chatId').textContent).toBe('chat123');
    expect(screen.getByTestId('user').textContent).toBe('TestUser');
    expect(screen.getByTestId('conversationId').textContent).toBe('conv123');
  });

  it('should update conversationId when SET_CONVERSATION_ID action is dispatched', () => {
    render(
      <ChatContextProvider>
        <TestComponent />
      </ChatContextProvider>
    );

    fireEvent.click(screen.getByText('Set Conversation ID'));

    expect(screen.getByTestId('conversationId').textContent).toBe('conv456');
  });
});
