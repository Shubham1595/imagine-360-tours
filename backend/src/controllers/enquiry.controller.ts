import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { enquiryCreateSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma, EnquiryStatus } from '@prisma/client';

export async function createEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = enquiryCreateSchema.parse(req.body);

    // 0. Authoritative Service Availability Validation
    let matchedService = null;
    if (data.service_id) {
      matchedService = await prisma.service.findUnique({
        where: { id: data.service_id },
      });
    } else if (data.project_type) {
      matchedService = await prisma.service.findFirst({
        where: {
          OR: [
            { name: { equals: data.project_type } },
            { name: { contains: data.project_type } },
          ],
        },
      });
    }

    if (matchedService && !matchedService.is_active) {
      res.status(409).json({
        success: false,
        message: 'This service is currently unavailable.',
      });
      return;
    }

    // 1. Find customer by email or phone
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { email: data.email },
        ],
      },
    });

    // 2. If customer does not exist, create customer
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          company: data.company || null,
          city: data.project_location || null,
          source: 'Website Enquiry Form',
        },
      });
    } else {
      // Update company or city if missing
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          company: customer.company || data.company || undefined,
          city: customer.city || data.project_location || undefined,
        },
      });
    }

    // 3. Create Enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        customer_id: customer.id,
        project_type: data.project_type,
        project_location: data.project_location || null,
        budget: data.budget || null,
        description: data.description,
        status: 'NEW',
      },
    });

    // 5. Create Lead with stage: LEAD_CAPTURED (no automatic follow-up scheduled)
    const lead = await prisma.lead.create({
      data: {
        customer_id: customer.id,
        service_id: matchedService?.id || null,
        classification: 'WARM',
        status: 'WARM',
        stage: 'LEAD_CAPTURED',
        priority: 'MEDIUM',
        source: 'Website Enquiry Form',
        notes: `Website Brief: Type: ${data.project_type}. Budget: ${data.budget || 'Not specified'}. Description: ${data.description}`,
      },
    });

    // 6. Log Audit
    await logAudit({
      action: 'ENQUIRY_SUBMITTED',
      entityType: 'Enquiry',
      entityId: enquiry.id,
      metadata: {
        customerId: customer.id,
        projectType: data.project_type,
        budget: data.budget,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your project enquiry has been registered. Our technical director will contact you within 24 hours.',
      data: {
        enquiry_id: enquiry.id,
        customer_id: customer.id,
        lead_id: lead.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEnquiries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const status = req.query.status as string | undefined;

    const where: Prisma.EnquiryWhereInput = {};
    if (status && status !== 'undefined' && status !== 'ALL') {
      where.status = status as EnquiryStatus;
    }

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, phone: true, email: true, company: true, city: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: enquiries,
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

export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
      include: { customer: true },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'ENQUIRY_STATUS_UPDATED',
      entityType: 'Enquiry',
      entityId: id,
      metadata: { newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
