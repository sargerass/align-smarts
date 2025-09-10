import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { seedUsers } from '@/data/seedData';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email: string): Promise<boolean> => {
        // Mock authentication - find user by email
        const user = seedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          set({ 
            currentUser: user, 
            isAuthenticated: true 
          });
          return true;
        }
        
        return false;
      },

      logout: () => {
        set({ 
          currentUser: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'acelera-auth',
    }
  )
);