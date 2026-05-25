import { Router, Response } from 'express';

import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';

import {
  registerUser,
  login,
  verifyEmail
} from '../controllers/auth.controller';

const router = Router();

// ✅ REGISTER
router.post('/register', registerUser);


// ✅ LOGIN
router.post('/login', login);

// ✅ VERIFY EMAIL
router.get('/verify-email', verifyEmail);


// 🔒 Protected Admin Route
router.get(
  '/admin-dashboard-data',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    res.json({
      success: true,
      message:
        '🔐 Welcome to PURELY CEYLON Enterprise Control Center!',
      adminDetails: req.user,
    });
  }
);

export default router;