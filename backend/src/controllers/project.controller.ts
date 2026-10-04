import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { projectCreateSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = projectCreateSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        customer_id: data.customer_id,
        service_id: data.service_id || null,
        project_name: data.project_name,
        status: data.status || 'PLANNING',
        start_date: data.start_date ? new Date(data.start_date) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        amount: data.amount ? data.amount : null,
        assigned_to: data.assigned_to || req.user?.id || null,
        notes: data.notes || null,
        is_public: false, // Default newly created projects to private
      },
      include: {
        customer: true,
        service: true,
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project.id,
      metadata: {
        projectName: project.project_name,
        customerId: project.customer_id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as any;
    const where: any = {};
    if (status) where.status = status;

    if (req.user?.role === 'STAFF') {
      where.assigned_to = req.user.id;
    } else if (req.user?.role === 'USER') {
      const customer = await prisma.customer.findFirst({
        where: { email: req.user.email },
      });
      if (!customer) {
        res.status(200).json({ success: true, data: [] });
        return;
      }
      where.customer_id = customer.id;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true, company: true } },
        service: true,
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, project_name, deadline, start_date, amount, notes, assigned_to } = req.body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: status ?? undefined,
        project_name: project_name ?? undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        amount: amount !== undefined ? amount : undefined,
        notes: notes ?? undefined,
        assigned_to: assigned_to !== undefined ? (assigned_to as string | null) : undefined,
      },
      include: { customer: true, service: true, manager: true },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: id,
      metadata: { newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// Admin toggle project public visibility on website
export async function toggleProjectPublicVisibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { is_public, is_featured, display_order, public_description, cover_image } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        is_public: is_public !== undefined ? Boolean(is_public) : !existing.is_public,
        is_featured: is_featured !== undefined ? Boolean(is_featured) : undefined,
        display_order: display_order !== undefined ? parseInt(display_order, 10) : undefined,
        public_description: public_description !== undefined ? public_description : undefined,
        cover_image: cover_image !== undefined ? cover_image : undefined,
      },
      include: {
        service: true,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PROJECT_PUBLIC_VISIBILITY_CHANGED',
      entityType: 'Project',
      entityId: id,
      metadata: {
        projectName: existing.project_name,
        is_public: updated.is_public,
        is_featured: updated.is_featured,
      },
    });

    res.status(200).json({
      success: true,
      message: `Project website visibility updated (${updated.is_public ? 'Public' : 'Private'}).`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
