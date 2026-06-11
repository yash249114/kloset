import client from './client';
import type { Address, APIResponse, User } from '@/types';

export interface AddAddressPayload {
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
}

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const { data } = await client.get<APIResponse<User>>('/users/profile');
    return data.data!;
  },

  updateProfile: async (payload: Partial<User>): Promise<void> => {
    await client.put<APIResponse<void>>('/users/profile', payload);
  },

  getAddresses: async (): Promise<Address[]> => {
    const { data } = await client.get<APIResponse<Address[]>>('/users/addresses');
    return data.data || [];
  },

  addAddress: async (payload: AddAddressPayload): Promise<Address> => {
    const { data } = await client.post<APIResponse<Address>>('/users/addresses', payload);
    return data.data!;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await client.delete(`/users/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    await client.put(`/users/addresses/${id}/default`);
  },
};
