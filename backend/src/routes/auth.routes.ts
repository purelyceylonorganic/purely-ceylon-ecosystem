import { Router, Response } from 'express';
import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';
import {
  registerUser,
  login, // <- இங்கிருக்கும் பெயர் கீழே பயன்படுத்தப்பட்டுள்ளது
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

// ✅ REGISTER
router.post('/register', registerUser);

// ✅ LOGIN (TASK 8)
/**
 * @swagger
 * /auth/login:
 * post:
 * summary: User Login
 * tags:
 *   - Authentication
 */
router.post('/login', login); 

// ✅ VERIFY OTP
router.post('/verify-otp', verifyOtp);

// ✅ RESEND OTP
router.post('/resend-otp', resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// 🔒 Protected Admin Route
router.get(
  '/admin-dashboard-data',
  protect,
  restrictTo('ADMIN', 'SUPER_ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: '🔐 Welcome to PURELY CEYLON Enterprise Control Center!',
      adminDetails: req.user,
    });
  }
);

export default router;