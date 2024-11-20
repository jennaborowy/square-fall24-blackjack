import { render, screen, fireEvent } from '@testing-library/react';
import ChatBox from '@/app/messages/chatbox/chatbox';
import '@testing-library/jest-dom';

// Mocking child components
jest.mock('@/app/messages/list/list', () => jest.fn(() => <div>List Component</div>));
jest.mock('@/app/messages/chat/chat', () => jest.fn(() => <div>Chat Component</div>));

describe('ChatBox Component', () => {

  // Test rendering of components and children
  it('should render the chat box with List and Chat components', () => {
    render(<ChatBox onClose={jest.fn()} />);

    // Check if the List and Chat components are rendered
    expect(screen.getByText('List Component')).toBeInTheDocument();
    expect(screen.getByText('Chat Component')).toBeInTheDocument();
  });

  // Test the close button functionality
  it('should call onClose when the close button is clicked', () => {
    const mockOnClose = jest.fn(); // Mock the onClose function
    render(<ChatBox onClose={mockOnClose} />);

    // Simulate clicking the close button
    fireEvent.click(screen.getByText('×'));

    // Check if onClose function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test if the ChatBox container is rendered correctly
  it('should render the chat box container with the correct class', () => {
    const { container } = render(<ChatBox onClose={jest.fn()} />);

    // Check if the class "chat-box" is present in the rendered container
    const chatBoxContainer = container.querySelector('.chat-box');
    expect(chatBoxContainer).toBeInTheDocument();
  });

});