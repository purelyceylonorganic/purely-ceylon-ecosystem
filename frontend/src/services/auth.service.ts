import api from "../api/axios";

export const authService = {

  // ✅ Login - Email OR Phone
  async login(identifier: string, password: string) {
    const response = await api.post("/auth/login", {
      identifier,
      password,
    });

    return response.data;
  },

  // ✅ Register - Email Registration
  async register(
    fullName: string,
    email: string,
    password: string
  ) {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
    });

    return response.data;
  },

  // ✅ Register using Phone
async registerWithPhone(
  fullName: string,
  phone: string,
  password: string
) {
  const response = await api.post(
    "/auth/register-with-phone",
    {
      fullName,
      phone,
      password,
    }
  );

  return response.data;
},


  // ✅ Verify Email OTP
  async verifyOtp(email: string, otp: string) {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    return response.data;
  },

  
  // Phone OTP
  async verifyPhoneOtp(
    phone: string,
    otp: string
  ) {
    const response = await api.post(
      "/auth/verify-phone-otp",
      {
        phone,
        otp,
      }
    );

    return response.data;
  },

  // ✅ Resend Email OTP
  async resendOtp(email: string) {
    const response = await api.post("/auth/resend-otp", {
      email,
    });

    return response.data;
  },

  // Resend Phone OTP
  async resendPhoneOtp(phone: string) {
    const response = await api.post(
      "/auth/resend-phone-otp",
      {
        phone,
      }
    );

    return response.data;
  },

  // =====================================================
// 📱 PHONE PASSWORD RESET
// =====================================================

// Step 1 — Request password reset OTP
async forgotPasswordWithPhone(phone: string) {
  const response = await api.post(
    "/auth/forgot-password-phone",
    {
      phone,
    }
  );

  return response.data;
},

// Step 2 — Verify password reset OTP
async verifyPhonePasswordResetOtp(
  phone: string,
  otp: string
) {
  const response = await api.post(
    "/auth/verify-phone-password-reset-otp",
    {
      phone,
      otp,
    }
  );

  return response.data;
},

// Step 3 — Reset password using one-time reset token
async resetPasswordWithPhone(
  phone: string,
  resetToken: string,
  newPassword: string
) {
  const response = await api.post(
    "/auth/reset-password-phone",
    {
      phone,
      resetToken,
      newPassword,
    }
  );

  return response.data;
},

// =====================================================
// 🔐 VERIFY PROFILE EMAIL OTP
// =====================================================

async verifyProfileEmail(email: string, otp: string) {
  const response = await api.post(
    "/auth/profile/verify-email",
    {
      email,
      otp,
    }
  );

  return response.data;
},
};