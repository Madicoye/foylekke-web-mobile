import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import ReviewForm from '../ReviewForm';
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
};

const mockReview = {
  _id: 'review1',
  rating: 4,
  title: 'Great place!',
  content: 'Had an amazing time here.',
  images: ['https://example.com/image1.jpg'],
};

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

describe('ReviewForm Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    api.reviewsAPI = {
      createReview: jest.fn().mockResolvedValue({ _id: 'new-review' }),
      updateReview: jest.fn().mockResolvedValue({ _id: 'review1' }),
    };
  });

  test('renders review form for creating new review', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Review title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell others about your experience...')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
  });

  test('renders review form for editing existing review', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          existingReview={mockReview}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Edit Review')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Great place!')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Had an amazing time here.')).toBeInTheDocument();
    expect(screen.getByText('Update Review')).toBeInTheDocument();
  });

  test('star rating works correctly', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    
    // Click 4th star
    fireEvent.click(stars[3]);
    
    // Check if rating is updated
    expect(stars[3]).toHaveClass('text-yellow-400');
  });

  test('form validation works for required fields', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    });
  });

  test('submits new review correctly', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Fill out form
    const titleInput = screen.getByPlaceholderText('Review title');
    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    
    fireEvent.change(titleInput, { target: { value: 'Great experience' } });
    fireEvent.change(contentTextarea, { target: { value: 'Really enjoyed my visit!' } });

    // Set rating
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    fireEvent.click(stars[4]); // 5 stars

    // Submit
    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.reviewsAPI.createReview).toHaveBeenCalledWith(
        'place1',
        expect.objectContaining({
          rating: 5,
          title: 'Great experience',
          content: 'Really enjoyed my visit!',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('updates existing review correctly', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          existingReview={mockReview}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Modify content
    const contentTextarea = screen.getByDisplayValue('Had an amazing time here.');
    fireEvent.change(contentTextarea, { target: { value: 'Updated review content' } });

    // Submit
    const updateButton = screen.getByText('Update Review');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(api.reviewsAPI.updateReview).toHaveBeenCalledWith(
        'review1',
        expect.objectContaining({
          content: 'Updated review content',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('cancel button works', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('image upload works', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const fileInput = screen.getByText('Add Photos').closest('label').querySelector('input[type="file"]');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  test('removes uploaded images', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Add image first
    const fileInput = screen.getByText('Add Photos').closest('label').querySelector('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Remove image
    const removeButton = screen.getByTitle('Remove image');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    });
  });

  test('validates image file size', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const fileInput = screen.getByText('Add Photos').closest('label').querySelector('input[type="file"]');
    
    // Create large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 5MB/)).toBeInTheDocument();
    });
  });

  test('validates maximum number of images', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const fileInput = screen.getByText('Add Photos').closest('label').querySelector('input[type="file"]');
    
    // Add 7 images (max is 6)
    const files = Array(7).fill(null).map((_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    );
    
    fireEvent.change(fileInput, { target: { files } });

    await waitFor(() => {
      expect(screen.getByText(/You can upload a maximum of 6 images/)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    api.reviewsAPI.createReview = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Fill and submit form
    const titleInput = screen.getByPlaceholderText('Review title');
    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } });

    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    fireEvent.click(stars[4]);

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.reviewsAPI.createReview).toHaveBeenCalled();
      // Error handling should be triggered
    });
  });

  test('shows character count for content', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    fireEvent.change(contentTextarea, { target: { value: 'Hello world' } });

    expect(screen.getByText('11/1000')).toBeInTheDocument();
  });

  test('renders as modal when isModal prop is true', () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          isModal={true}
        />
      </TestWrapper>
    );

    // Should have modal background
    const modalBackground = screen.getByRole('dialog') || screen.getByTestId('modal-backdrop');
    expect(modalBackground).toBeInTheDocument();
  });

  test('drag and drop functionality works', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const dropzone = screen.getByText(/Drag & drop images here/);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const dataTransfer = {
      files: [file],
      items: [{
        kind: 'file',
        type: 'image/jpeg',
        getAsFile: () => file,
      }],
      types: ['Files'],
    };

    fireEvent.dragOver(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  test('validates content length', async () => {
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    
    // Try to submit with very short content
    fireEvent.change(contentTextarea, { target: { value: 'hi' } });

    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    fireEvent.click(stars[4]);

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Content must be at least 10 characters/)).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('ReviewForm Integration', () => {
  test('integrates with reviews API correctly for creation', async () => {
    const mockOnSuccess = jest.fn();
    
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    // Complete form submission flow
    const titleInput = screen.getByPlaceholderText('Review title');
    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    
    fireEvent.change(titleInput, { target: { value: 'Integration Test' } });
    fireEvent.change(contentTextarea, { target: { value: 'This is an integration test review' } });

    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    fireEvent.click(stars[3]);

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.reviewsAPI.createReview).toHaveBeenCalledWith(
        'place1',
        expect.objectContaining({
          rating: 4,
          title: 'Integration Test',
          content: 'This is an integration test review',
          images: [],
        })
      );
    });
  });

  test('handles successful form submission', async () => {
    const mockOnSuccess = jest.fn();
    
    render(
      <TestWrapper>
        <ReviewForm
          placeId="place1"
          onSuccess={mockOnSuccess}
          onCancel={jest.fn()}
        />
      </TestWrapper>
    );

    // Submit valid form
    const titleInput = screen.getByPlaceholderText('Review title');
    fireEvent.change(titleInput, { target: { value: 'Test Review' } });

    const contentTextarea = screen.getByPlaceholderText('Tell others about your experience...');
    fireEvent.change(contentTextarea, { target: { value: 'Great experience overall!' } });

    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('star')
    );
    fireEvent.click(stars[4]);

    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

export default ReviewForm; 