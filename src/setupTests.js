// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock HTMLElement.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.readAsDataURL = jest.fn();
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }
};

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
};

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Mock Geolocation API
global.navigator.geolocation = {
  getCurrentPosition: jest.fn().mockImplementationOnce((success) => Promise.resolve(
    success({
      coords: {
        latitude: 14.6928,
        longitude: -17.4467,
      },
    })
  )),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

// Mock fetch if not already mocked
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true,
      status: 200,
    })
  );
} 