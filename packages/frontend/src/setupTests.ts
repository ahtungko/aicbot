import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { TextEncoder, TextDecoder } from './polyfills';

// Polyfill for TextEncoder/TextDecoder for MSW
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());