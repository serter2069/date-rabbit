import '@testing-library/jest-native/extend-expect';

// Mock expo winter runtime
jest.mock('expo/src/winter/runtime.native.ts', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal.ts', () => ({}), { virtual: true });

// Mock expo-router - exported for use in tests
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);

// Store for useLocalSearchParams mock value - use global to avoid closure issues
global.__mockSearchParams = {};

jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: mockCanGoBack,
  },
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useLocalSearchParams: () => global.__mockSearchParams,
  useSegments: () => [],
  Link: 'Link',
}));

// Export mocks for test files
global.mockRouterPush = mockPush;
global.mockRouterReplace = mockReplace;
global.mockRouterBack = mockBack;
global.setMockSearchParams = (params) => { global.__mockSearchParams = params; };

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('ReactDOM.render')) return;
  if (args[0]?.includes?.('act(...)')) return;
  originalWarn.apply(console, args);
};

// Global test timeout
jest.setTimeout(10000);
