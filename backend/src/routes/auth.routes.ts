import { Router, Response } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// 🔓 1. பொதுவான லாகின் ஏபிஐ (எடுத்துக்காட்டு மாதிரி)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // உங்கள் ப்ரொடக்‌ஷன் லாஜிக்கின் படி டேட்டாபேஸ் செக் இங்கே வரும்
  if (email === "admin@purelyceylon.com" && password === "PcoEnterprise2026") {
    const token = " மாதிரி_JWT_டோக்கன்_இங்கே_உருவாகும் "; 
    return res.json({ success: true, token, role: "SUPER_ADMIN" });
  }
  
  return res.status(401).json({ success: false, message: "தவறான விபரங்கள்!" });
});

// 🔒 2. பாதுகாக்கப்பட்ட அட்மின் ஏபிஐ (Super Admin மற்றும் Admin மட்டுமே உள்ளே செல்ல முடியும்)
router.get('/admin-dashboard-data', protect, restrictTo('ADMIN', 'SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: "🔐 Welcome to 2026 PURELY CEYLON ORGANIC Enterprise Control Center!",
    adminDetails: (req as any).user
  });
});

export default router;