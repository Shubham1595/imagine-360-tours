import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/logger';

// Public services catalog: returns only is_visible = true
export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: {
        is_visible: true,
        status: { not: 'ARCHIVED' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        short_description: true,
        description: true,
        price: true,
        duration: true,
        image: true,
        is_active: true,
        is_featured: true,
        display_order: true,
      },
      orderBy: [
        { display_order: 'asc' },
        { created_at: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
}

// Admin services management: returns all services including hidden & inactive
export async function getAllServicesAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { display_order: 'asc' },
        { created_at: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
}

export async function createService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      slug,
      category,
      short_description,
      description,
      price,
      duration,
      image,
      is_active,
      is_visible,
      is_featured,
      display_order,
      status,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Service name is required.',
      });
      return;
    }

    const generatedSlug = slug?.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Determine max display order if not provided
    let finalOrder = display_order !== undefined ? parseInt(display_order, 10) : 0;
    if (isNaN(finalOrder) || finalOrder === 0) {
      const maxOrderSvc = await prisma.service.findFirst({
        orderBy: { display_order: 'desc' },
        select: { display_order: true },
      });
      finalOrder = (maxOrderSvc?.display_order || 0) + 1;
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        category: category || 'Spatial Technology',
        short_description: short_description || null,
        description: description || null,
        price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : null,
        duration: duration || null,
        image: image || null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        is_visible: is_visible !== undefined ? Boolean(is_visible) : true,
        is_featured: is_featured !== undefined ? Boolean(is_featured) : false,
        display_order: finalOrder,
        status: status || 'ACTIVE',
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_CREATED',
      entityType: 'Service',
      entityId: service.id,
      metadata: { name: service.name, category: service.category },
    });

    res.status(201).json({
      success: true,
      message: 'Service catalog item created successfully.',
      data: service,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const {
      name,
      slug,
      category,
      short_description,
      description,
      price,
      duration,
      image,
      is_active,
      is_visible,
      is_featured,
      display_order,
      status,
    } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        slug: slug !== undefined ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        category: category !== undefined ? category : undefined,
        short_description: short_description !== undefined ? short_description : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? (price === null || price === '' ? null : parseFloat(price)) : undefined,
        duration: duration !== undefined ? duration : undefined,
        image: image !== undefined ? image : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined,
        is_visible: is_visible !== undefined ? Boolean(is_visible) : undefined,
        is_featured: is_featured !== undefined ? Boolean(is_featured) : undefined,
        display_order: display_order !== undefined ? parseInt(display_order, 10) : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_UPDATED',
      entityType: 'Service',
      entityId: id,
      metadata: {
        oldName: existing.name,
        newName: updated.name,
        is_active: updated.is_active,
        is_visible: updated.is_visible,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.service.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    const newIsActive = req.body.is_active !== undefined
      ? Boolean(req.body.is_active)
      : !existing.is_active;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        is_active: newIsActive,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: newIsActive ? 'SERVICE_ACTIVATED' : 'SERVICE_DEACTIVATED',
      entityType: 'Service',
      entityId: id,
      metadata: {
        serviceName: existing.name,
        oldAvailability: existing.is_active,
        newAvailability: newIsActive,
      },
    });

    res.status(200).json({
      success: true,
      message: `Service availability updated to ${newIsActive ? 'Available' : 'Unavailable'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleVisibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.service.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    const newIsVisible = req.body.is_visible !== undefined
      ? Boolean(req.body.is_visible)
      : !existing.is_visible;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        is_visible: newIsVisible,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_VISIBILITY_CHANGED',
      entityType: 'Service',
      entityId: id,
      metadata: {
        serviceName: existing.name,
        oldVisibility: existing.is_visible,
        newVisibility: newIsVisible,
      },
    });

    res.status(200).json({
      success: true,
      message: `Service visibility updated to ${newIsVisible ? 'Visible' : 'Hidden'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleFeatured(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.service.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    const newIsFeatured = req.body.is_featured !== undefined
      ? Boolean(req.body.is_featured)
      : !existing.is_featured;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        is_featured: newIsFeatured,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_FEATURED_CHANGED',
      entityType: 'Service',
      entityId: id,
      metadata: {
        serviceName: existing.name,
        oldFeatured: existing.is_featured,
        newFeatured: newIsFeatured,
      },
    });

    res.status(200).json({
      success: true,
      message: `Service featured status updated to ${newIsFeatured ? 'Featured' : 'Standard'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderServices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orders } = req.body; // Array of { id: string, display_order: number }
    if (!Array.isArray(orders)) {
      res.status(400).json({
        success: false,
        error: 'Orders array is required.',
      });
      return;
    }

    await prisma.$transaction(
      orders.map(item =>
        prisma.service.update({
          where: { id: item.id },
          data: { display_order: item.display_order },
        })
      )
    );

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_ORDER_CHANGED',
      entityType: 'Service',
      metadata: { reorderedCount: orders.length },
    });

    res.status(200).json({
      success: true,
      message: 'Service display order updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            leads: true,
            bookings: true,
            projects: true,
            quotations: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Service not found.',
      });
      return;
    }

    const hasRelations = (
      existing._count.leads > 0 ||
      existing._count.bookings > 0 ||
      existing._count.projects > 0 ||
      existing._count.quotations > 0
    );

    if (hasRelations) {
      // Historical CRM integrity: do not hard-delete referenced records. Archive and hide.
      const updated = await prisma.service.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          is_visible: false,
          is_active: false,
        },
      });

      await logAudit({
        userId: req.user?.id,
        action: 'SERVICE_ARCHIVED',
        entityType: 'Service',
        entityId: id,
        metadata: {
          serviceName: existing.name,
          reason: 'Archived due to existing CRM associations',
          relations: existing._count,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Service is linked to existing CRM records and has been safely archived & hidden.',
        data: updated,
      });
      return;
    }

    // No CRM relationships: safe to delete
    await prisma.service.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'SERVICE_DELETED',
      entityType: 'Service',
      entityId: id,
      metadata: { serviceName: existing.name },
    });

    res.status(200).json({
      success: true,
      message: 'Service permanently removed from catalog.',
    });
  } catch (error) {
    next(error);
  }
}
