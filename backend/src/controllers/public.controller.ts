import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

/**
 * Public Service API
 * Returns only visible services with data minimization.
 * Preserves is_active so public website can display "Currently unavailable"
 * when is_visible = true and is_active = false.
 */
export async function getPublicServices(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        image: true,
        price: true,
        duration: true,
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

/**
 * Public Projects API
 * Returns only explicitly public projects.
 * Client identities and internal CRM notes are strictly omitted.
 */
export async function getPublicProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        is_public: true,
      },
      select: {
        id: true,
        project_name: true,
        status: true,
        public_description: true,
        cover_image: true,
        is_featured: true,
        display_order: true,
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: [
        { display_order: 'asc' },
        { created_at: 'desc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Website Settings API
 * Safe public key-value store for company name, contact info, social links, SEO.
 * Zero secrets or internal configurations are exposed.
 */
export async function getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settingsList = await prisma.websiteSetting.findMany({
      where: {
        is_public: true,
      },
      select: {
        key: true,
        value: true,
        category: true,
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }

    res.status(200).json({
      success: true,
      data: settingsMap,
      list: settingsList,
    });
  } catch (error) {
    next(error);
  }
}
