import { createContext } from 'react';
import type { AuthCredentials, AuthUser, PasswordChangeData, ProfileUpdateData, RegisterData } from './types';

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (data: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
