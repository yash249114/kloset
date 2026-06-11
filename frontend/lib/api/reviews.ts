import client from './client';
import type { APIResponse } from '@/types';

export interface CreateReviewPayload {
  booking_id: string;
  rating: number;
  comment?: string;
  photos?: string;
}

export interface ReviewResponse {
  id: string;
  booking_id: string;
  reviewer_id: string;
  outfit_id: string;
  seller_id: string;
  rating: number;
  comment?: string;
  photos?: string;
  created_at: string;
}

export const reviewsAPI = {
  create: async (payload: CreateReviewPayload): Promise<ReviewResponse> => {
    const { data } = await client.post<APIResponse<ReviewResponse>>('/reviews', payload);
    return data.data!;
  },

  listOutfitReviews: async (outfitId: string, page = 1, perPage = 10): Promise<{ reviews: ReviewResponse[]; total: number }> => {
    const { data } = await client.get<APIResponse<ReviewResponse[]>>(`/reviews/outfit/${outfitId}?page=${page}&per_page=${perPage}`);
    return {
      reviews: data.data || [],
      total: data.meta?.total || 0,
    };
  },

  listAll: async (limit = 10): Promise<ReviewResponse[]> => {
    const { data } = await client.get<APIResponse<ReviewResponse[]>>(`/reviews?limit=${limit}`);
    return data.data || [];
  },
};
