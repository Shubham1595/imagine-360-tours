import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/logger';

// Admin view all website settings
export async function getAllSettingsAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.websiteSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      data: settingsMap,
      list: settings,
    });
  } catch (error) {
    next(error);
  }
}

// Admin update website settings (batch or single)
export async function updateSettingsAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { settings } = req.body; // Can be a map { [key]: value } or an array [{ key, value, category?, is_public? }]

    if (!settings || (typeof settings !== 'object' && !Array.isArray(settings))) {
      res.status(400).json({
        success: false,
        error: 'Settings data is required.',
      });
      return;
    }

    const updatedKeys: string[] = [];

    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (!item.key) continue;
        await prisma.websiteSetting.upsert({
          where: { key: item.key },
          update: {
            value: String(item.value ?? ''),
            category: item.category ?? undefined,
            is_public: item.is_public !== undefined ? Boolean(item.is_public) : undefined,
          },
          create: {
            key: item.key,
            value: String(item.value ?? ''),
            category: item.category || 'general',
            is_public: item.is_public !== undefined ? Boolean(item.is_public) : true,
          },
        });
        updatedKeys.push(item.key);
      }
    } else {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.websiteSetting.upsert({
          where: { key },
          update: {
            value: String(value ?? ''),
          },
          create: {
            key,
            value: String(value ?? ''),
            category: 'general',
            is_public: true,
          },
        });
        updatedKeys.push(key);
      }
    }

    await logAudit({
      userId: req.user?.id,
      action: 'WEBSITE_SETTING_UPDATED',
      entityType: 'WebsiteSetting',
      metadata: { updatedKeys },
    });

    // Return the updated settings map
    const all = await prisma.websiteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    all.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    res.status(200).json({
      success: true,
      message: 'Website settings updated successfully.',
      data: settingsMap,
    });
  } catch (error) {
    next(error);
  }
}
