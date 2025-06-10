// store/authStore.ts
import { create } from 'zustand'

// Define a simple user type to replace Supabase User
export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Initially true until the first auth check completes
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    // Clear user data from localStorage
    localStorage.removeItem('auth_user');
    set({ user: null });
  },
}))

// Function to initialize auth state, can be called in a root layout or provider
export async function initializeAuthStore() {
  useAuthStore.getState().setLoading(true);
  try {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      useAuthStore.getState().setUser(user);
    } else {
      useAuthStore.getState().setUser(null);
    }
  } catch (error) {
    console.error('Error initializing auth store:', error);
    useAuthStore.getState().setUser(null); // Ensure user is null on error
  } finally {
    useAuthStore.getState().setLoading(false);
  }
}
