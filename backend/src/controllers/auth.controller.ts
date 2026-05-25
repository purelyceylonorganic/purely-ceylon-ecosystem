import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';

import { sendVerificationEmail } from '../utils/sendEmail';

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

    const verificationToken =
      crypto.randomBytes(32).toString('hex');

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        verificationToken,
        role: Role.CUSTOMER,
      },
    });

    await sendVerificationEmail(
      email,
      verificationToken
    );

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
      return res.status(401).json({
        success: false,
        message: 'தவறான கடவுச்சொல்!',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
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
        'வெற்றிகரமாக லாகின் செய்யப்பட்டது!',
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
export const verifyEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token as string,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
        verificationToken: null,
      },
    });

    return res.json({
      success: true,
      message:
        '✅ Email verified successfully!',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
};