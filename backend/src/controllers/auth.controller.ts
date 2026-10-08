import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../constants/roles";
import { sendOtpEmail } from "../utils/sendEmail";
import { logger } from "../config/logger"; // 👈 Winston Logger இம்போர்ட் செய்யப்பட்டது
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/sendEmail";
import { sendSms } from "../utils/sendSms";
import { normalizePhoneNumber } from "../utils/phoneNormalizer";
import {
  AuthenticatedRequest,
} from "../middlewares/auth.middleware";
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
    const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};
    const otpHash = await bcrypt.hash(otp, 10);
    
    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: ROLES.CUSTOMER, // 👈 Role இம்போர்ட் எரரைத் தவிர்க்க நேரடியாக ஸ்ட்ரிங்காக மாற்றப்பட்டுள்ளது

        verificationOtp: otpHash,
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


// =====================================================
// ✅ REGISTER USER WITH PHONE
// =====================================================

export const registerWithPhone = async (
  req: Request,
  res: Response
) => {
  try {
    const { fullName, phone, password } = req.body;

    // =========================
    // Validate input
    // =========================

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Phone and Password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone = normalizePhoneNumber(phone);

    // =========================
    // Basic Sri Lanka validation
    // =========================

    if (!/^94\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Sri Lankan phone number",
      });
    }

    // =========================
    // Check duplicate phone
    // =========================

    const existingUser = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // =========================
    // Generate secure OTP
    // =========================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // =========================
    // Hash OTP
    // =========================

    const otpHash = await bcrypt.hash(otp, 10);

    // =========================
    // OTP expiry - 10 minutes
    // =========================

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =========================
    // Hash password
    // =========================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =========================
    // Create user
    // =========================

    const user = await prisma.user.create({
      data: {
        fullName,
        phone: normalizedPhone,
        email: null,

        passwordHash: hashedPassword,

        role: ROLES.CUSTOMER,

        isActive: false,
        isVerified: false,

        // 🔐 HASHED OTP
        phoneVerificationOtp: otpHash,

        phoneOtpExpiresAt: otpExpiresAt,

        phoneOtpLastSentAt: new Date(),

        phoneOtpAttempts: 0,

        phoneOtpLockedUntil: null,
      },

      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // =========================
    // Send SMS
    // =========================

    await sendSms(
      normalizedPhone,
      `Your PURELY CEYLON verification OTP is ${otp}. It is valid for 10 minutes.`
    );

    // =========================
    // Response
    // =========================

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. OTP sent to your phone.",
      data: {
        userId: user.id,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    logger.error(
      "Phone Registration Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Phone registration failed",
    });
  }
};



// =====================================================
// ✅ VERIFY PHONE OTP
// =====================================================

export const verifyPhoneOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, otp } = req.body;

    // =========================
    // Validate input
    // =========================

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // =========================
    // Validate OTP format
    // =========================

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // =========================
    // Find user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =========================
    // Already verified
    // =========================

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is already verified",
      });
    }

    // =========================
    // OTP lock check
    // =========================

    if (
      user.phoneOtpLockedUntil &&
      user.phoneOtpLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please try again later.",
      });
    }

    // =========================
    // OTP exists?
    // =========================

    if (!user.phoneVerificationOtp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    // =========================
    // OTP expiry
    // =========================

    if (
      !user.phoneOtpExpiresAt ||
      user.phoneOtpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // =========================
    // Compare hashed OTP
    // =========================

    const isOtpValid = await bcrypt.compare(
      String(otp),
      user.phoneVerificationOtp
    );

    // =========================
    // INVALID OTP
    // =========================

    if (!isOtpValid) {
      const attempts =
        user.phoneOtpAttempts + 1;

      const updateData: any = {
        phoneOtpAttempts: attempts,
      };

      // 🔒 Lock after 5 failed attempts
      if (attempts >= 5) {
        updateData.phoneOtpLockedUntil =
          new Date(
            Date.now() + 15 * 60 * 1000
          );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      logger.warn({
        event: "PHONE_OTP_FAILED",
        phone: normalizedPhone,
        userId: user.id,
        attempts,
      });

      return res.status(400).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many incorrect OTP attempts. Account locked for 15 minutes."
            : `Invalid OTP. ${5 - attempts} attempt(s) remaining.`,
      });
    }

    // =========================
    // OTP SUCCESS
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        isVerified: true,
        isActive: true,

        // 🔥 Clear OTP completely
        phoneVerificationOtp: null,
        phoneOtpExpiresAt: null,
        phoneOtpLastSentAt: null,

        phoneOtpAttempts: 0,
        phoneOtpLockedUntil: null,
      },
    });

    logger.info({
      event: "PHONE_VERIFICATION_SUCCESS",
      phone: normalizedPhone,
      userId: user.id,
    });

    return res.json({
      success: true,
      message:
        "Phone number verified successfully",
    });
  } catch (error: any) {
    logger.error(
      "Phone OTP Verification Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Phone OTP verification failed",
    });
  }
};


