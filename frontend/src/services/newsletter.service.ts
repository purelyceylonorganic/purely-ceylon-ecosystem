import api from "../api/axios";

export interface NewsletterResponse {
  success: boolean;
  alreadySubscribed?: boolean;
  message: string;
}

export interface NewsletterSubscribersResponse {
  success: boolean;
  count: number;
  data: Array<{
    id?: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
  }>;
}

export const newsletterService = {

  // ============================
  // 📧 SUBSCRIBE
  // ============================
  async subscribe(
    email: string
  ): Promise<NewsletterResponse> {

    const response =
      await api.post<NewsletterResponse>(
        "/newsletter/subscribe",
        {
          email: email.trim().toLowerCase(),
        }
      );

    return response.data;
  },

  // ============================
  // 📋 GET SUBSCRIBERS
  // ============================
  async getSubscribers(): Promise<NewsletterSubscribersResponse> {

    const response =
      await api.get<NewsletterSubscribersResponse>(
        "/newsletter/subscribers"
      );

    return response.data;
  },
};