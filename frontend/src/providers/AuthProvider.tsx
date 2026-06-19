import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import { AuthContext } from '../auth-context';
import type { AuthContextValue } from '../auth-context';
import type { AuthUser } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        setUser(await api.getCurrentUser());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(data) {
      setUser(await api.login(data));
    },
    async register(data) {
      setUser(await api.register(data));
    },
    async logout() {
      await api.logout();
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
