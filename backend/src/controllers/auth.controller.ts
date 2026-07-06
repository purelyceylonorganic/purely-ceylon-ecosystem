import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import { sendOtpEmail } from "../utils/sendEmail";

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
        role: Role.CUSTOMER,

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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

//
// ============================
// ✅ LOGIN USER (FIXED FINAL)
// ============================
//
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
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

      return res.status(401).json({
        success: false,
        message:
          attempts >= 5
            ? "Account temporarily locked. Try again later."
            : "Invalid credentials",
      });
    }

    // ✅ SUCCESS LOGIN → RESET
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    const token = jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role
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
    role: user.role // 👈 இது இருக்கிறதா என்று உறுதி செய்யவும்!
  }
});
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};