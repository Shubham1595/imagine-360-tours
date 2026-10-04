import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { bookingCreateSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = bookingCreateSchema.parse(req.body);

    // 1. Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { email: data.email },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          source: 'Website Booking Flow',
        },
      });
    }

    // 2. Resolve Service & Validate Availability
    let serviceId = data.service_id;
    let resolvedService = null;
    if (serviceId) {
      resolvedService = await prisma.service.findUnique({ where: { id: serviceId } });
    } else if (data.service_name) {
      resolvedService = await prisma.service.findFirst({
        where: {
          OR: [
            { name: { equals: data.service_name } },
            { name: { contains: data.service_name } },
          ],
        },
      });
      if (resolvedService) serviceId = resolvedService.id;
    }

    if (resolvedService && !resolvedService.is_active) {
      res.status(409).json({
        success: false,
        message: 'This service is currently unavailable.',
      });
      return;
    }

    // 3. Create Booking
    const booking = await prisma.booking.create({
      data: {
        customer_id: customer.id,
        service_id: serviceId || null,
        booking_date: new Date(data.booking_date),
        amount: data.amount ? data.amount : null,
        notes: data.notes || null,
        status: 'PENDING',
      },
      include: {
        customer: true,
        service: true,
      },
    });

    // 4. Create a Lead if customer has no active lead
    await prisma.lead.create({
      data: {
        customer_id: customer.id,
        service_id: serviceId || null,
        status: 'WARM',
        priority: 'HIGH',
        source: 'Booking Request',
        notes: `Direct booking submitted for date: ${data.booking_date}. Package: ${data.service_name || 'Spatial Package'}.`,
      },
    });

    // 5. Log Audit
    await logAudit({
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking.id,
      metadata: {
        customerId: customer.id,
        bookingDate: data.booking_date,
        serviceId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking request confirmed. Our scheduling coordinator will contact you to finalize on-site details.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as any;

    const where: any = {};
    if (status && status !== 'undefined' && status !== 'ALL') where.status = status;

    // Scoping for standard user
    if (req.user?.role === 'USER') {
      const customer = await prisma.customer.findFirst({
        where: { email: req.user.email },
      });
      if (!customer) {
        res.status(200).json({ success: true, data: [], meta: { total: 0 } });
        return;
      }
      where.customer_id = customer.id;
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { booking_date: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, phone: true, email: true, company: true },
          },
          service: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
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

export async function updateBookingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? (notes as string | null) : undefined,
      },
      include: { customer: true, service: true },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'BOOKING_STATUS_UPDATED',
      entityType: 'Booking',
      entityId: id,
      metadata: { newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
