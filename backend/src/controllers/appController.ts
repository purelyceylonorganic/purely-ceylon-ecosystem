import { Request, Response } from 'express';

export const getStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Ceylon-Ecosystem API is working perfectly!",
  });
};