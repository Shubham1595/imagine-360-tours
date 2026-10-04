import { prisma } from '../config/db';

/**
 * Ensures lead.next_follow_up_at is strictly in sync with the earliest pending follow-up in the follow_ups table.
 * The follow_ups table is the single source of truth for follow-up schedules.
 */
export async function syncLeadNextFollowUp(leadId: string | null | undefined): Promise<void> {
  if (!leadId) return;

  try {
    const earliestPending = await prisma.followUp.findFirst({
      where: { lead_id: leadId, status: 'PENDING' },
      orderBy: [
        { scheduled_date: 'asc' },
        { scheduled_time: 'asc' },
      ],
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        next_follow_up_at: earliestPending ? earliestPending.scheduled_date : null,
      },
    });
  } catch (error) {
    console.error(`Error synchronizing next_follow_up_at for lead ${leadId}:`, error);
  }
}
