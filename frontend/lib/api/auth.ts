import client from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User, APIResponse } from '@/types';

export const authAPI = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/register', payload);
    return data.data!;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/login', payload);
    return data.data!;
  },

  googleLogin: async (payload: { credential: string }): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/google', payload);
    return data.data!;
  },


  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data.data!;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await client.get<APIResponse<User>>('/auth/me');
    return data.data!;
  },
};
