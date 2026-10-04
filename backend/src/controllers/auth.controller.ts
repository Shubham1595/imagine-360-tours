import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { signToken } from '../utils/jwt';
import { logAudit } from '../utils/logger';
import { registerSchema, loginSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        password_hash,
        role: data.role || 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await logAudit({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: 'Your account is deactivated. Please contact an administrator.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
