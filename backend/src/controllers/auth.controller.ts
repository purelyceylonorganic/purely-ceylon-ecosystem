import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';

import { sendOtpEmail } from '../utils/sendEmail';
const prisma = new PrismaClient();

// ✅ REGISTER USER
export const registerUser = async (
  req: Request,
  res: Response
) => {
  
  try {
    const { fullName, email, password } = req.body;

    const existingUser =
      await prisma.user.findUnique({
        where: { email },
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const verificationToken = crypto
      .randomBytes(32)
      .toString('hex');

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role: Role.CUSTOMER,
        isActive: false,
        verificationToken,
      },
    });

    await sendOtpEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      message:
        'Registration successful. Check your email.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

// ✅ LOGIN
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (
  user?.accountLockedUntil &&
  user.accountLockedUntil > new Date()
) {
  return res.status(429).json({
    success: false,
    message:
      'Account temporarily locked. Try again later.'
  });
}

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'பயனர் இல்லை!',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          'முதலில் உங்கள் மின்னஞ்சலை உறுதிப்படுத்தவும்!',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!isMatch) {

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      failedLoginAttempts: {
        increment: 1
      }
    }
  });
  await prisma.user.update({
  where: {
    id: user.id
  },
  data: {
    failedLoginAttempts: 0,
    accountLockedUntil: null
  }
});

const token = jwt.sign(
  { 
    id: user.id, 
    role: user.role, 
    email: user.email 
  }, // Payload மட்டும் ஆப்ஜெக்ட்டாக அனுப்பவும்
  process.env.JWT_SECRET || 'purely_ceylon_secret',
  { expiresIn: '24h' }
);

  if (
    user.failedLoginAttempts + 1 >= 5
  ) {

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        accountLockedUntil:
          new Date(
            Date.now() +
            15 * 60 * 1000
          )
      }
    });

  }

  return res.status(401).json({
    success: false,
    message:
      'Invalid credentials'
  });
}

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      success: true,
      message:
        'Successfull login!',
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


export const verifyOtp = async (
  req: Request,
  res: Response
) => {
  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // OTP Lock Check
    if (
      user.otpLockedUntil &&
      user.otpLockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message:
          'Too many attempts. Try again later.'
      });
    }

    // OTP Check
    if (user.verificationOtp !== otp) {

  const attempts = user.otpAttempts + 1;

  if (attempts >= 5) {

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        otpAttempts: attempts,
        otpLockedUntil: new Date(
          Date.now() + 15 * 60 * 1000
        )
      }
    });

    return res.status(429).json({
      success: false,
      message:
        'Too many OTP attempts. Account locked for 15 minutes.'
    });
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      otpAttempts: attempts
    }
  });

  return res.status(400).json({
    success: false,
    message: 'Invalid OTP'
  });
}

    // Expiry Check
    if (
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP Expired'
      });
    }

    // Activate Account
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        isActive: true,
        verificationOtp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
        otpLockedUntil: null
      }
    });

    return res.status(200).json({
      success: true,
      message:
        'Account verified successfully'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'OTP Verification Failed'
    });

  }
};

export const resendOtp = async (
  req: Request,
  res: Response
) => {
  try {

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 60 seconds cooldown
    if (
      user.otpLastSentAt &&
      Date.now() -
      user.otpLastSentAt.getTime()
      < 60000
    ) {
      return res.status(429).json({
        success: false,
        message:
          'Please wait 60 seconds before requesting another OTP'
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        verificationOtp: otp,
        otpExpiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
        otpLastSentAt: new Date(),
        otpAttempts: 0
      }
    });

    await sendOtpEmail(
      user.email,
      otp
    );

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });

  }
};