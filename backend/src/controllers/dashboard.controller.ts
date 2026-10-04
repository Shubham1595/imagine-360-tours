import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAdminDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCustomers,
      totalLeads,
      coldLeads,
      warmLeads,
      hotLeads,
      todayFollowUps,
      overdueFollowUps,
      newEnquiries,
      activeProjects,
      // Dedicated HOT Pipeline Analytics
      activeHotLeads,
      projectDiscussionToday,
      quotationPending,
      negotiation,
      verbalCommitment,
      hotOverdueFollowUps,
      servicesTotal,
      servicesAvailable,
      servicesUnavailable,
      servicesHidden,
      featuredServices,
      publicProjects,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { classification: 'COLD' } }),
      prisma.lead.count({ where: { classification: 'WARM' } }),
      prisma.lead.count({ where: { classification: 'HOT' } }),
      prisma.followUp.count({ where: { scheduled_date: { gte: today, lt: tomorrow }, status: 'PENDING' } }),
      prisma.followUp.count({ where: { scheduled_date: { lt: today }, status: 'PENDING' } }),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.project.count({ where: { status: { in: ['PLANNING', 'CAPTURE', 'PROCESSING', 'IN_REVIEW'] } } }),
      // HOT breakdown:
      prisma.lead.count({ where: { classification: 'HOT', stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
      prisma.followUp.count({
        where: {
          type: 'PROJECT_DISCUSSION',
          scheduled_date: { gte: today, lt: tomorrow },
          status: 'PENDING',
        },
      }),
      prisma.lead.count({ where: { classification: 'HOT', stage: 'QUOTATION_SENT' } }),
      prisma.lead.count({ where: { classification: 'HOT', stage: 'NEGOTIATION' } }),
      prisma.lead.count({ where: { classification: 'HOT', stage: 'VERBAL_COMMITMENT' } }),
      prisma.followUp.count({
        where: {
          lead: { classification: 'HOT' },
          scheduled_date: { lt: today },
          status: 'PENDING',
        },
      }),
      // Live Website CMS Status metrics
      prisma.service.count({ where: { status: { not: 'ARCHIVED' } } }),
      prisma.service.count({ where: { is_active: true, is_visible: true, status: { not: 'ARCHIVED' } } }),
      prisma.service.count({ where: { is_active: false, is_visible: true, status: { not: 'ARCHIVED' } } }),
      prisma.service.count({ where: { is_visible: false, status: { not: 'ARCHIVED' } } }),
      prisma.service.count({ where: { is_featured: true, status: { not: 'ARCHIVED' } } }),
      prisma.project.count({ where: { is_public: true } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalLeads,
        coldLeads,
        warmLeads,
        hotLeads,
        todayFollowUps,
        overdueFollowUps,
        newEnquiries,
        activeProjects,
        hotOpportunities: {
          activeHotLeads,
          projectDiscussionToday,
          quotationPending,
          negotiation,
          verbalCommitment,
          overdueFollowUps: hotOverdueFollowUps,
        },
        websiteStatus: {
          servicesTotal,
          servicesAvailable,
          servicesUnavailable,
          servicesHidden,
          featuredServices,
          publicProjects,
          pendingEnquiries: newEnquiries,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Lead Status & Classification Distribution
    const [cold, warm, hot] = await Promise.all([
      prisma.lead.count({ where: { classification: 'COLD' } }),
      prisma.lead.count({ where: { classification: 'WARM' } }),
      prisma.lead.count({ where: { classification: 'HOT' } }),
    ]);

    const statusDistribution = [
      { status: 'COLD', count: cold },
      { status: 'WARM', count: warm },
      { status: 'HOT', count: hot },
    ];

    // 2. Sales Stages Breakdown
    const stageCountsRaw = await prisma.lead.groupBy({
      by: ['stage'],
      _count: { stage: true },
    });

    const stageBreakdown = stageCountsRaw.map(s => ({
      stage: s.stage,
      count: s._count.stage,
    }));

    // 3. Leads by Service
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { leads: true } },
      },
    });

    const leadsByService = services.map(s => ({
      serviceName: s.name,
      count: s._count.leads,
    })).filter(s => s.count > 0);

    // 4. Leads by Source
    const allLeads = await prisma.lead.findMany({
      select: { source: true },
    });
    const sourceMap: Record<string, number> = {};
    for (const lead of allLeads) {
      const src = lead.source || 'Website';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    }
    const leadsBySource = Object.entries(sourceMap).map(([source, count]) => ({
      source,
      count,
    }));

    // 5. Calls Per Day (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const calls = await prisma.callLog.findMany({
      where: { created_at: { gte: sevenDaysAgo } },
      select: { created_at: true },
    });
    const callsMap: Record<string, number> = {};
    calls.forEach(c => {
      const dateStr = c.created_at.toISOString().split('T')[0];
      callsMap[dateStr] = (callsMap[dateStr] || 0) + 1;
    });
    const callsPerDay = Object.entries(callsMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 6. Follow-Up Completion
    const [completedFollowUps, pendingFollowUps, overdueFollowUps] = await Promise.all([
      prisma.followUp.count({ where: { status: 'COMPLETED' } }),
      prisma.followUp.count({ where: { status: 'PENDING' } }),
      prisma.followUp.count({ where: { status: 'OVERDUE' } }),
    ]);

    // 7. Lead to Project Conversion
    const totalLeadsCount = allLeads.length;
    const totalProjectsCount = await prisma.project.count();
    const conversionPercentage = totalLeadsCount > 0
      ? Math.round((totalProjectsCount / totalLeadsCount) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        statusDistribution,
        stageBreakdown,
        leadsByService,
        leadsBySource,
        callsPerDay,
        followUpCompletionRate: {
          completed: completedFollowUps,
          pending: pendingFollowUps,
          overdue: overdueFollowUps,
        },
        conversionRates: {
          totalLeads: totalLeadsCount,
          hotLeads: hot,
          totalProjects: totalProjectsCount,
          conversionPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
