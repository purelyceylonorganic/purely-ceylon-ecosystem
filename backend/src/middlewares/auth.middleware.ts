import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'purely_ceylon_secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '❌ Token இல்லை!'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

req.user = {
  id: decoded.id,
  role: decoded.role,
  email: decoded.email || ''
};

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '❌ Invalid token!'
    });
  }
};

export const restrictTo = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '❌ Unauthorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '❌ Access denied'
      });
    }

    next();
  };
};