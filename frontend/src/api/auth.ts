import { api } from './client';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api
      .post<{ data: AuthResponse }>('/api/auth/register', { name, email, password })
      .then((r) => r.data.data),

  login: (email: string, password: string) =>
    api
      .post<{ data: AuthResponse }>('/api/auth/login', { email, password })
      .then((r) => r.data.data),

  me: () => api.get<{ data: User }>('/api/auth/me').then((r) => r.data.data),

  // Returns reset_token only in development mode (no SMTP configured).
  forgotPassword: (email: string) =>
    api
      .post<{ data: { sent: boolean; reset_token?: string } }>('/api/auth/forgot-password', { email })
      .then((r) => r.data.data),

  resetPassword: (token: string, password: string) =>
    api
      .post<{ data: { reset: boolean } }>('/api/auth/reset-password', { token, password })
      .then((r) => r.data.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api
      .post<{ data: { changed: boolean } }>('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then((r) => r.data.data),
};
