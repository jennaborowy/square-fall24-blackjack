import { render, screen } from '@testing-library/react';
import UserInfo from '@/app/messages/list/userInfo/userInfo'; // Path to your UserInfo component
import { AuthContext } from '@/app/messages/AuthContext'; // Correct import path
import { ChatContext } from '@/app/messages/ChatContext'; // Correct import path
import '@testing-library/jest-dom';

describe('UserInfo Component', () => {
  it('should render currentUser username when provided', () => {
    const mockCurrentUser = {
      username: 'TestUser',
    };

    const mockDispatch = jest.fn();

    // Mock the context values
    render(
      <AuthContext.Provider value={{ currentUser: mockCurrentUser }}>
        <ChatContext.Provider value={{ dispatch: mockDispatch }}>
          <UserInfo />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Verify that the username is rendered
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('should not render username if currentUser is undefined', () => {
    const mockDispatch = jest.fn();

    // Mock the context values with no currentUser
    render(
      <AuthContext.Provider value={{ currentUser: undefined }}>
        <ChatContext.Provider value={{ dispatch: mockDispatch }}>
          <UserInfo />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );

    // Verify that no username is rendered
    expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
  });
});