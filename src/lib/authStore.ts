import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

// Simple hash for local-only use (not cryptographically secure — fine for offline demo)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
};

const getUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem('habit-users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem('habit-users', JSON.stringify(users));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      signup: (name, email, password) => {
        const users = getUsers();
        if (users.find((u) => u.email === email.toLowerCase())) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: simpleHash(password),
        };
        saveUsers([...users, newUser]);
        const { passwordHash: _, ...safeUser } = newUser;
        set({ user: safeUser, isAuthenticated: true });
        return { success: true };
      },

      login: (email, password) => {
        const users = getUsers();
        const found = users.find((u) => u.email === email.toLowerCase().trim());
        if (!found) {
          return { success: false, error: 'No account found with this email.' };
        }
        if (found.passwordHash !== simpleHash(password)) {
          return { success: false, error: 'Incorrect password.' };
        }
        const { passwordHash: _, ...safeUser } = found;
        set({ user: safeUser, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'habit-auth' }
  )
);