// =====================================================
// ✅ ADD EMAIL TO EXISTING CUSTOMER PROFILE
// =====================================================

export const addEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { email } = req.body;

    // =========================
    // Validate authentication
    // =========================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =========================
    // Validate email
    // =========================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // =========================
    // Get current user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =========================
    // Check whether email belongs
    // to another account
    // =========================

    const existingEmailUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (
      existingEmailUser &&
      existingEmailUser.id !== user.id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already registered",
      });
    }

    // =========================
    // If same verified email
    // =========================

    if (
      user.email === normalizedEmail &&
      user.isVerified
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already verified",
      });
    }

    // =========================
    // 60 SECOND COOLDOWN
    // =========================

    if (
      user.otpLastSentAt &&
      Date.now() -
        user.otpLastSentAt.getTime() <
        60 * 1000
    ) {
      const remainingSeconds = Math.ceil(
        (
          60 * 1000 -
          (Date.now() -
            user.otpLastSentAt.getTime())
        ) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    // =========================
    // Generate secure OTP
    // =========================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // =========================
    // Hash OTP
    // =========================

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    // =========================
    // OTP expiry
    // 10 minutes
    // =========================

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =========================
    // Save pending email + OTP
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        pendingEmail: normalizedEmail,

        verificationOtp: otpHash,

        otpExpiresAt,

        otpLastSentAt: new Date(),

        otpAttempts: 0,

        otpLockedUntil: null,
      },
    });

    // =========================
    // Send OTP Email
    // =========================

    await sendOtpEmail(
      normalizedEmail,
      otp
    );

    logger.info({
      event: "PROFILE_EMAIL_OTP_SENT",
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email verification OTP has been sent.",
    });
  } catch (error) {
    logger.error(
      "Add Email Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send email verification OTP",
    });
  }
};


// =====================================================
// ✅ VERIFY PROFILE EMAIL OTP
// =====================================================

export const verifyProfileEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { otp } = req.body;

    // =========================
    // Authentication
    // =========================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =========================
    // Validate OTP
    // =========================

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const enteredOtp = String(otp).trim();

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number",
      });
    }

    // =========================
    // Get user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =========================
    // Pending email check
    // =========================

    if (!user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "No pending email verification found",
      });
    }

    // =========================
    // OTP lock check
    // =========================

    if (
      user.otpLockedUntil &&
      user.otpLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please try again later.",
      });
    }

    // =========================
    // OTP exists?
    // =========================

    if (!user.verificationOtp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    // =========================
    // OTP expiry
    // =========================

    if (
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // =========================
    // Compare hashed OTP
    // =========================

    const isOtpValid =
      await bcrypt.compare(
        enteredOtp,
        user.verificationOtp
      );

    // =========================
    // Invalid OTP
    // =========================

    if (!isOtpValid) {
      const attempts =
        user.otpAttempts + 1;

      const updateData: any = {
        otpAttempts: attempts,
      };

      // 5 failed attempts
      if (attempts >= 5) {
        updateData.otpLockedUntil =
          new Date(
            Date.now() +
              15 * 60 * 1000
          );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      return res.status(400).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many incorrect OTP attempts. Locked for 15 minutes."
            : `Invalid OTP. ${5 - attempts} attempts remaining.`,
      });
    }

    // =========================
    // Final duplicate check
    // =========================

    const emailOwner =
      await prisma.user.findUnique({
        where: {
          email: user.pendingEmail,
        },
      });

    if (
      emailOwner &&
      emailOwner.id !== user.id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already registered",
      });
    }

    // =========================
    // OTP SUCCESS
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.pendingEmail,

        pendingEmail: null,

        verificationOtp: null,

        otpExpiresAt: null,

        otpLastSentAt: null,

        otpAttempts: 0,

        otpLockedUntil: null,
      },
    });

    logger.info({
      event:
        "PROFILE_EMAIL_VERIFICATION_SUCCESS",
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email address verified successfully",
      data: {
        email: user.pendingEmail,
      },
    });
  } catch (error) {
    logger.error(
      "Verify Profile Email Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Email verification failed",
    });
  }
};


