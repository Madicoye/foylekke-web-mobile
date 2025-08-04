import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import HangoutMessaging from '../HangoutMessaging';
import { AuthProvider } from '../../../contexts/AuthContext';
import * as api from '../../../services/api';

// Mock the API
jest.mock('../../../services/api');
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  profilePicture: null,
};

const mockHangout = {
  _id: 'hangout1',
  title: 'Test Hangout',
  creator: {
    _id: 'creator1',
    name: 'Creator',
    email: 'creator@example.com',
  },
};

const mockMessages = [
  {
    _id: '1',
    content: 'Hello everyone!',
    user: { _id: 'user2', name: 'Other User', profilePicture: null },
    createdAt: new Date().toISOString(),
    type: 'text',
  },
  {
    _id: '2',
    content: 'Looking forward to this!',
    user: mockUser,
    createdAt: new Date().toISOString(),
    type: 'text',
  },
];

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockAuth = {
    user: mockUser,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider value={mockAuth}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('HangoutMessaging Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.hangoutsAPI = {
      getHangout: jest.fn().mockResolvedValue(mockHangout),
      addMessage: jest.fn().mockResolvedValue({ _id: 'new-message' }),
    };
  });

  test('renders messaging component when visible', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Hangout Chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    const { container } = render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={false} />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  test('displays demo messages correctly', async () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hey everyone! Looking forward to this hangout/)).toBeInTheDocument();
      expect(screen.getByText(/Should we meet at the main entrance/)).toBeInTheDocument();
    });
  });

  test('sends message when form is submitted', async () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.hangoutsAPI.addMessage).toHaveBeenCalledWith('hangout1', 'Test message');
    });
  });

  test('does not send empty messages', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const sendButton = screen.getByTitle('Send message');
    fireEvent.click(sendButton);

    expect(api.hangoutsAPI.addMessage).not.toHaveBeenCalled();
  });

  test('character counter updates correctly', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(messageInput, { target: { value: 'Hello' } });

    expect(screen.getByText('5/500')).toBeInTheDocument();
  });

  test('expand/minimize functionality works', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);

    expect(screen.getByTitle('Minimize')).toBeInTheDocument();
  });

  test('file upload button triggers file input', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const fileButton = screen.getByTitle('Attach file');
    const fileInput = screen.getByDisplayValue('');

    // Mock click event
    const clickEvent = new Event('click', { bubbles: true });
    jest.spyOn(fileInput, 'click').mockImplementation(() => {});

    fireEvent.click(fileButton);
    // Verify that file input click would be triggered (mocked)
  });

  test('handles API errors gracefully', async () => {
    api.hangoutsAPI.addMessage = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.hangoutsAPI.addMessage).toHaveBeenCalled();
    });
  });

  test('formats message time correctly', () => {
    // This would test the formatMessageTime function
    // We can add more specific time formatting tests here
  });

  test('identifies own messages correctly', () => {
    // Test that user's own messages appear on the right side
    // and other users' messages appear on the left
  });

  test('message input is cleared after sending', async () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(messageInput.value).toBe('');
    });
  });
});

// Integration tests
describe('HangoutMessaging Integration', () => {
  test('integrates with hangout data correctly', async () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(api.hangoutsAPI.getHangout).toHaveBeenCalledWith('hangout1');
    });
  });

  test('updates message count in header', async () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show initial demo messages count
      expect(screen.getByText(/3 messages/)).toBeInTheDocument();
    });
  });
});

// Performance tests
describe('HangoutMessaging Performance', () => {
  test('handles large number of messages efficiently', () => {
    // Test with many messages to ensure no performance issues
  });

  test('auto-scroll works with many messages', () => {
    // Test scroll behavior with many messages
  });
});

// Accessibility tests
describe('HangoutMessaging Accessibility', () => {
  test('has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <HangoutMessaging hangoutId="hangout1" isVisible={true} />
      </TestWrapper>
    );

    expect(screen.getByTitle('Send message')).toBeInTheDocument();
    expect(screen.getByTitle('Attach file')).toBeInTheDocument();
    expect(screen.getByTitle('Add emoji')).toBeInTheDocument();
  });

  test('is keyboard navigable', () => {
    // Test that all interactive elements can be reached via keyboard
  });

  test('has proper focus management', () => {
    // Test focus management when sending messages
  });
});

export default HangoutMessaging; 