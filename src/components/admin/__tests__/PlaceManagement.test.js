import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';
import PlaceManagement from '../PlaceManagement';
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
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockPlaces = [
  {
    _id: 'place1',
    name: 'Test Restaurant',
    description: 'A great place to eat',
    type: 'restaurant',
    region: 'Dakar',
    city: 'Dakar',
    status: 'active',
    rating: 4.5,
    images: [{ url: 'https://example.com/image.jpg' }],
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    _id: 'place2',
    name: 'Test Cafe',
    description: 'Nice coffee shop',
    type: 'cafe',
    region: 'Thiès',
    city: 'Thiès',
    status: 'inactive',
    rating: 3.8,
    images: [],
    createdAt: '2023-01-02T00:00:00.000Z',
  },
];

const mockPlaceTypes = ['restaurant', 'cafe', 'bar', 'fast_food'];

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PlaceManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.placesAPI = {
      getPlaces: jest.fn().mockResolvedValue({
        places: mockPlaces,
        total: mockPlaces.length,
      }),
      getPlaceTypes: jest.fn().mockResolvedValue(mockPlaceTypes),
      deletePlace: jest.fn().mockResolvedValue({}),
      syncPlacesFromGoogle: jest.fn().mockResolvedValue({ addedCount: 5 }),
    };
  });

  test('renders place management interface', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Place Management')).toBeInTheDocument();
    expect(screen.getByText('Manage restaurants, cafes, and other places in the system')).toBeInTheDocument();
    expect(screen.getByText('Add Place')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    api.placesAPI.getPlaces = jest.fn().mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    expect(screen.getByText('Loading places...')).toBeInTheDocument();
  });

  test('displays places in table format', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Test Cafe')).toBeInTheDocument();
    });
  });

  test('search functionality works', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search places...');
    fireEvent.change(searchInput, { target: { value: 'Restaurant' } });

    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Restaurant',
        })
      );
    });
  });

  test('region filter works', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    const regionSelect = screen.getByDisplayValue('All Regions');
    fireEvent.change(regionSelect, { target: { value: 'Dakar' } });

    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'Dakar',
        })
      );
    });
  });

  test('type filter works', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'restaurant' } });
    });

    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'restaurant',
        })
      );
    });
  });

  test('displays correct statistics', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total places
      expect(screen.getByText('1')).toBeInTheDocument(); // Active places
    });
  });

  test('shows status badges correctly', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  test('delete place functionality works', async () => {
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(api.placesAPI.deletePlace).toHaveBeenCalledWith('place1');
    });
  });

  test('delete confirmation dialog works', async () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false);

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    expect(api.placesAPI.deletePlace).not.toHaveBeenCalled();
  });

  test('sync places functionality works', async () => {
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const syncSelect = screen.getByDisplayValue('Sync from Google');
      fireEvent.change(syncSelect, { target: { value: 'Dakar' } });
    });

    await waitFor(() => {
      expect(api.placesAPI.syncPlacesFromGoogle).toHaveBeenCalledWith('Dakar');
    });
  });

  test('bulk selection works', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      // Select all checkbox
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
    });

    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('2 places selected')).toBeInTheDocument();
      expect(screen.getByText('Activate')).toBeInTheDocument();
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  test('individual place selection works', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      // Select individual place checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First place checkbox
    });

    await waitFor(() => {
      expect(screen.getByText('1 place selected')).toBeInTheDocument();
    });
  });

  test('pagination works correctly', async () => {
    // Mock API to return more items to trigger pagination
    api.placesAPI.getPlaces = jest.fn().mockResolvedValue({
      places: Array(20).fill(null).map((_, i) => ({
        ...mockPlaces[0],
        _id: `place${i}`,
        name: `Place ${i}`,
      })),
      total: 50,
    });

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 20 of 50 places')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  test('view place functionality works', async () => {
    // Mock window.open
    window.open = jest.fn();

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const viewButtons = screen.getAllByTitle('View');
      fireEvent.click(viewButtons[0]);
    });

    expect(window.open).toHaveBeenCalledWith('/places/place1', '_blank');
  });

  test('edit place modal opens', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByText('Edit Place')).toBeInTheDocument();
  });

  test('create place modal opens', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Place');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Place')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    api.placesAPI.getPlaces = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load places')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('shows empty state when no places found', async () => {
    api.placesAPI.getPlaces = jest.fn().mockResolvedValue({
      places: [],
      total: 0,
    });

    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No places found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or add a new place.')).toBeInTheDocument();
    });
  });

  test('image display works correctly', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show image for place with images
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  test('displays place type badges', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('restaurant')).toBeInTheDocument();
      expect(screen.getByText('cafe')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
      expect(screen.getByText('Jan 2, 2023')).toBeInTheDocument();
    });
  });

  test('calculates average rating correctly', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      // Average of 4.5 and 3.8 should be 4.2
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('PlaceManagement Integration', () => {
  test('integrates with places API correctly', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledWith({
        search: '',
        region: '',
        type: '',
        page: 1,
        limit: 20,
        includeInactive: true,
      });
      expect(api.placesAPI.getPlaceTypes).toHaveBeenCalled();
    });
  });

  test('refreshes data after mutations', async () => {
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledTimes(1);
    });

    // Clear mock call history
    api.placesAPI.getPlaces.mockClear();

    // Perform delete action
    window.confirm = jest.fn().mockReturnValue(true);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
    });

    // Should refresh places after delete
    await waitFor(() => {
      expect(api.placesAPI.getPlaces).toHaveBeenCalledTimes(1);
    });
  });
});

// Performance tests
describe('PlaceManagement Performance', () => {
  test('handles large datasets efficiently', async () => {
    const largePlacesList = Array(100).fill(null).map((_, i) => ({
      ...mockPlaces[0],
      _id: `place${i}`,
      name: `Place ${i}`,
    }));

    api.placesAPI.getPlaces = jest.fn().mockResolvedValue({
      places: largePlacesList.slice(0, 20),
      total: largePlacesList.length,
    });

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <PlaceManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Place 0')).toBeInTheDocument();
    });

    const endTime = performance.now();
    
    // Should render within reasonable time (< 1000ms for testing)
    expect(endTime - startTime).toBeLessThan(1000);
  });
});

export default PlaceManagement; 