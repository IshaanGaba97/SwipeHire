import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// File upload config
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, '../../uploads'),
    filename: (_req, file, cb) => {
        cb(null, `${uuid()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/candidates/profile — Get own profile
router.get('/profile', authenticate, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
    try {
        const profile = await prisma.candidateProfile.findUnique({
            where: { userId: req.user!.id },
            include: { user: { select: { id: true, email: true, name: true, avatar: true } } },
        });
        if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/candidates/profile — Update profile
router.put('/profile', authenticate, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
    try {
        const { headline, summary, skills, experience, education, portfolioUrl, githubUrl, linkedinUrl, locationPreference, salaryExpectation } = req.body;

        const profile = await prisma.candidateProfile.update({
            where: { userId: req.user!.id },
            data: {
                headline, summary, skills, experience, education,
                portfolioUrl, githubUrl, linkedinUrl, locationPreference, salaryExpectation,
            },
        });

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/candidates/resume — Upload resume
router.post('/resume', authenticate, requireRole('CANDIDATE'), upload.single('resume'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

        const resumeUrl = `/uploads/${req.file.filename}`;

        const profile = await prisma.candidateProfile.update({
            where: { userId: req.user!.id },
            data: { resumeUrl },
        });

        res.json({ success: true, data: { resumeUrl: profile.resumeUrl } });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/candidates/feed/:jobId — Candidate feed for recruiters
router.get('/feed/:jobId', authenticate, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { limit = '10' } = req.query;

        // Get candidates who applied to this job
        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                candidate: {
                    include: {
                        user: { select: { id: true, name: true, email: true, avatar: true } },
                    },
                },
            },
            take: Number(limit),
        });

        const candidates = applications.map((app) => ({
            ...app.candidate,
            applicationId: app.id,
            applicationStatus: app.status,
        }));

        res.json({ success: true, data: candidates });
    } catch (error) {
        console.error('Candidate feed error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/candidates/:id — Get candidate profile (for recruiters)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const profile = await prisma.candidateProfile.findUnique({
            where: { id: req.params.id },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
        if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
