import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
        _count: {
          select: {
            assigned_customers: true,
            assigned_followups: true,
            assigned_projects: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      res.status(409).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, error: 'Password is required and must be at least 6 characters.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password_hash,
        role: role as Role || 'STAFF',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      metadata: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'Staff user account created successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { role, status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role ?? undefined,
        status: status ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: id,
      metadata: { newRole: role, newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: 'User role/status updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 30));

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
