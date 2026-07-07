import { Request, Response, NextFunction } from "express";
import { ROLES } from "../constants/roles";
import { hasPermission } from "../utils/permission.helper";

export interface AuthRequest extends Request {
  user?: any;
}

export const authorizePermissions =
  (...permissions: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Super Admin Override
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const role = req.user.role;

    const allowed = permissions.every(permission =>
      hasPermission(role, permission)
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    next();
};