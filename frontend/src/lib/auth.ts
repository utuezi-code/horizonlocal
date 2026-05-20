import api from './api';
import { User } from '@/types';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string) {
  const response = await api.post<{ user: User; token: string }>('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_vendor?: boolean;
  store_name?: string;
}) {
  const response = await api.post<{ user: User; token: string }>('/auth/register', data);
  return response.data;
}

export async function logoutUser() {
  await api.post('/auth/logout');
}
