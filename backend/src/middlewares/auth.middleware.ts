import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "purely_ceylon_secret";

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

  console.log("========== REQUEST ==========");
  console.log(req.method, req.originalUrl);

  console.log("Authorization Header:");
  console.log(req.headers.authorization);

  console.log("All Headers:");
  console.log(req.headers);

  console.log("=============================");

  try {

    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ Token இல்லை!"
      });
    }

    console.log("JWT_SECRET:");
    console.log(JWT_SECRET);

    console.log("TOKEN:");
    console.log(token);

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    console.log("DECODED TOKEN:");
    console.log(decoded);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email || ""
    };

    next();

  } catch (error: any) {

    console.log("========== JWT ERROR ==========");
    console.log(error);
    console.log("Message:", error.message);
    console.log("Name:", error.name);
    console.log("===============================");

    return res.status(401).json({
      success: false,
      message: "❌ Invalid token!",
      error: error.message
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
        message: "❌ Unauthorized"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "❌ Access denied"
      });
    }

    next();
  };
};