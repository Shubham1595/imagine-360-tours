import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logAudit } from '../utils/logger';
import { callLogSchema } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma, FollowUpType } from '@prisma/client';
import { syncLeadNextFollowUp } from '../utils/followupSync';

export async function logCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = callLogSchema.parse(req.body);
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: data.customer_id },
      include: { leads: { orderBy: { updated_at: 'desc' }, take: 1 } },
    });

    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found.' });
      return;
    }

    // Determine lead ID if not provided
    const targetLeadId = data.lead_id || customer.leads[0]?.id;

    // 1. Create Call Log Record
    const callLog = await prisma.callLog.create({
      data: {
        customer_id: customer.id,
        lead_id: targetLeadId || null,
        admin_id: adminId,
        duration: data.duration,
        outcome: data.outcome,
        notes: data.notes || (data.outcome === 'COLD' ? data.cold_reason : data.next_action) || null,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        admin: { select: { id: true, name: true } },
      },
    });

    // 2. Update Lead Classification & Stage independently
    if (targetLeadId) {
      const existingLead = await prisma.lead.findUnique({ where: { id: targetLeadId } });
      const previousClassification = existingLead?.classification;
      const previousStage = existingLead?.stage;

      const leadUpdate: Prisma.LeadUpdateInput = {
        classification: data.outcome,
        status: data.outcome,
        last_contact_at: new Date(),
      };
      if (data.stage) {
        leadUpdate.stage = data.stage;
      }
      if (data.notes) {
        leadUpdate.notes = `Call Logged [${new Date().toLocaleDateString()}]: ${data.notes}`;
      }
      if (data.estimated_project_value) {
        leadUpdate.estimated_deal_value = data.estimated_project_value;
      }

      await prisma.lead.update({
        where: { id: targetLeadId },
        data: leadUpdate,
      });

      // Separate audit log for classification change
      if (previousClassification && previousClassification !== data.outcome) {
        await logAudit({
          userId: adminId,
          action: 'LEAD_CLASSIFICATION_CHANGED',
          entityType: 'Lead',
          entityId: targetLeadId,
          metadata: {
            previousClassification,
            newClassification: data.outcome,
            source: 'CALL_LOG',
          },
        });
      }

      // Separate audit log for stage change
      if (data.stage && previousStage && previousStage !== data.stage) {
        await logAudit({
          userId: adminId,
          action: 'LEAD_STAGE_CHANGED',
          entityType: 'Lead',
          entityId: targetLeadId,
          metadata: {
            previousStage,
            newStage: data.stage,
            source: 'CALL_LOG',
          },
        });
      }
    }

    // 3. Create/Schedule Follow-Up if follow-up scheduled
    let followUp = null;
    if (data.follow_up_date && data.follow_up_time) {
      const followUpType: FollowUpType =
        (data.follow_up_type as FollowUpType) ||
        (data.outcome === 'HOT' ? 'PROJECT_DISCUSSION' : 'GENERAL_FOLLOW_UP');

      followUp = await prisma.followUp.create({
        data: {
          customer_id: customer.id,
          lead_id: targetLeadId || null,
          assigned_to: adminId,
          type: followUpType,
          purpose: data.follow_up_purpose || data.follow_up_reason || (data.outcome === 'HOT' ? 'Project Discussion' : 'Requirement Follow-up'),
          scheduled_date: new Date(data.follow_up_date),
          scheduled_time: data.follow_up_time,
          reason: data.follow_up_reason || 'Follow-up from call',
          notes: data.notes || null,
          expected_start_date: data.expected_start_date ? new Date(data.expected_start_date) : null,
          estimated_project_value: data.estimated_project_value ? Number(data.estimated_project_value) : null,
          next_action: data.next_action || null,
          status: 'PENDING',
        },
      });

      await logAudit({
        userId: adminId,
        action: 'FOLLOW_UP_CREATED',
        entityType: 'FollowUp',
        entityId: followUp.id,
        metadata: {
          customerId: customer.id,
          leadId: targetLeadId,
          type: followUpType,
          scheduledDate: data.follow_up_date,
          scheduledTime: data.follow_up_time,
          source: 'CALL_LOG',
        },
      });
    }

    // 4. Synchronize lead.next_follow_up_at with the earliest pending follow-up
    if (targetLeadId) {
      await syncLeadNextFollowUp(targetLeadId);
    }

    // 5. Update customer updated_at timestamp
    await prisma.customer.update({
      where: { id: customer.id },
      data: { updated_at: new Date() },
    });

    // 6. Create Call Audit Log
    await logAudit({
      userId: adminId,
      action: 'CALL_LOGGED',
      entityType: 'CallLog',
      entityId: callLog.id,
      metadata: {
        customerId: customer.id,
        outcome: data.outcome,
        stage: data.stage,
        nextAction: data.next_action,
        duration: data.duration,
        scheduledFollowUp: !!followUp,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Call logged successfully and lead status updated.',
      data: {
        call_log: callLog,
        follow_up: followUp,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerCalls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const calls = await prisma.callLog.findMany({
      where: { customer_id: id },
      orderBy: { created_at: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        lead: {
          select: {
            id: true,
            status: true,
            classification: true,
            stage: true,
            service_id: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllCalls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const calls = await prisma.callLog.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, company: true } },
        admin: { select: { id: true, name: true } },
        lead: { select: { id: true, classification: true, stage: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
}