// =====================================================
// ✅ RESEND PROFILE EMAIL OTP
// =====================================================

export const resendProfileEmailOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    // =========================
    // Authentication
    // =========================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =========================
    // Get user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =========================
    // Pending email check
    // =========================

    if (!user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "No pending email verification found",
      });
    }

    // =========================
    // Already verified
    // =========================

    if (
      user.email === user.pendingEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already verified",
      });
    }

    // =========================
    // 60 SECOND COOLDOWN
    // =========================

    if (
      user.otpLastSentAt &&
      Date.now() -
        user.otpLastSentAt.getTime() <
        60 * 1000
    ) {
      const remainingSeconds = Math.ceil(
        (
          60 * 1000 -
          (Date.now() -
            user.otpLastSentAt.getTime())
        ) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      });
    }

    // =========================
    // Generate NEW OTP
    // =========================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // =========================
    // Hash NEW OTP
    // =========================

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );

    // =========================
    // New expiry
    // =========================

    const expiresAt =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    // =========================
    // Save NEW OTP
    // Old OTP becomes invalid
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationOtp: otpHash,

        otpExpiresAt: expiresAt,

        otpLastSentAt: new Date(),

        otpAttempts: 0,

        otpLockedUntil: null,
      },
    });

    // =========================
    // Send email
    // =========================

    await sendOtpEmail(
      user.pendingEmail,
      otp
    );

    logger.info({
      event:
        "PROFILE_EMAIL_OTP_RESENT",
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "A new email verification OTP has been sent.",
    });
  } catch (error) {
    logger.error(
      "Resend Profile Email OTP Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resend email verification OTP",
    });
  }
};
//
// ============================
// ✅ LOGIN USER
// ✅ EMAIL OR PHONE LOGIN
// ============================
//

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // ============================
    // VALIDATION
    // ============================

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password are required",
      });
    }

    const input = String(identifier).trim();

    // ============================
    // FIND USER
    // ============================

    let user;

    // Email login
    if (input.includes("@")) {
      user = await prisma.user.findUnique({
        where: {
          email: input,
        },
      });
    } else {
      // Phone login
      const normalizedPhone = input
        .replace(/\s+/g, "")
        .replace(/^0/, "94");

      user = await prisma.user.findUnique({
        where: {
          phone: normalizedPhone,
        },
      });
    }

    // ============================
    // ❌ USER NOT FOUND
    // ============================

    if (!user) {
      logger.warn({
        event: "LOGIN_FAILED",
        identifier: input,
        reason: "User not found",
      });

      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ============================
    // 🔒 ACCOUNT LOCK CHECK
    // ============================

    if (
      user.accountLockedUntil &&
      user.accountLockedUntil > new Date()
    ) {
      logger.warn({
        event: "LOGIN_FAILED",
        identifier: input,
        reason: "Account Locked",
      });

      return res.status(429).json({
        success: false,
        message:
          "Account temporarily locked. Try again later.",
      });
    }

    // ============================
    // 🔓 AUTO UNLOCK
    // ============================

    if (
      user.accountLockedUntil &&
      user.accountLockedUntil <= new Date()
    ) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          failedLoginAttempts: 0,
          accountLockedUntil: null,
        },
      });
    }

    // ============================
    // ❌ ACCOUNT NOT VERIFIED
    // ============================

    if (!user.isActive || !user.isVerified) {
      logger.warn({
        event: "LOGIN_FAILED",
        identifier: input,
        reason: "Account not verified",
      });

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email or phone number first!",
      });
    }

    // ============================
    // 🔐 PASSWORD CHECK
    // ============================

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    // ============================
    // ❌ WRONG PASSWORD
    // ============================

    if (!isMatch) {
      const attempts =
        user.failedLoginAttempts + 1;

      const updateData: any = {
        failedLoginAttempts: attempts,
      };

      // Lock after 5 failed attempts
      if (attempts >= 5) {
        updateData.accountLockedUntil =
          new Date(
            Date.now() + 15 * 60 * 1000
          );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      logger.warn({
        event: "LOGIN_FAILED",
        identifier: input,
        reason: "Wrong password",
      });

      return res.status(401).json({
        success: false,
        message:
          attempts >= 5
            ? "Account temporarily locked. Try again later."
            : "Invalid credentials",
      });
    }

    // ============================
    // ✅ SUCCESS LOGIN
    // RESET LOGIN ATTEMPTS
    // ============================

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // ============================
    // 📝 LOGIN SUCCESS LOG
    // ============================

    logger.info({
      event: "LOGIN_SUCCESS",
      identifier: input,
      userId: user.id,
    });

    // ============================
    // 🎫 GENERATE JWT
    // ============================

    const token = jwt.sign(
  {
    userId: user.id,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    role: user.role,
  },
  process.env.JWT_SECRET as string,
  {
    expiresIn: "1d",
  }
);

    // ============================
    // 🍪 SET COOKIE
    // ============================

    res.cookie("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // ============================
    // ✅ RESPONSE
    // ============================

    return res.json({
  success: true,
  message: "Login successful",

  token,

  user: {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    fullName: user.fullName,

    // 🔐 Quick Create customer security
    mustChangePassword: user.mustChangePassword,
  },
});
  } catch (error) {
    logger.error(
      "Login Server Error",
      error
    );

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

    if (!user?.email) {
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

// =====================================================
// ✅ RESEND PHONE OTP
// =====================================================

export const resendPhoneOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    // =========================
    // Validate
    // =========================

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // =========================
    // Find user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // Already verified
    // =========================

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is already verified.",
      });
    }

    // =========================
    // Lock check
    // =========================

    if (
      user.phoneOtpLockedUntil &&
      user.phoneOtpLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many failed attempts. Please try again later.",
      });
    }

    // =========================
    // 60 second cooldown
    // =========================

    if (user.phoneOtpLastSentAt) {
      const elapsed =
        Date.now() -
        user.phoneOtpLastSentAt.getTime();

      if (elapsed < 60 * 1000) {
        const remaining = Math.ceil(
          (60 * 1000 - elapsed) / 1000
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another OTP.`,
          retryAfterSeconds: remaining,
        });
      }
    }

    // =========================
    // Generate new OTP
    // =========================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // =========================
    // Hash OTP
    // =========================

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    // =========================
    // New expiry
    // =========================

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =========================
    // Save new OTP
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        // 🔐 New hashed OTP
        phoneVerificationOtp: otpHash,

        // ⏳ Reset expiry
        phoneOtpExpiresAt: expiresAt,

        // ⏱️ Reset cooldown
        phoneOtpLastSentAt: new Date(),

        // 🔄 Reset failed attempts
        phoneOtpAttempts: 0,

        // 🔓 Clear previous lock
        phoneOtpLockedUntil: null,
      },
    });

    // =========================
    // Send SMS
    // =========================

    await sendSms(
      normalizedPhone,
      `Your PURELY CEYLON verification OTP is ${otp}. It expires in 10 minutes.`
    );

    // =========================
    // Logger
    // =========================

    logger.info({
      event: "PHONE_OTP_RESENT",
      phone: normalizedPhone,
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error: any) {
    logger.error(
      "Resend Phone OTP Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resend phone OTP.",
    });
  }
};


// =====================================================
// ✅ FORGOT PASSWORD WITH PHONE
// =====================================================

export const forgotPasswordWithPhone = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // =========================
    // Find user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    // Security:
    // Don't reveal whether phone exists
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists, a password reset OTP has been sent.",
      });
    }

    // =========================
    // Account must be verified
    // =========================

    if (!user.isVerified || !user.isActive) {
      return res.json({
        success: true,
        message:
          "If an account exists, a password reset OTP has been sent.",
      });
    }

    // =========================
    // Lock check
    // =========================

    if (
      user.phonePasswordResetLockedUntil &&
      user.phonePasswordResetLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please try again later.",
      });
    }

    // =========================
    // 60-second cooldown
    // =========================

    if (user.phonePasswordResetLastSentAt) {
      const elapsed =
        Date.now() -
        user.phonePasswordResetLastSentAt.getTime();

      if (elapsed < 60 * 1000) {
        const remaining = Math.ceil(
          (60 * 1000 - elapsed) / 1000
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another OTP.`,
          retryAfterSeconds: remaining,
        });
      }
    }

    // =========================
    // Generate secure OTP
    // =========================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // =========================
    // Hash OTP
    // =========================

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    // =========================
    // Expire in 10 minutes
    // =========================

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // =========================
    // Save reset OTP
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        phonePasswordResetOtp: otpHash,

        phonePasswordResetExpiresAt:
          expiresAt,

        phonePasswordResetLastSentAt:
          new Date(),

        phonePasswordResetAttempts: 0,

        phonePasswordResetLockedUntil:
          null,
      },
    });

    // =========================
    // Send SMS
    // =========================

    await sendSms(
      normalizedPhone,
      `Your PURELY CEYLON password reset OTP is ${otp}. It is valid for 10 minutes.`
    );

    logger.info({
      event: "PHONE_PASSWORD_RESET_OTP_SENT",
      phone: normalizedPhone,
      userId: user.id,
    });

    return res.json({
      success: true,
      message:
        "If an account exists, a password reset OTP has been sent.",
    });
  } catch (error: any) {
    logger.error(
      "Phone Password Reset OTP Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request.",
    });
  }
};

