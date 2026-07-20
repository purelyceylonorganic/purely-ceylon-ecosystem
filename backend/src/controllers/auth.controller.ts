import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../constants/roles";
import { sendOtpEmail } from "../utils/sendEmail";
import { logger } from "../config/logger"; // 👈 Winston Logger இம்போர்ட் செய்யப்பட்டது
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/sendEmail";

const prisma = new PrismaClient();

//
// ============================
// ✅ REGISTER USER
// ============================
//
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: ROLES.CUSTOMER, // 👈 Role இம்போர்ட் எரரைத் தவிர்க்க நேரடியாக ஸ்ட்ரிங்காக மாற்றப்பட்டுள்ளது

        verificationOtp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpLastSentAt: new Date(),
      },
    });

    await sendOtpEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Check your email for OTP.",
    });
  } catch (error) {
    logger.error("Registration failed", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

//
// ============================
// ✅ LOGIN USER (WITH LOGGING)
// ============================
//
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ❌ USER NOT FOUND
    if (!user) {
      // ⚠️ Task 8: Login Failed Logger
      logger.warn({
        event: "LOGIN_FAILED",
        email,
      });

      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔒 ACCOUNT LOCK CHECK
    if (
      user.accountLockedUntil &&
      user.accountLockedUntil > new Date()
    ) {
      // ⚠️ Task 8: Login Failed (Locked Account)
      logger.warn({
        event: "LOGIN_FAILED",
        email,
        reason: "Account Locked",
      });

      return res.status(429).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    // 🔓 AUTO UNLOCK
    if (
      user.accountLockedUntil &&
      user.accountLockedUntil <= new Date()
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
    }

    // ❌ EMAIL NOT VERIFIED
    if (!user.isActive) {
      // ⚠️ Task 8: Login Failed (Unverified)
      logger.warn({
        event: "LOGIN_FAILED",
        email,
        reason: "Email unverified",
      });

      return res.status(403).json({
        success: false,
        message: "Please verify your email first!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    // ❌ WRONG PASSWORD
    if (!isMatch) {
      const attempts = user.failedLoginAttempts + 1;
      const updateData: any = {
        failedLoginAttempts: attempts,
      };

      if (attempts >= 5) {
        updateData.accountLockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // ⚠️ Task 8: Login Failed Logger
      logger.warn({
        event: "LOGIN_FAILED",
        email,
      });

      return res.status(401).json({
        success: false,
        message:
          attempts >= 5
            ? "Account temporarily locked. Try again later."
            : "Invalid credentials",
      });
    }

    // ✅ SUCCESS LOGIN → RESET ATTEMPTS
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // 💡 Task 8: Login Success Logger
    logger.info({
      event: "LOGIN_SUCCESS",
      email: user.email,
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Login Server Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//
// ============================
// ✅ VERIFY OTP
// ============================
//
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 OTP LOCK CHECK
    if (
      user.otpLockedUntil &&
      user.otpLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Try again later.",
      });
    }

    // ❌ WRONG OTP
    if (user.verificationOtp !== otp) {
      const attempts = user.otpAttempts + 1;
      const updateData: any = {
        otpAttempts: attempts,
      };

      if (attempts >= 5) {
        updateData.otpLockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return res.status(400).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many OTP attempts. Account locked for 15 minutes."
            : "Invalid OTP",
      });
    }

    // ⏳ EXPIRY CHECK
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // ✅ ACTIVATE ACCOUNT
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        verificationOtp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    logger.error("OTP Verification Error", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

//
// ============================
// ✅ RESEND OTP
// ============================
//
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ⏳ 60 sec cooldown
    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < 60000
    ) {
      return res.status(429).json({
        success: false,
        message: "Wait 60 seconds before requesting OTP again",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationOtp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpLastSentAt: new Date(),
        otpAttempts: 0,
      },
    });

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    logger.error("Resend OTP Error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists, a password reset email has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expire = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: token,
        passwordResetExpire: expire,
      },
    });

    await sendResetPasswordEmail(
      user.email,
      user.fullName,
      token
    );

    return res.json({
      success: true,
      message:
        "Password reset link has been sent to your email.",
    });

  } catch (error) {

    logger.error("Forgot Password Error", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpire: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
  where: {
    id: user.id,
  },
  data: {
    passwordHash: hashedPassword,
    passwordResetToken: null,
    passwordResetExpire: null,
    isVerified: true, // இதைச் சேர்ப்பது கட்டாயம்!
  },
});

    logger.info({
      event: "PASSWORD_RESET_SUCCESS",
      email: user.email,
    });

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });

  } catch (error) {

    logger.error("Reset Password Error", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};