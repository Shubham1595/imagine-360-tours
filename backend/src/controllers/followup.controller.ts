import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { followUpCreateSchema, followUpCompleteSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma, FollowUpType } from '@prisma/client';
import { syncLeadNextFollowUp } from '../utils/followupSync';

export async function getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const view = (req.query.view as string) || 'all'; // 'today', 'overdue', 'upcoming', 'completed', 'all'
    const type = req.query.type as string;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: Prisma.FollowUpWhereInput = {};

    if (view === 'today') {
      where.scheduled_date = { gte: today, lt: tomorrow };
      where.status = 'PENDING';
    } else if (view === 'overdue') {
      where.scheduled_date = { lt: today };
      where.status = 'PENDING';
    } else if (view === 'upcoming') {
      where.scheduled_date = { gte: tomorrow };
      where.status = 'PENDING';
    } else if (view === 'completed') {
      where.status = 'COMPLETED';
    }

    if (type && type !== 'undefined' && type !== 'ALL') {
      where.type = type as FollowUpType;
    }

    // Role-based scoping for staff/sales
    if (req.user?.role === 'SALES' || req.user?.role === 'STAFF') {
      where.OR = [
        { assigned_to: req.user.id },
        { assigned_to: null },
      ];
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: [
        { scheduled_date: 'asc' },
        { scheduled_time: 'asc' },
      ],
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            email: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            latitude: true,
            longitude: true,
            map_url: true,
          },
        },
        assigned_user: {
          select: { id: true, name: true, email: true },
        },
        lead: {
          select: {
            id: true,
            status: true,
            classification: true,
            stage: true,
            estimated_deal_value: true,
            service_id: true,
            service: { select: { name: true } },
          },
        },
      },
    });

    // Compute status counts for quick tabs
    const [todayCount, overdueCount, upcomingCount, completedCount] = await Promise.all([
      prisma.followUp.count({ where: { scheduled_date: { gte: today, lt: tomorrow }, status: 'PENDING' } }),
      prisma.followUp.count({ where: { scheduled_date: { lt: today }, status: 'PENDING' } }),
      prisma.followUp.count({ where: { scheduled_date: { gte: tomorrow }, status: 'PENDING' } }),
      prisma.followUp.count({ where: { status: 'COMPLETED' } }),
    ]);

    res.status(200).json({
      success: true,
      data: followUps,
      meta: {
        counts: {
          today: todayCount,
          overdue: overdueCount,
          upcoming: upcomingCount,
          completed: completedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = followUpCreateSchema.parse(req.body);

    const followUp = await prisma.followUp.create({
      data: {
        customer_id: data.customer_id,
        lead_id: data.lead_id || null,
        assigned_to: data.assigned_to || req.user?.id || null,
        type: data.type || 'GENERAL_FOLLOW_UP',
        purpose: data.purpose || data.reason || 'General Follow-up',
        scheduled_date: new Date(data.scheduled_date),
        scheduled_time: data.scheduled_time,
        reason: data.reason || 'General Follow-up',
        notes: data.notes || null,
        expected_start_date: data.expected_start_date ? new Date(data.expected_start_date) : null,
        estimated_project_value: data.estimated_project_value ? Number(data.estimated_project_value) : null,
        next_action: data.next_action || null,
        status: 'PENDING',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    if (data.lead_id) {
      await syncLeadNextFollowUp(data.lead_id);
    }

    await logAudit({
      userId: req.user?.id,
      action: 'FOLLOW_UP_CREATED',
      entityType: 'FollowUp',
      entityId: followUp.id,
      metadata: {
        customerId: data.customer_id,
        type: followUp.type,
        purpose: followUp.purpose,
        scheduledDate: data.scheduled_date,
        scheduledTime: data.scheduled_time,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully.',
      data: followUp,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = followUpCompleteSchema.parse(req.body);

    const existing = await prisma.followUp.findUnique({
      where: { id },
      include: { customer: true, lead: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Follow-up record not found.' });
      return;
    }

    // 1. Mark existing follow-up as completed
    const completed = await prisma.followUp.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
        notes: data.notes
          ? `${existing.notes || ''}\nCompleted [${new Date().toLocaleDateString()}]: ${data.notes}`.trim()
          : existing.notes,
      },
    });

    // 2. Update the associated lead classification & stage ONLY if explicitly specified
    if (existing.lead_id) {
      const updateData: Prisma.LeadUpdateInput = {
        last_contact_at: new Date(),
      };
      if (data.outcome) {
        updateData.classification = data.outcome;
        updateData.status = data.outcome;
      }
      if (data.stage) {
        updateData.stage = data.stage;
      }
      await prisma.lead.update({
        where: { id: existing.lead_id },
        data: updateData,
      });

      // Audit log classification change if changed
      if (data.outcome && existing.lead?.classification !== data.outcome) {
        await logAudit({
          userId: req.user?.id,
          action: 'LEAD_CLASSIFICATION_CHANGED',
          entityType: 'Lead',
          entityId: existing.lead_id,
          metadata: {
            previousClassification: existing.lead?.classification,
            newClassification: data.outcome,
            source: 'FOLLOW_UP_COMPLETION',
          },
        });
      }

      // Audit log stage change if changed
      if (data.stage && existing.lead?.stage !== data.stage) {
        await logAudit({
          userId: req.user?.id,
          action: 'LEAD_STAGE_CHANGED',
          entityType: 'Lead',
          entityId: existing.lead_id,
          metadata: {
            previousStage: existing.lead?.stage,
            newStage: data.stage,
            source: 'FOLLOW_UP_COMPLETION',
          },
        });
      }
    }

    // 3. Create next follow-up if date and time provided
    let nextFollowUp = null;
    if (data.next_follow_up_date && data.next_follow_up_time) {
      const nextType =
        data.next_follow_up_type ||
        (data.outcome === 'HOT' ? 'PROJECT_DISCUSSION' : 'GENERAL_FOLLOW_UP');

      nextFollowUp = await prisma.followUp.create({
        data: {
          customer_id: existing.customer_id,
          lead_id: existing.lead_id,
          assigned_to: req.user?.id || existing.assigned_to || null,
          type: nextType,
          purpose: data.next_follow_up_reason || (data.outcome === 'HOT' ? 'Project Discussion' : 'Sequential follow-up'),
          scheduled_date: new Date(data.next_follow_up_date),
          scheduled_time: data.next_follow_up_time,
          reason: data.next_follow_up_reason || 'Sequential follow-up',
          notes: data.notes || null,
          next_action: data.next_action || null,
          status: 'PENDING',
        },
      });

      await logAudit({
        userId: req.user?.id,
        action: 'FOLLOW_UP_CREATED',
        entityType: 'FollowUp',
        entityId: nextFollowUp.id,
        metadata: {
          customerId: existing.customer_id,
          leadId: existing.lead_id,
          type: nextType,
          scheduledDate: data.next_follow_up_date,
          scheduledTime: data.next_follow_up_time,
          source: 'SEQUENTIAL_FOLLOW_UP',
        },
      });
    }

    // 4. Synchronize lead.next_follow_up_at with the earliest pending follow-up
    if (existing.lead_id) {
      await syncLeadNextFollowUp(existing.lead_id);
    }

    await logAudit({
      userId: req.user?.id,
      action: 'FOLLOW_UP_COMPLETED',
      entityType: 'FollowUp',
      entityId: id,
      metadata: {
        outcome: data.outcome,
        stage: data.stage,
        nextAction: data.next_action,
        nextFollowUpScheduled: !!nextFollowUp,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Follow-up marked as completed.',
      data: {
        completed_follow_up: completed,
        next_follow_up: nextFollowUp,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { scheduled_date, scheduled_time, reason, purpose, type, notes, status, assigned_to } = req.body;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        scheduled_date: scheduled_date ? new Date(scheduled_date) : undefined,
        scheduled_time: scheduled_time ?? undefined,
        purpose: purpose ?? undefined,
        type: type ? (type as FollowUpType) : undefined,
        reason: reason ?? undefined,
        notes: notes ?? undefined,
        status: status ?? undefined,
        assigned_to: assigned_to !== undefined ? (assigned_to as string | null) : undefined,
      },
    });

    if (updated.lead_id) {
      await syncLeadNextFollowUp(updated.lead_id);
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
