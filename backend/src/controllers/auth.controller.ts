import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // பயனர் இருக்கிறாரா என சரிபார்த்தல்
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "பயனர் இல்லை!" });

  // கடவுச்சொல்லை ஒப்பிடுதல்
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "தவறான கடவுச்சொல்!" });

  // JWT டோக்கன் உருவாக்குதல்
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  // குக்கீயில் சேமித்தல் (HttpOnly)
  res.cookie('token', token, { httpOnly: true, secure: true });
  res.json({ message: "வெற்றிகரமாக லாகின் செய்யப்பட்டது!", role: user.role });
};