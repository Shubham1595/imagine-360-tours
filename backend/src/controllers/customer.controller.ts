import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { customerSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { parseLocationLink } from '../utils/locationParser';
import { normalizeWebsiteUrl } from '../utils/urlParser';

export async function getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 15));
    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;
    const serviceId = req.query.service_id as string;
    const source = req.query.source as string;
    const assignedTo = req.query.assigned_to as string;

    const where: Prisma.CustomerWhereInput = {};

    // Role-based scoping: SALES or STAFF sees assigned or unassigned
    if (req.user?.role === 'SALES') {
      where.OR = [
        { assigned_to: req.user.id },
        { assigned_to: null }
      ];
    } else if (req.user?.role === 'STAFF') {
      where.assigned_to = req.user.id;
    }

    if (search) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
            { city: { contains: search } },
          ],
        },
      ];
    }

    const classification = req.query.classification as string;
    const stage = req.query.stage as string;

    if (source && source !== 'undefined' && source !== 'ALL') {
      where.source = source;
    }

    if (assignedTo && assignedTo !== 'undefined' && assignedTo !== 'ALL') {
      where.assigned_to = assignedTo;
    }

    const leadWhere: any = {};
    if (classification && classification !== 'undefined' && classification !== 'ALL') {
      leadWhere.classification = classification as any;
    } else if (status && status !== 'undefined' && status !== 'ALL') {
      leadWhere.classification = status as any;
    }

    if (stage && stage !== 'undefined' && stage !== 'ALL') {
      leadWhere.stage = stage as any;
    }

    if (serviceId && serviceId !== 'undefined' && serviceId !== 'ALL') {
      leadWhere.service_id = serviceId;
    }

    if (Object.keys(leadWhere).length > 0) {
      where.leads = {
        some: leadWhere,
      };
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          assigned_user: {
            select: { id: true, name: true, email: true },
          },
          leads: {
            take: 1,
            orderBy: { updated_at: 'desc' },
            include: {
              service: {
                select: { id: true, name: true, category: true },
              },
            },
          },
          follow_ups: {
            where: { status: 'PENDING' },
            take: 1,
            orderBy: { scheduled_date: 'asc' },
          },
          call_logs: {
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
      }),
    ]);

    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      website: c.website,
      city: c.city,
      address: c.address,
      source: c.source,
      assigned_to: c.assigned_to,
      assigned_user: c.assigned_user,
      created_at: c.created_at,
      updated_at: c.updated_at,
      latest_lead: c.leads[0] || null,
      next_follow_up: c.follow_ups[0] || null,
      last_call: c.call_logs[0] || null,
    }));

    res.status(200).json({
      success: true,
      data: formattedCustomers,
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

export async function getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assigned_user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        leads: {
          orderBy: { created_at: 'desc' },
          include: {
            service: true,
          },
        },
        call_logs: {
          orderBy: { created_at: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true },
            },
          },
        },
        follow_ups: {
          orderBy: { scheduled_date: 'desc' },
          include: {
            assigned_user: {
              select: { id: true, name: true },
            },
          },
        },
        enquiries: {
          orderBy: { created_at: 'desc' },
        },
        bookings: {
          orderBy: { booking_date: 'desc' },
          include: {
            service: true,
          },
        },
        projects: {
          orderBy: { created_at: 'desc' },
          include: {
            service: true,
            manager: {
              select: { id: true, name: true },
            },
          },
        },
        quotations: {
          orderBy: { created_at: 'desc' },
          include: {
            service: true,
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer record not found.',
      });
      return;
    }

    const locationObj = {
      address: customer.address || null,
      city: customer.city || null,
      state: customer.state || null,
      pincode: customer.pincode || null,
      latitude: customer.latitude || null,
      longitude: customer.longitude || null,
      mapUrl: customer.map_url || null,
    };

    res.status(200).json({
      success: true,
      data: {
        ...customer,
        location: locationObj,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = customerSchema.parse(req.body);

    // Check duplicate by phone
    const existing = await prisma.customer.findFirst({
      where: { phone: data.phone },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'A customer with this phone number already exists.',
        data: existing,
      });
      return;
    }

    // Auto-parse coordinates from map_url if latitude/longitude not explicitly given
    let lat = data.latitude !== undefined ? data.latitude : null;
    let lng = data.longitude !== undefined ? data.longitude : null;
    if (data.map_url && (lat === null || lng === null)) {
      const parsed = parseLocationLink(data.map_url);
      if (parsed.isValidCoordinates) {
        if (lat === null) lat = parsed.latitude;
        if (lng === null) lng = parsed.longitude;
      }
    }

    let websiteVal: string | null = null;
    if (data.website) {
      const parsedWeb = normalizeWebsiteUrl(data.website);
      websiteVal = parsedWeb.isValid ? parsedWeb.url : data.website;
    }

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        company: data.company || null,
        website: websiteVal,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        address: data.address || null,
        latitude: lat,
        longitude: lng,
        map_url: data.map_url || null,
        source: data.source || 'Direct Entry',
        assigned_to: data.assigned_to || req.user?.id || null,
      },
    });

    // Create an initial lead for this customer
    const initialClass = (req.body.initial_classification || req.body.initial_status || 'WARM') as any;
    const initialStage = (req.body.initial_stage || 'LEAD_CAPTURED') as any;
    const lead = await prisma.lead.create({
      data: {
        customer_id: customer.id,
        classification: initialClass,
        status: initialClass,
        stage: initialStage,
        service_id: req.body.service_id || null,
        notes: req.body.notes || 'Created manually via CRM.',
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      metadata: { name: customer.name, phone: customer.phone },
    });

    res.status(201).json({
      success: true,
      message: 'Customer record created successfully.',
      data: {
        ...customer,
        initial_lead: lead,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = customerSchema.partial().parse(req.body);

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Customer not found.' });
      return;
    }

    // Auto-parse coordinates from new map_url if latitude/longitude not explicitly given
    let lat = data.latitude !== undefined ? data.latitude : undefined;
    let lng = data.longitude !== undefined ? data.longitude : undefined;
    if (data.map_url && lat === undefined && lng === undefined) {
      const parsed = parseLocationLink(data.map_url);
      if (parsed.isValidCoordinates) {
        lat = parsed.latitude;
        lng = parsed.longitude;
      }
    }

    let websiteVal: string | null | undefined = undefined;
    if (data.website !== undefined) {
      if (data.website === null || data.website === '') {
        websiteVal = null;
      } else {
        const parsedWeb = normalizeWebsiteUrl(data.website);
        websiteVal = parsedWeb.isValid ? parsedWeb.url : data.website;
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email !== undefined ? data.email : undefined,
        company: data.company !== undefined ? data.company : undefined,
        website: websiteVal,
        city: data.city !== undefined ? data.city : undefined,
        state: data.state !== undefined ? data.state : undefined,
        pincode: data.pincode !== undefined ? data.pincode : undefined,
        address: data.address !== undefined ? data.address : undefined,
        latitude: lat,
        longitude: lng,
        map_url: data.map_url !== undefined ? data.map_url : undefined,
        source: data.source !== undefined ? data.source : undefined,
        assigned_to: data.assigned_to !== undefined ? (data.assigned_to as string | null) : undefined,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: updated.id,
      metadata: { updatedFields: Object.keys(data) },
    });

    res.status(200).json({
      success: true,
      message: 'Customer details updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Customer not found.' });
      return;
    }

    await prisma.customer.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'CUSTOMER_DELETED',
      entityType: 'Customer',
      entityId: id,
      metadata: { name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: 'Customer record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
