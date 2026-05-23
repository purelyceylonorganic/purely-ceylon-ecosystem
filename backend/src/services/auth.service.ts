import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-pco-secret-key-2026';
const JWT_EXPIRES_IN = '1d'; // ஒரு செஷன் 24 மணிநேரம் செல்லும்

export class AuthService {
  // 1. பாஸ்வேர்டை ஹேஷ் செய்தல் (Salt rounds: 12 - Enterprise Standard)
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // 2. உள்ளிட்ட பாஸ்வேர்ட் சரியா எனச் சரிபார்த்தல்
  static async comparePassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  // 3. பயனருக்கான பாதுகாப்பான JWT டோக்கன் உருவாக்குதல்
  static generateToken(userId: string, role: string, email: string): string {
    return jwt.sign(
      { userId, role, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // 4. டோக்கனை வெரிஃபை செய்தல்
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}