import { useContext } from 'react';
import { AuthContext } from '../auth-context';
import type { AuthContextValue } from '../auth-context';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.');
  }

  return context;
}
