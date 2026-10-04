import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { quotationCreateSchema, quotationUpdateSchema, quotationStatusEnum } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma, QuotationStatus } from '@prisma/client';

export async function getQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const search = req.query.search as string;
    const status = req.query.status as string;
    const customerId = req.query.customer_id as string;
    const leadId = req.query.lead_id as string;

    const where: Prisma.QuotationWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status as QuotationStatus;
    }

    if (customerId) {
      where.customer_id = customerId;
    }

    if (leadId) {
      where.lead_id = leadId;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { quotation_number: { contains: search.trim() } },
        { customer: { name: { contains: search.trim() } } },
        { customer: { company: { contains: search.trim() } } },
        { customer: { phone: { contains: search.trim() } } },
      ];
    }

    const [total, quotations] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
              phone: true,
              email: true,
              city: true,
            },
          },
          lead: {
            select: {
              id: true,
              stage: true,
              classification: true,
              estimated_deal_value: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const formatted = quotations.map((q) => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(q.items);
      } catch {
        parsedItems = [];
      }
      return {
        ...q,
        items: parsedItems,
        subtotal: Number(q.subtotal),
        discount: Number(q.discount),
        tax: Number(q.tax),
        total_amount: Number(q.total_amount),
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
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

export async function getQuotationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: {
          include: {
            service: true,
          },
        },
        service: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!quotation) {
      res.status(404).json({
        success: false,
        error: 'Quotation not found.',
      });
      return;
    }

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(quotation.items);
    } catch {
      parsedItems = [];
    }

    res.status(200).json({
      success: true,
      data: {
        ...quotation,
        items: parsedItems,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        tax: Number(quotation.tax),
        total_amount: Number(quotation.total_amount),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = quotationCreateSchema.parse(req.body);

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customer_id },
    });
    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer record does not exist.',
      });
      return;
    }

    // Calculate subtotal from items
    const computedSubtotal = data.items.reduce((acc, item) => {
      const lineTotal = item.total !== undefined ? item.total : item.quantity * item.unit_price;
      return acc + lineTotal;
    }, 0);

    const subtotal = data.subtotal !== undefined ? data.subtotal : computedSubtotal;
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total_amount = data.total_amount !== undefined ? data.total_amount : subtotal - discount + tax;

    // Validity date
    let valid_until: Date | null = null;
    if (data.valid_until) {
      valid_until = new Date(data.valid_until);
    } else if (data.validity_days) {
      valid_until = new Date();
      valid_until.setDate(valid_until.getDate() + data.validity_days);
    }

    // Concurrency-safe sequential quotation number generator
    const year = new Date().getFullYear();
    const prefix = `QT-${year}-`;
    const latestQuote = await prisma.quotation.findFirst({
      where: {
        quotation_number: { startsWith: prefix },
      },
      orderBy: { created_at: 'desc' },
      select: { quotation_number: true },
    });

    let nextSeq = 1;
    if (latestQuote && latestQuote.quotation_number) {
      const match = latestQuote.quotation_number.match(/^QT-\d{4}-(\d+)$/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    let quotation = null;
    let attempts = 0;
    while (!quotation && attempts < 5) {
      const candidateNumber = `${prefix}${String(nextSeq + attempts).padStart(4, '0')}`;
      try {
        quotation = await prisma.quotation.create({
          data: {
            quotation_number: candidateNumber,
            customer_id: data.customer_id,
            lead_id: data.lead_id || null,
            service_id: data.service_id || null,
            items: JSON.stringify(data.items),
            subtotal,
            discount,
            tax,
            total_amount,
            validity_days: data.validity_days || 30,
            valid_until,
            notes: data.notes || null,
            terms: data.terms || '1. 50% advance upon confirmation. 50% on project completion.\n2. Quotation valid for 30 days.\n3. Taxes as applicable.',
            status: data.status || 'DRAFT',
            created_by: req.user?.id || null,
          },
          include: {
            customer: true,
            service: true,
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        });
      } catch (createErr: any) {
        if (createErr.code === 'P2002' && attempts < 4) {
          attempts++;
        } else {
          throw createErr;
        }
      }
    }

    if (!quotation) {
      throw new Error('Unable to generate unique quotation number under current concurrency.');
    }

    await logAudit({
      userId: req.user?.id,
      action: 'CREATE_QUOTATION',
      entityType: 'Quotation',
      entityId: quotation.id,
      metadata: {
        quotation_number: quotation.quotation_number,
        customer_id: quotation.customer_id,
        total_amount: Number(quotation.total_amount),
      },
    });

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(quotation.items);
    } catch {
      parsedItems = [];
    }

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully.',
      data: {
        ...quotation,
        items: parsedItems,
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        tax: Number(quotation.tax),
        total_amount: Number(quotation.total_amount),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = quotationUpdateSchema.parse(req.body);

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Quotation not found.' });
      return;
    }

    const updateData: Prisma.QuotationUpdateInput = {};

    if (data.items) {
      updateData.items = JSON.stringify(data.items);
      const computedSubtotal = data.items.reduce((acc, item) => {
        const lineTotal = item.total !== undefined ? item.total : item.quantity * item.unit_price;
        return acc + lineTotal;
      }, 0);
      updateData.subtotal = data.subtotal !== undefined ? data.subtotal : computedSubtotal;
    } else if (data.subtotal !== undefined) {
      updateData.subtotal = data.subtotal;
    }

    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.tax !== undefined) updateData.tax = data.tax;

    // Recalculate total_amount if subtotal/discount/tax are updated
    if (data.total_amount !== undefined) {
      updateData.total_amount = data.total_amount;
    } else if (updateData.subtotal !== undefined || updateData.discount !== undefined || updateData.tax !== undefined) {
      const sub = Number(updateData.subtotal ?? existing.subtotal);
      const disc = Number(updateData.discount ?? existing.discount);
      const tx = Number(updateData.tax ?? existing.tax);
      updateData.total_amount = sub - disc + tx;
    }

    if (data.validity_days !== undefined) updateData.validity_days = data.validity_days;
    if (data.valid_until !== undefined) updateData.valid_until = data.valid_until ? new Date(data.valid_until) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.status) updateData.status = data.status;

    const updated = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        service: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_QUOTATION',
      entityType: 'Quotation',
      entityId: id,
      metadata: {
        updatedFields: Object.keys(data),
      },
    });

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(updated.items);
    } catch {
      parsedItems = [];
    }

    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully.',
      data: {
        ...updated,
        items: parsedItems,
        subtotal: Number(updated.subtotal),
        discount: Number(updated.discount),
        tax: Number(updated.tax),
        total_amount: Number(updated.total_amount),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuotationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validatedStatus = quotationStatusEnum.parse(status);

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Quotation not found.' });
      return;
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: validatedStatus },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'UPDATE_QUOTATION_STATUS',
      entityType: 'Quotation',
      entityId: id,
      metadata: {
        previous_status: existing.status,
        new_status: validatedStatus,
      },
    });

    res.status(200).json({
      success: true,
      message: `Quotation status updated to ${validatedStatus}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Quotation not found.' });
      return;
    }

    // Only DRAFT or CANCELLED quotations can be deleted, unless ADMIN/SUPER_ADMIN
    const isSuperOrAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
    if (!isSuperOrAdmin && existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
      res.status(400).json({
        success: false,
        error: `Cannot delete quotation with status ${existing.status}. Only DRAFT or CANCELLED quotes can be deleted.`,
      });
      return;
    }

    await prisma.quotation.delete({ where: { id } });

    await logAudit({
      userId: req.user?.id,
      action: 'DELETE_QUOTATION',
      entityType: 'Quotation',
      entityId: id,
      metadata: {
        quotation_number: existing.quotation_number,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
