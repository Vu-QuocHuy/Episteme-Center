import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

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
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data helpers
export const createMockTeacher = (overrides = {}) => ({
  id: '1',
  userId: {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123456789',
    gender: 'male' as const,
    role: 'teacher' as const,
  },
  isActive: true,
  description: 'Experienced teacher',
  ...overrides,
});

export const createMockStudent = (overrides = {}) => ({
  id: '1',
  userId: {
    id: 'user1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987654321',
    gender: 'female' as const,
    role: 'student' as const,
  },
  parentId: null,
  ...overrides,
});

export const createMockParent = (overrides = {}) => ({
  id: '1',
  userId: {
    id: 'user1',
    name: 'Parent Name',
    email: 'parent@example.com',
    phone: '555555555',
    gender: 'male' as const,
    role: 'parent' as const,
  },
  canSeeTeacherInfo: true,
  children: [],
  ...overrides,
});

export const createMockClass = (overrides = {}) => ({
  id: '1',
  name: 'Class A',
  year: 2024,
  grade: 10,
  section: 'A',
  status: 'active' as const,
  teacherId: null,
  students: [],
  ...overrides,
});

// API mock helpers
export const mockApiResponse = <T,>(data: T[], totalPages = 1, totalRecords = data.length) => ({
  data,
  totalPages,
  totalRecords,
  currentPage: 1,
});

export const mockApiError = (message = 'API Error', status = 500) => ({
  message,
  status,
});

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Mock user interactions
export const mockUserEvent = {
  click: jest.fn(),
  type: jest.fn(),
  selectOptions: jest.fn(),
  clear: jest.fn(),
};
