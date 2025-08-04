import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import NotificationsPage from '../NotificationsPage';
import { AuthProvider } from '../../contexts/AuthContext';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');
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
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
};

const mockNotifications = [
  {
    _id: 'notif1',
    title: 'New hangout invitation',
    message: 'You have been invited to join a hangout',
    type: 'hangout_invite',
    isRead: false,
    createdAt: '2023-12-01T10:00:00.000Z',
    actionUrl: '/hangouts/123',
  },
  {
    _id: 'notif2',
    title: 'New review on your place',
    message: 'Someone left a review on your restaurant',
    type: 'place_review',
    isRead: true,
    createdAt: '2023-12-01T09:00:00.000Z',
    actionUrl: '/places/456',
  },
  {
    _id: 'notif3',
    title: 'System announcement',
    message: 'New features have been added to the platform',
    type: 'system',
    isRead: false,
    createdAt: '2023-12-01T08:00:00.000Z',
    actionUrl: null,
  },
];

const mockNotificationTypes = [
  { id: 'hangout_invite', name: 'Hangout Invitations', description: 'Notifications about hangout invitations' },
  { id: 'place_review', name: 'Place Reviews', description: 'Notifications about reviews on your places' },
  { id: 'system', name: 'System Announcements', description: 'Important system updates and announcements' },
];

const mockPreferences = {
  hangout_invite: { email: true, push: true },
  place_review: { email: true, push: false },
  system: { email: true, push: true },
};

