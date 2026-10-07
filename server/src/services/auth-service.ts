import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { User, AuthResponse, AuthUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'yatra360_production_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static generateToken(payload: { id: string; email: string; name: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static verifyToken(token: string): { id: string; email: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
      return decoded;
    } catch (_) {
      return null;
    }
  }

  public static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedName || !password) {
      throw new Error('Name, email, and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const existingUser = db.getUserByEmail(trimmedEmail);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const newUser: User = {
      id: `usr_${uuidv4()}`,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);

    const token = this.generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };

    return { user: authUser, token };
  }

  public static async login(email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      throw new Error('Email and password are required');
    }

    const user = db.getUserByEmail(trimmedEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await this.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    return { user: authUser, token };
  }

  public static getUserProfile(userId: string): AuthUser | null {
    const user = db.getUserById(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
  }
}
