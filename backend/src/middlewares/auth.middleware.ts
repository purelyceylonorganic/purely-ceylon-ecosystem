import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// டைப்ஸ்கிரிப்ட் ரிக்வெஸ்ட்டில் பயனர் விபரங்களை இணைக்க
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

// 1. பொதுவான லாகின் பாதுகாப்பு மிடில்வேர் (Protected Route Guard)
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract the token string after 'Bearer'
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: '❌ அணுமதி மறுக்கப்பட்டது! தயவுசெய்து லாகின் செய்யவும்.' });
  }

  const decoded = token ? AuthService.verifyToken(token) : null;
  if (!decoded) {
    return res.status(401).json({ success: false, message: '❌ தவறான அல்லது காலாவதியான டோக்கன்!' });
  }

  req.user = decoded;
  next();
};

// 2. குறிப்பிட்ட அதிகாரப் பிரிவினரை மட்டும் அனுமதிக்கும் மிடில்வேர் (RBAC Guard)
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: '❌ பாதுகாப்பு எச்சரிக்கை: இந்தப் பக்கத்தை அணுக உங்களுக்கு அதிகாரம் இல்லை!' 
      });
    }
    next();
  };
};