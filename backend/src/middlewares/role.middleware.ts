import { Request, Response, NextFunction } from "express";
import { ROLES } from "../constants/roles"; // 👈 உங்களது சரியான மாட்யூல் பாதையைக் குறிப்பிடவும்

export const authorizeRoles = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // 🚀 பிளேஸ்மென்ட்: roles.includes-க்கு முன்பாக SUPER_ADMIN செக் சேர்க்கப்பட்டுள்ளது
    if (user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    next();
  };
};