import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'super-secure-pco-secret-key-2026';

const JWT_EXPIRES_IN = '1d';

export class AuthService {

  // Hash Password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Compare Password
  static async comparePassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  // Generate JWT
  static generateToken(
    userId: string,
    role: string,
    email: string
  ): string {

    return jwt.sign(
      { userId, role, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}