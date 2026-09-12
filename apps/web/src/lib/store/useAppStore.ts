/**
 * Global state management stub
 * TODO: Install zustand for centralized state management
 */

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface TestResult {
  id: string;
  testType: string;
  score: number;
  timestamp: Date;
  details: Record<string, any>;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentTest: string | null;
  testResults: TestResult[];
  testHistory: TestResult[];
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setCurrentTest: (test: string | null) => void;
  addTestResult: (result: TestResult) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Notification) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Stub implementation
export const useAppStore = () => ({
  user: null,
  isAuthenticated: false,
  currentTest: null,
  testResults: [],
  testHistory: [],
  theme: 'system' as const,
  sidebarOpen: false,
  notifications: [],
  loading: false,
  error: null,
  setUser: () => {},
  setAuthenticated: () => {},
  setCurrentTest: () => {},
  addTestResult: () => {},
  setTheme: () => {},
  setSidebarOpen: () => {},
  addNotification: () => {},
  setLoading: () => {},
  setError: () => {},
  clearError: () => {},
});

