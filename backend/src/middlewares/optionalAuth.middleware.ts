import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "./auth.middleware";
import { JWT_SECRET } from "../config/jwt";

// 🔓 Login கட்டாயமில்லாத routes-க்கு:
// valid token இருந்தால் req.user அமைக்கும்; இல்லையென்றால் அமைதியாகத் தொடரும் (customer / விருந்தினர்).
// இதன்மூலம் Admin-க்கு முழு விவரமும், பொதுமக்களுக்குப் பாதுகாப்பான விவரமும் தரலாம்.
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId?: string;
          role?: string;
          email?: string;
        };

        if (decoded.userId && decoded.role) {
          req.user = {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email || "",
          };
        }
      }
    }
  } catch {
    // token செல்லாது — விருந்தினராகவே தொடரும்
  }

  next();
};