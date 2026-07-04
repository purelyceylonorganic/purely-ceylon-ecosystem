import api from "../api/axios";

export const reviewService = {
  async createReview(
    productId: string,
    rating: number,
    comment: string
  ) {
    const response = await api.post(`/reviews/${productId}`, {
      rating,
      comment,
    });

    return response.data;
  },

  async getProductReviews(productId: string) {
    const response = await api.get(`/reviews/${productId}`);

    return response.data;
  },

  async updateReview(
    reviewId: string,
    rating: number,
    comment: string
  ) {
    const response = await api.put(`/reviews/${reviewId}`, {
      rating,
      comment,
    });

    return response.data;
  },

  async deleteReview(reviewId: string) {
    const response = await api.delete(`/reviews/${reviewId}`);

    return response.data;
  },
};