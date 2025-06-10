'use client'

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        // Check session on mount
        await authClient.getSession();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
