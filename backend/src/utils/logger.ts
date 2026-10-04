import { prisma } from '../config/db';

export async function logAudit(params: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
}) {
  try {
    const metaString = params.metadata
      ? typeof params.metadata === 'string'
        ? params.metadata
        : JSON.stringify(params.metadata)
      : null;

    await prisma.auditLog.create({
      data: {
        user_id: params.userId || null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        metadata: metaString,
      },
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
