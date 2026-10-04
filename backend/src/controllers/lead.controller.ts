import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { leadStatusUpdateSchema, leadStageUpdateSchema, followUpCreateSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma, LeadStatus, LeadClassification, LeadStage, LeadPriority, FollowUpType } from '@prisma/client';
import { syncLeadNextFollowUp } from '../utils/followupSync';

export async function getLeads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const classification = (req.query.classification || req.query.status) as LeadClassification | undefined;
    const stage = req.query.stage as LeadStage | undefined;
    const serviceId = req.query.service_id as string | undefined;
    const search = req.query.search as string | undefined;
    const priority = req.query.priority as LeadPriority | undefined;

    const where: Prisma.LeadWhereInput = {};
    if (classification && String(classification) !== 'undefined' && String(classification) !== 'ALL') {
      where.classification = classification;
    }
    if (stage && String(stage) !== 'undefined' && String(stage) !== 'ALL') {
      where.stage = stage;
    }
    if (priority && String(priority) !== 'undefined' && String(priority) !== 'ALL') {
      where.priority = priority;
    }
    if (serviceId && serviceId !== 'undefined' && serviceId !== 'ALL') {
      where.service_id = serviceId;
    }

    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
          { company: { contains: search } },
        ],
      };
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            company: true,
            city: true,
            assigned_user: {
              select: { id: true, name: true },
            },
          },
        },
        service: {
          select: { id: true, name: true, category: true },
        },
        assigned_user: {
          select: { id: true, name: true, email: true },
        },
        follow_ups: {
          where: { status: 'PENDING' },
          orderBy: { scheduled_date: 'asc' },
          take: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        assigned_user: {
          select: { id: true, name: true, email: true },
        },
        follow_ups: {
          orderBy: { scheduled_date: 'desc' },
        },
        call_logs: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadsKanban(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const classificationFilter = req.query.classification as LeadClassification | undefined;

    const leads = await prisma.lead.findMany({
      where: classificationFilter && classificationFilter !== ('undefined' as any) && classificationFilter !== ('ALL' as any)
        ? { classification: classificationFilter }
        : {},
      orderBy: { updated_at: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            company: true,
            city: true,
            source: true,
            assigned_to: true,
            assigned_user: {
              select: { id: true, name: true },
            },
          },
        },
        service: {
          select: { id: true, name: true, category: true },
        },
        assigned_user: {
          select: { id: true, name: true },
        },
        follow_ups: {
          where: { status: 'PENDING' },
          orderBy: { scheduled_date: 'asc' },
          take: 1,
        },
      },
    });

    // Level 1: Primary Classification Columns (COLD | WARM | HOT)
    const classificationColumns: Record<LeadClassification, typeof leads> = {
      COLD: [],
      WARM: [],
      HOT: [],
    };

    // Level 2: Secondary Sales Stages Columns
    const stageColumns: Record<LeadStage, typeof leads> = {
      LEAD_CAPTURED: [],
      INITIAL_CONTACT: [],
      NEEDS_ANALYSIS: [],
      QUOTATION_SENT: [],
      NEGOTIATION: [],
      VERBAL_COMMITMENT: [],
      CLOSED_WON: [],
      CLOSED_LOST: [],
    };

    for (const lead of leads) {
      if (classificationColumns[lead.classification]) {
        classificationColumns[lead.classification].push(lead);
      }
      if (stageColumns[lead.stage]) {
        stageColumns[lead.stage].push(lead);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        // Level 1: Primary Classifications
        COLD: classificationColumns.COLD,
        WARM: classificationColumns.WARM,
        HOT: classificationColumns.HOT,
        classificationCounts: {
          COLD: classificationColumns.COLD.length,
          WARM: classificationColumns.WARM.length,
          HOT: classificationColumns.HOT.length,
        },
        // Level 2: Sub-stages
        stages: stageColumns,
        stageCounts: Object.fromEntries(
          Object.entries(stageColumns).map(([k, v]) => [k, v.length])
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = leadStatusUpdateSchema.parse(req.body);

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    const previousClassification = lead.classification;
    const newClassification = (data.classification || data.status) as LeadClassification;

    // Build update object
    const updateData: Prisma.LeadUpdateInput = {
      classification: newClassification,
      status: newClassification as LeadStatus,
      last_contact_at: new Date(),
    };

    if (data.stage) {
      updateData.stage = data.stage;
    }

    if (data.estimated_deal_value !== undefined) {
      updateData.estimated_deal_value = data.estimated_deal_value;
    }

    if (data.expected_closing_date) {
      updateData.expected_closing_date = new Date(data.expected_closing_date);
    }

    if (data.closing_probability !== undefined) {
      updateData.closing_probability = data.closing_probability;
    }

    if (data.lost_reason) {
      updateData.lost_reason = data.lost_reason;
    }

    if (data.notes) {
      updateData.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString()}]: ${data.notes}`.trim();
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        service: true,
      },
    });

    // If setting to WARM and follow-up details provided
    let createdFollowUp = null;
    if (newClassification === 'WARM' && data.follow_up_date && data.follow_up_time) {
      createdFollowUp = await prisma.followUp.create({
        data: {
          customer_id: lead.customer_id,
          lead_id: lead.id,
          assigned_to: req.user?.id || (lead as any).customer?.assigned_to || null,
          scheduled_date: new Date(data.follow_up_date),
          scheduled_time: data.follow_up_time,
          type: 'GENERAL_FOLLOW_UP',
          purpose: data.follow_up_purpose || data.reason || 'Requirement Discussion',
          reason: data.reason || 'Status changed to WARM - scheduled follow-up',
          notes: data.notes || null,
          status: 'PENDING',
        },
      });

      await syncLeadNextFollowUp(id);
    }

    await logAudit({
      userId: req.user?.id,
      action: 'LEAD_CLASSIFICATION_CHANGED',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: {
        previousClassification,
        newClassification,
        stage: data.stage || lead.stage,
        customerId: lead.customer_id,
        reason: data.reason,
        nextAction: data.next_action,
      },
    });

    res.status(200).json({
      success: true,
      message: `Lead classification updated to ${newClassification}.`,
      data: {
        lead: updatedLead,
        follow_up: createdFollowUp,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = leadStageUpdateSchema.parse(req.body);

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { customer: true, service: true },
    });

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    const previousStage = lead.stage;
    const updateData: Prisma.LeadUpdateInput = {
      stage: data.stage,
      last_contact_at: new Date(),
    };

    if (data.notes) {
      updateData.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString()} Stage -> ${data.stage}]: ${data.notes}`.trim();
    }

    if (data.expected_closing_date) {
      updateData.expected_closing_date = new Date(data.expected_closing_date);
    }

    if (data.estimated_deal_value !== undefined && data.estimated_deal_value !== null) {
      updateData.estimated_deal_value = data.estimated_deal_value;
    }

    if (data.closing_probability !== undefined && data.closing_probability !== null) {
      updateData.closing_probability = data.closing_probability;
    }

    // Special handling for CLOSED_LOST
    if (data.stage === 'CLOSED_LOST') {
      updateData.final_result = 'LOST';
      updateData.lost_reason = data.lost_reason;

      // Close/cancel pending sales follow-ups unless explicitly requested to retain
      if (data.cancel_pending_follow_ups !== false) {
        await prisma.followUp.updateMany({
          where: { lead_id: lead.id, status: 'PENDING' },
          data: {
            status: 'CANCELLED',
            notes: 'Automatically cancelled upon Closed Lost transition',
          },
        });
      }
    }

    // Special handling for CLOSED_WON: update final_result without automatically creating project
    if (data.stage === 'CLOSED_WON') {
      updateData.final_result = 'WON';
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        service: true,
      },
    });

    // Synchronize earliest pending follow up
    await syncLeadNextFollowUp(id);

    await logAudit({
      userId: req.user?.id,
      action: 'LEAD_STAGE_CHANGED',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: {
        previousStage,
        newStage: data.stage,
        dealValue: data.estimated_deal_value,
        reason: data.reason,
        lostReason: data.lost_reason,
      },
    });

    res.status(200).json({
      success: true,
      message: `Lead sales stage transitioned to ${data.stage}.`,
      data: {
        lead: updatedLead,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function scheduleProjectDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const leadId = req.params.id as string;
    const body = req.body;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { customer: true },
    });

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    const scheduledDate = new Date(body.scheduled_date);
    const followUp = await prisma.followUp.create({
      data: {
        customer_id: lead.customer_id,
        lead_id: lead.id,
        assigned_to: body.assigned_to || req.user?.id || null,
        type: (body.type as FollowUpType) || 'PROJECT_DISCUSSION',
        purpose: body.purpose || 'Project Scope Finalization',
        scheduled_date: scheduledDate,
        scheduled_time: body.scheduled_time || '11:30 AM',
        expected_start_date: body.expected_start_date ? new Date(body.expected_start_date) : null,
        estimated_project_value: body.estimated_project_value ? Number(body.estimated_project_value) : null,
        next_action: body.next_action || 'Requirement discussion and quotation review',
        notes: body.notes || null,
        status: 'PENDING',
      },
      include: {
        customer: true,
        assigned_user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update lead's expected value
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        last_contact_at: new Date(),
        estimated_deal_value: body.estimated_project_value ? Number(body.estimated_project_value) : lead.estimated_deal_value,
      },
    });

    await syncLeadNextFollowUp(lead.id);

    await logAudit({
      userId: req.user?.id,
      action: 'PROJECT_DISCUSSION_SCHEDULED',
      entityType: 'FollowUp',
      entityId: followUp.id,
      metadata: {
        customerId: lead.customer_id,
        leadId: lead.id,
        purpose: followUp.purpose,
        scheduledDate: body.scheduled_date,
        scheduledTime: body.scheduled_time,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project Discussion follow-up scheduled successfully.',
      data: followUp,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProjectForLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { customer: true, service: true },
    });

    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    // Check if project already exists for this lead to avoid duplicates
    const existing = await prisma.project.findFirst({
      where: {
        customer_id: lead.customer_id,
        service_id: lead.service_id,
        project_name: `${lead.customer.name} - ${lead.service?.name || 'Spatial Project'}`,
      },
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message: 'A project for this customer and service already exists in the production pipeline.',
        data: existing,
      });
      return;
    }

    const project = await prisma.project.create({
      data: {
        customer_id: lead.customer_id,
        service_id: lead.service_id,
        project_name: `${lead.customer.name} - ${lead.service?.name || 'Spatial Project'}`,
        status: 'PLANNING',
        amount: lead.estimated_deal_value ? Number(lead.estimated_deal_value) : null,
        deadline: lead.expected_closing_date ? new Date(lead.expected_closing_date) : null,
        assigned_to: req.user?.id || null,
        notes: `Created explicitly from Closed Won Lead (${lead.id}). Deal Notes: ${lead.notes || ''}`,
      },
    });

    await logAudit({
      userId: req.user?.id,
      action: 'PROJECT_CREATED_FROM_LEAD',
      entityType: 'Project',
      entityId: project.id,
      metadata: { leadId: lead.id, customerId: lead.customer_id },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully in production pipeline.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}
