import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendWelcomeEmail, sendPasswordReset } from '../utils/email';
import { uploadBuffer } from '../utils/cloudinary';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
    return;
  }
  const { email, password, firstName, lastName, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const referralCode = `GBS${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, phone, referralCode },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshTokenCookie(res, refreshToken);

  await sendWelcomeEmail(user.email, user.firstName).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to Glow Beauty Studio 🌸',
    data: { user, accessToken },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshTokenCookie(res, refreshToken);

  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    message: `Welcome back, ${user.firstName}! 🌸`,
    data: { user: safeUser, accessToken },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token not found' });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
    return;
  }

  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, role: true, isActive: true } });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'User not found or inactive' });
    return;
  }

  const newAccessToken = generateAccessToken(user.id, user.role);
  res.json({ success: true, message: 'Token refreshed', data: { accessToken: newAccessToken } });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) {
    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    return;
  }

  const token = crypto.randomUUID();
  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendPasswordReset(user.email, resetLink).catch(() => {});

  res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    res.status(400).json({ success: false, message: 'Valid token and password (min 8 chars) are required' });
    return;
  }

  const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });
  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetRecord.userId }, data: { password: hashedPassword } }),
    prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { used: true } }),
    prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } }),
  ]);

  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true,
      avatar: true, role: true, isVerified: true, referralCode: true, createdAt: true,
      staffProfile: { select: { id: true, bio: true, specializations: true, rating: true, experience: true } },
    },
  });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'Profile fetched', data: user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone } = req.body;
  let avatar: string | undefined;

  if (req.file) {
    avatar = await uploadBuffer(req.file.buffer, 'glow-beauty/avatars');
  }

  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(avatar && { avatar }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, role: true },
  });

  res.json({ success: true, message: 'Profile updated successfully', data: updated });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'Both passwords required, new password min 8 chars' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !user.password) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
};