// =====================================================
// ✅ VERIFY PHONE PASSWORD RESET OTP
// =====================================================

export const verifyPhonePasswordResetOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number and OTP are required",
      });
    }

    // =========================
    // OTP format
    // =========================

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number",
      });
    }

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // =========================
    // Find user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =========================
    // Lock check
    // =========================

    if (
      user.phonePasswordResetLockedUntil &&
      user.phonePasswordResetLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please try again later.",
      });
    }

    // =========================
    // OTP exists?
    // =========================

    if (!user.phonePasswordResetOtp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    // =========================
    // Expiry
    // =========================

    if (
      !user.phonePasswordResetExpiresAt ||
      user.phonePasswordResetExpiresAt <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // =========================
    // Compare hashed OTP
    // =========================

    const isValid = await bcrypt.compare(
      String(otp),
      user.phonePasswordResetOtp
    );

    // =========================
    // Wrong OTP
    // =========================

    if (!isValid) {
      const attempts =
        user.phonePasswordResetAttempts + 1;

      const updateData: any = {
        phonePasswordResetAttempts:
          attempts,
      };

      if (attempts >= 5) {
        updateData.phonePasswordResetLockedUntil =
          new Date(
            Date.now() + 15 * 60 * 1000
          );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      logger.warn({
        event:
          "PHONE_PASSWORD_RESET_OTP_FAILED",
        phone: normalizedPhone,
        userId: user.id,
        attempts,
      });

      return res.status(400).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many incorrect OTP attempts. Password reset locked for 15 minutes."
            : `Invalid OTP. ${
                5 - attempts
              } attempt(s) remaining.`,
      });
    }

    // =========================
    // OTP correct
    // =========================

    /*
     * Important:
     * Don't change password here.
     *
     * Return a short-lived reset token.
     */

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetTokenHash =
      await bcrypt.hash(resetToken, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        // OTP is now consumed
        phonePasswordResetOtp: null,

        phonePasswordResetExpiresAt:
          null,

        phonePasswordResetAttempts: 0,

        phonePasswordResetLockedUntil:
          null,

        // Temporarily store reset token
        passwordResetToken:
          resetTokenHash,

        passwordResetExpire:
          new Date(
            Date.now() + 10 * 60 * 1000
          ),
      },
    });

    logger.info({
      event:
        "PHONE_PASSWORD_RESET_OTP_VERIFIED",
      phone: normalizedPhone,
      userId: user.id,
    });

    return res.json({
      success: true,
      message:
        "OTP verified successfully.",
      resetToken,
    });
  } catch (error: any) {
    logger.error(
      "Phone Password Reset Verification Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Phone OTP verification failed.",
    });
  }
};
// =====================================================
// ✅ RESET PASSWORD WITH PHONE + ONE-TIME RESET TOKEN
// =====================================================

