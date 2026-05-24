import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';

const router = Router();

// 🔓 REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'அனைத்து புலங்களும் தேவை!'
      });
    }

    // ⚠️ Production-ல் database save செய்ய வேண்டும்
    // இப்போது demo response மட்டும்

    const token = jwt.sign(
      {
        userId: "65b1d74d-7eef-4d36-b65b-36b0648313eb",
        email,
        role: 'SUPER_ADMIN'
      },
      process.env.JWT_SECRET || 'purely_ceylon_secret',
      {
        expiresIn: '7d'
      }
    );

    return res.status(201).json({
      success: true,
      message: '✅ பதிவு வெற்றி!',
      token,
      user: {
        name,
        email,
        role: 'SUPER_ADMIN'
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '❌ Server Error'
    });
  }
});

// 🔓 LOGIN API
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Demo credentials
  if (
    email === "admin@purelyceylon.com" &&
    password === "PcoEnterprise2026"
  ) {

    const token = jwt.sign(
      {
        userId: "65b1d74d-7eef-4d36-b65b-36b0648313eb",
        email,
        role: 'SUPER_ADMIN'
      },
      process.env.JWT_SECRET || 'purely_ceylon_secret',
      {
        expiresIn: '7d'
      }
    );

    return res.json({
      success: true,
      token,
      role: "SUPER_ADMIN"
    });
  }

  return res.status(401).json({
    success: false,
    message: "தவறான விபரங்கள்!"
  });
});

// 🔒 Protected Admin Route
router.get(
  '/admin-dashboard-data',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {

    res.json({
      success: true,
      message: "🔐 Welcome to PURELY CEYLON Enterprise Control Center!",
      adminDetails: (req as any).user
    });

  }
);

export default router;