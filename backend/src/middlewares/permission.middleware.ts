import { Request, Response, NextFunction } from "express";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

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

    const role = req.user.role;

    const rolePermissions =
  ROLE_PERMISSIONS[
    role as keyof typeof ROLE_PERMISSIONS
  ] || [];

    const allowed = permissions.every(permission =>
  (rolePermissions as string[]).includes(permission)
);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    next();
  };