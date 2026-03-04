import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/jobs — List jobs (with search/filter)
router.get('/', async (req, res: Response) => {
    try {
        const { search, workType, location, page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { active: true };
        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (workType) where.workType = workType;
        if (location) where.location = { contains: String(location), mode: 'insensitive' };

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: { company: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.job.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                items: jobs,
                total,
                page: Number(page),
                limit: Number(limit),
                hasMore: skip + jobs.length < total,
            },
        });
    } catch (error) {
        console.error('List jobs error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/jobs/feed — Swipeable job feed for candidates (excludes already-swiped)
router.get('/feed', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { limit = '10' } = req.query;

        const swipedJobIds = await prisma.swipe.findMany({
            where: { userId, targetType: 'JOB' },
            select: { targetId: true },
        });

        const excludeIds = swipedJobIds.map((s) => s.targetId);

        const jobs = await prisma.job.findMany({
            where: {
                active: true,
                id: { notIn: excludeIds },
            },
            include: { company: true },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
        });

        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error('Job feed error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res: Response) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: { company: true },
        });
        if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
        res.json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/jobs — Create job (recruiter only)
router.post('/', authenticate, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, companyId, skills, salaryMin, salaryMax, location, workType, experienceMin, experienceMax } = req.body;

        // Verify company belongs to recruiter
        const company = await prisma.company.findFirst({
            where: { id: companyId, recruiterId: req.user!.id },
        });
        if (!company) return res.status(403).json({ success: false, error: 'Not your company' });

        const job = await prisma.job.create({
            data: { title, description, companyId, skills, salaryMin, salaryMax, location, workType, experienceMin, experienceMax },
            include: { company: true },
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/jobs/:id
router.put('/:id', authenticate, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: { company: true },
        });
        if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
        if (job.company.recruiterId !== req.user!.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const updated = await prisma.job.update({
            where: { id: req.params.id },
            data: req.body,
            include: { company: true },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/jobs/:id
router.delete('/:id', authenticate, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: { company: true },
        });
        if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
        if (job.company.recruiterId !== req.user!.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await prisma.job.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
