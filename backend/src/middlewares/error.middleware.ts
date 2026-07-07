import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';
import { logError } from "../utils/errorLogger";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'உள் சர்வர் பிழை (Internal Server Error)';

  // 🚨 நமது லாகர் சர்வீஸ் மூலம் எரரைத் தானாக டேட்டாபேசில் பதிவு செய்கிறோம்
  await LoggerService.logError(
    req.method + ' ' + req.originalUrl,
    message,
    err.stack
  );

  logError(err, "Global Error Handler");
  
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // ப்ரொடக்‌ஷனில் பாதுகாப்பிற்காக ஸ்டேக் டிரேஸை மறைத்து வைப்போம்
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};