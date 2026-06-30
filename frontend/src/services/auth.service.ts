import api from "../api/axios";

export const authService = {
  // ✅ Login
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  // ✅ Register
  async register(fullName: string, email: string, password: string) {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
    });

    return response.data;
  },

  // ✅ Verify OTP
  async verifyOtp(email: string, otp: string) {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    return response.data;
  },

  // ✅ Resend OTP
  async resendOtp(email: string) {
    const response = await api.post("/auth/resend-otp", {
      email,
    });

    return response.data;
  },
};