import { Router, Response } from 'express';
import {
  protect,
  restrictTo,
  AuthenticatedRequest
} from '../middlewares/auth.middleware';
import {
  registerUser,
  login, 
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  registerWithPhone,
  verifyPhoneOtp,
   resendPhoneOtp,
   forgotPasswordWithPhone,
verifyPhonePasswordResetOtp,
resetPasswordWithPhone,
addEmail,
  verifyProfileEmail,
  resendProfileEmailOtp,
  changePassword,
} from '../controllers/auth.controller';

const router = Router();

// ✅ REGISTER
router.post('/register', registerUser);
router.post('/register-with-phone', registerWithPhone);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post("/resend-phone-otp", resendPhoneOtp);
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
// =====================================================
// PHONE PASSWORD RESET
// =====================================================

router.post(
  "/forgot-password-phone",
  forgotPasswordWithPhone
);

router.post(
  "/verify-phone-password-reset-otp",
  verifyPhonePasswordResetOtp
);

router.post(
  "/reset-password-phone",
  resetPasswordWithPhone
);

router.post(
  "/change-password",
  protect,
  changePassword
);
// =====================================================
// 🔐 PROFILE EMAIL VERIFICATION
// =====================================================

router.post(
  "/profile/add-email",
  protect,
  addEmail
);

router.post(
  "/profile/verify-email",
  protect,
  verifyProfileEmail
);

router.post(
  "/profile/resend-email-otp",
  protect,
  resendProfileEmailOtp
);


export default router;