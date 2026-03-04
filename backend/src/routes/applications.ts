import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/applications — List applications (for candidate or recruiter)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};

        if (req.user!.role === 'CANDIDATE') {
            const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user!.id } });
            if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
            where.candidateId = profile.id;
        } else if (req.user!.role === 'RECRUITER') {
            const company = await prisma.company.findUnique({ where: { recruiterId: req.user!.id } });
            if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
            where.job = { companyId: company.id };
        }

        if (status) where.status = status;

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                include: {
                    job: { include: { company: true } },
                    candidate: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
                },
                orderBy: { appliedAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.application.count({ where }),
        ]);

        res.json({
            success: true,
            data: { items: applications, total, page: Number(page), limit: Number(limit), hasMore: skip + applications.length < total },
        });
    } catch (error) {
        console.error('List applications error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/applications/:id/status — Update status (recruiter)
router.put('/:id/status', authenticate, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;

        const application = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: { job: { include: { company: true } } },
        });

        if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
        if (application.job.company.recruiterId !== req.user!.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const updated = await prisma.application.update({
            where: { id: req.params.id },
            data: { status },
        });

        // Create notification for candidate
        const candidate = await prisma.candidateProfile.findUnique({
            where: { id: application.candidateId },
        });
        if (candidate) {
            await prisma.notification.create({
                data: {
                    userId: candidate.userId,
                    type: 'APPLICATION_UPDATE',
                    title: 'Application Update',
                    content: `Your application for ${application.job.title} has been ${status.toLowerCase().replace('_', ' ')}`,
                },
            });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
