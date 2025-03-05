import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { setupServer } from 'msw/node';

// Mocking environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_OPENAI_API_KEY: 'test-api-key',
    VITE_OPENAI_API_URL: 'https://api.test.com',
  },
});

// Setup global mocks
const originalTextDecoder = global.TextDecoder;
global.TextDecoder = class MockTextDecoder {
  decode(value: Uint8Array) {
    return Buffer.from(value).toString();
  }
} as unknown as typeof TextDecoder;

// Mock for fetch
vi.stubGlobal('fetch', vi.fn());

// Mock sessionStorage
vi.stubGlobal('sessionStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
}); 