export const resetPasswordWithPhone = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      phone,
      resetToken,
      newPassword,
    } = req.body;

    // =========================
    // Validate input
    // =========================

    if (!phone || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number, reset token and new password are required",
      });
    }

    // =========================
    // Validate password
    // =========================

   if (
  typeof newPassword !== "string" ||
  newPassword.length < 8
) {
  return res.status(400).json({
    success: false,
    message:
      "New password must be at least 8 characters",
  });
}

    // =========================
    // Normalize phone
    // =========================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // =========================
    // Find user
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    // =========================
    // Phone must be verified
    // =========================

    if (!user.isVerified || !user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Phone number is not verified",
      });
    }

    // =========================
    // Reset token exists?
    // =========================

    if (!user.passwordResetToken) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or already used reset token",
      });
    }

    // =========================
    // Reset token expiry
    // =========================

    if (
      !user.passwordResetExpire ||
      user.passwordResetExpire < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token has expired. Please request a new OTP.",
      });
    }

    // =========================
    // Compare reset token
    // =========================

    const isValidResetToken =
      await bcrypt.compare(
        String(resetToken),
        user.passwordResetToken
      );

    if (!isValidResetToken) {
      logger.warn({
        event:
          "PHONE_PASSWORD_RESET_TOKEN_FAILED",
        phone: normalizedPhone,
        userId: user.id,
      });

      return res.status(400).json({
        success: false,
        message:
          "Invalid reset token",
      });
    }

    // =========================
    // Hash new password
    // =========================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // =========================
    // Update password
    // =========================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash: hashedPassword,

        // 🔐 ONE-TIME TOKEN CONSUMED
        passwordResetToken: null,
        passwordResetExpire: null,
      },
    });

    // =========================
    // Log success
    // =========================

    logger.info({
      event:
        "PHONE_PASSWORD_RESET_SUCCESS",
      phone: normalizedPhone,
      userId: user.id,
    });

    // =========================
    // Response
    // =========================

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {
    logger.error(
      "Phone Password Reset Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reset password",
    });
  }
};

// =====================================================
// 🔐 CHANGE PASSWORD
// =====================================================

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // ==========================================
    // Authentication
    // ==========================================

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ==========================================
    // Input
    // ==========================================

    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (
      !currentPassword.trim() ||
      !newPassword.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters",
      });
    }

    // ==========================================
    // Find User
    // ==========================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // Account Status
    // ==========================================

    if (!user.isActive || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active or verified",
      });
    }

    // ==========================================
    // Verify Current Password
    // ==========================================

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!isCurrentPasswordValid) {
      logger.warn({
        event: "CHANGE_PASSWORD_FAILED",
        userId: user.id,
        reason: "Invalid current password",
      });

      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ==========================================
    // Prevent Same Password
    // ==========================================

    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.passwordHash
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ==========================================
    // Hash New Password
    // ==========================================

    const newPasswordHash =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ==========================================
    // Update Password
    // ==========================================

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash: newPasswordHash,

        // Temporary password requirement completed
        mustChangePassword: false,

        // Reset login security counters
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // ==========================================
    // Log
    // ==========================================

    logger.info({
      event: "PASSWORD_CHANGED",
      userId: user.id,
    });

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {
    logger.error(
      "Change Password Error",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change password",
    });
  }
};