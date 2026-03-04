import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/swipes — Record a swipe
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { targetId, targetType, direction } = req.body;
        const userId = req.user!.id;

        // Upsert to handle re-swipes
        const swipe = await prisma.swipe.upsert({
            where: {
                userId_targetId_targetType: { userId, targetId, targetType },
            },
            update: { direction },
            create: { userId, targetId, targetType, direction },
        });

        // If candidate swiped right on a job, create an application
        if (targetType === 'JOB' && (direction === 'RIGHT' || direction === 'SUPER')) {
            const profile = await prisma.candidateProfile.findUnique({
                where: { userId },
            });

            if (profile) {
                await prisma.application.upsert({
                    where: {
                        jobId_candidateId: { jobId: targetId, candidateId: profile.id },
                    },
                    update: {},
                    create: {
                        jobId: targetId,
                        candidateId: profile.id,
                        status: 'APPLIED',
                    },
                });
            }
        }

        // If recruiter swiped right on a candidate, update application to shortlisted
        if (targetType === 'CANDIDATE' && direction === 'RIGHT') {
            // targetId is the candidateProfile id — find applications from this candidate
            // for recruiter's jobs and shortlist them
            const company = await prisma.company.findUnique({
                where: { recruiterId: userId },
            });
            if (company) {
                await prisma.application.updateMany({
                    where: {
                        candidateId: targetId,
                        job: { companyId: company.id },
                        status: 'APPLIED',
                    },
                    data: { status: 'SHORTLISTED' },
                });
            }
        }

        res.json({ success: true, data: swipe });
    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/swipes/history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const swipes = await prisma.swipe.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        });

        res.json({ success: true, data: swipes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