const TestWrapper = ({ children, user = mockUser }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const mockAuth = {
    user,
    isAuthenticated: !!user,
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

describe('NotificationsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.notificationsAPI = {
      getNotifications: jest.fn().mockResolvedValue({
        notifications: mockNotifications,
        total: mockNotifications.length,
      }),
      getNotificationTypes: jest.fn().mockResolvedValue(mockNotificationTypes),
      getNotificationPreferences: jest.fn().mockResolvedValue(mockPreferences),
      markAsRead: jest.fn().mockResolvedValue({}),
      markAllAsRead: jest.fn().mockResolvedValue({}),
      deleteNotification: jest.fn().mockResolvedValue({}),
      updateNotificationPreferences: jest.fn().mockResolvedValue({}),
    };
  });

  test('renders notifications page for authenticated user', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Stay updated with your latest activities and updates')).toBeInTheDocument();
  });

  test('shows login message for unauthenticated user', () => {
    render(
      <TestWrapper user={null}>
        <NotificationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Please Log In')).toBeInTheDocument();
    expect(screen.getByText('You need to be logged in to view notifications.')).toBeInTheDocument();
  });

  test('displays notifications correctly', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('New hangout invitation')).toBeInTheDocument();
      expect(screen.getByText('New review on your place')).toBeInTheDocument();
      expect(screen.getByText('System announcement')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    api.notificationsAPI.getNotifications = jest.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  test('marks single notification as read', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const markReadButtons = screen.getAllByTitle('Mark as read');
      fireEvent.click(markReadButtons[0]);
    });

    expect(api.notificationsAPI.markAsRead).toHaveBeenCalledWith('notif1');
  });

  test('marks all notifications as read', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    const markAllReadButton = screen.getByText('Mark All Read');
    fireEvent.click(markAllReadButton);

    await waitFor(() => {
      expect(api.notificationsAPI.markAllAsRead).toHaveBeenCalled();
    });
  });

  test('deletes single notification', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(api.notificationsAPI.deleteNotification).toHaveBeenCalledWith('notif1');
  });

  test('search functionality works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search notifications...');
    fireEvent.change(searchInput, { target: { value: 'hangout' } });

    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'hangout',
        })
      );
    });
  });

  test('type filter works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'hangout_invite' } });
    });

    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hangout_invite',
        })
      );
    });
  });

  test('status filter works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'unread' } });

    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: false,
        })
      );
    });
  });

  test('clear filters functionality works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search notifications...');
    const typeSelect = screen.getByDisplayValue('All Types');
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => {
      fireEvent.change(typeSelect, { target: { value: 'hangout_invite' } });
    });

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(typeSelect.value).toBe('all');
  });

  test('bulk selection works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Select all checkbox
      const selectAllCheckbox = screen.getByText(/Select All/);
      fireEvent.click(selectAllCheckbox);
    });

    await waitFor(() => {
      expect(screen.getByText('3 notifications selected')).toBeInTheDocument();
      expect(screen.getByText('Mark Read')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  test('individual notification selection works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // Select first notification checkbox (not the select all)
      fireEvent.click(checkboxes[1]);
    });

    await waitFor(() => {
      expect(screen.getByText('1 notification selected')).toBeInTheDocument();
    });
  });

  test('bulk mark as read works', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Select notification
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
    });

    await waitFor(() => {
      const markReadButton = screen.getByText('Mark Read');
      fireEvent.click(markReadButton);
    });

    expect(api.notificationsAPI.markAsRead).toHaveBeenCalled();
  });

  test('bulk delete works', async () => {
    window.confirm = jest.fn().mockReturnValue(true);

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Select notification
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
    });

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    expect(api.notificationsAPI.deleteNotification).toHaveBeenCalled();
  });

  test('preferences modal opens and closes', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    const preferencesButton = screen.getByText('Preferences');
    fireEvent.click(preferencesButton);

    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });
  });

  test('preferences can be updated', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    const preferencesButton = screen.getByText('Preferences');
    fireEvent.click(preferencesButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Preferences');
      fireEvent.click(saveButton);
    });

    expect(api.notificationsAPI.updateNotificationPreferences).toHaveBeenCalled();
  });

  test('pagination works correctly', async () => {
    // Mock API to return more items to trigger pagination
    api.notificationsAPI.getNotifications = jest.fn().mockResolvedValue({
      notifications: Array(20).fill(null).map((_, i) => ({
        ...mockNotifications[0],
        _id: `notif${i}`,
        title: `Notification ${i}`,
      })),
      total: 50,
    });

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 20 of 50 notifications')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  test('displays correct notification icons', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Check that different notification types have different icons
      expect(screen.getByText('👥')).toBeInTheDocument(); // hangout_invite
      expect(screen.getByText('📍')).toBeInTheDocument(); // place_review
      expect(screen.getByText('⚠️')).toBeInTheDocument(); // system
    });
  });

  test('formats time correctly', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show relative time formatting
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  test('shows unread notifications with special styling', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      // Unread notifications should have blue background
      const unreadNotifications = screen.getByText('New hangout invitation').closest('div');
      expect(unreadNotifications).toHaveClass('bg-blue-50');
    });
  });

  test('handles API errors gracefully', async () => {
    api.notificationsAPI.getNotifications = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('shows empty state when no notifications found', async () => {
    api.notificationsAPI.getNotifications = jest.fn().mockResolvedValue({
      notifications: [],
      total: 0,
    });

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No notifications found')).toBeInTheDocument();
      expect(screen.getByText(/You're all caught up/)).toBeInTheDocument();
    });
  });

  test('shows filtered empty state message', async () => {
    api.notificationsAPI.getNotifications = jest.fn().mockResolvedValue({
      notifications: [],
      total: 0,
    });

    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    // Set a filter
    const searchInput = screen.getByPlaceholderText('Search notifications...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No notifications found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });
  });

  test('notification clicks work for actionable notifications', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const notificationWithAction = screen.getByText('New hangout invitation').closest('div');
      fireEvent.click(notificationWithAction);
    });

    // Should mark as read when clicked
    expect(api.notificationsAPI.markAsRead).toHaveBeenCalledWith('notif1');
  });

  test('prevents bulk actions when no items selected', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    // Try to use bulk actions without selecting anything
    // This should show an error toast
    // Note: We'd need to implement this test based on actual component behavior
  });
});

// Integration tests
describe('NotificationsPage Integration', () => {
  test('integrates with notification API correctly', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledWith({
        type: 'all',
        status: 'all',
        search: '',
        page: 1,
        limit: 20,
        isRead: undefined,
      });
      expect(api.notificationsAPI.getNotificationTypes).toHaveBeenCalled();
    });
  });

  test('updates notification count after actions', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    // Initial load
    await waitFor(() => {
      expect(screen.getByText(/Select All \(3\)/)).toBeInTheDocument();
    });

    // Delete a notification
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    // Should refetch and update count
    await waitFor(() => {
      expect(api.notificationsAPI.getNotifications).toHaveBeenCalledTimes(2);
    });
  });
});

// Accessibility tests
describe('NotificationsPage Accessibility', () => {
  test('has proper ARIA labels and roles', async () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    expect(screen.getAllByRole('checkbox')).toHaveLength(4); // 3 notifications + select all
    expect(screen.getByRole('button', { name: /Mark All Read/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preferences/ })).toBeInTheDocument();
  });

  test('is keyboard navigable', () => {
    // Test that all interactive elements can be reached via keyboard
    // This would require more detailed implementation based on actual component
  });

  test('has proper heading structure', () => {
    render(
      <TestWrapper>
        <NotificationsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Notifications');
  });
});

export default NotificationsPage; 