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
};
