import { createContext } from 'react';
import type { AuthCredentials, AuthUser, RegisterData } from './types';

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (data: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
