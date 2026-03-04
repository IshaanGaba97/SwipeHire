import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { parseResume, generateMatchScore, generateInterviewQuestions, evaluateInterview } from '../services/ai/groq';

const router = Router();

// POST /api/ai/parse-resume
router.post('/parse-resume', authenticate, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ success: false, error: 'Resume text is required' });

        const result = await parseResume(resumeText);

        // Update candidate profile with extracted data
        await prisma.candidateProfile.update({
            where: { userId: req.user!.id },
            data: {
                skills: result.skills,
                aiSummary: result.summary,
                experience: result.experience as any,
                education: result.education as any,
            },
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Parse resume error:', error);
        res.status(500).json({ success: false, error: 'Failed to parse resume' });
    }
});

// POST /api/ai/match-score
router.post('/match-score', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, candidateId } = req.body;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        const candidate = await prisma.candidateProfile.findUnique({ where: { id: candidateId } });

        if (!job || !candidate) {
            return res.status(404).json({ success: false, error: 'Job or candidate not found' });
        }

        const score = await generateMatchScore(job, candidate);
        res.json({ success: true, data: { score } });
    } catch (error) {
        console.error('Match score error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate match score' });
    }
});

// POST /api/ai/interview/start
router.post('/interview/start', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.body;
        const userId = req.user!.id;

        const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
        if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

        const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
        if (!candidate) return res.status(404).json({ success: false, error: 'Candidate profile not found' });

        const questions = await generateInterviewQuestions(job, candidate);

        const interview = await prisma.interview.create({
            data: {
                jobId,
                candidateId: userId,
                questions: questions as any,
                status: 'IN_PROGRESS',
            },
        });

        res.json({ success: true, data: { interview, questions } });
    } catch (error) {
        console.error('Start interview error:', error);
        res.status(500).json({ success: false, error: 'Failed to start interview' });
    }
});

// POST /api/ai/interview/evaluate
router.post('/interview/evaluate', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { interviewId, answers } = req.body;

        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { job: true },
        });
        if (!interview) return res.status(404).json({ success: false, error: 'Interview not found' });

        const evaluation = await evaluateInterview(interview.questions as any, answers, interview.job);

        await prisma.interview.update({
            where: { id: interviewId },
            data: {
                questions: evaluation.evaluatedQuestions as any,
                overallScore: evaluation.overallScore,
                aiSummary: evaluation.summary,
                status: 'COMPLETED',
            },
        });

        res.json({ success: true, data: evaluation });
    } catch (error) {
        console.error('Evaluate interview error:', error);
        res.status(500).json({ success: false, error: 'Failed to evaluate interview' });
    }
});

// GET /api/ai/interviews — List interviews for user
router.get('/interviews', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const where: any = {};

        if (req.user!.role === 'CANDIDATE') {
            where.candidateId = req.user!.id;
        } else if (req.user!.role === 'RECRUITER') {
            const company = await prisma.company.findUnique({ where: { recruiterId: req.user!.id } });
            if (company) {
                where.job = { companyId: company.id };
            }
        }

        const interviews = await prisma.interview.findMany({
            where,
            include: {
                job: { include: { company: true } },
                candidate: { select: { id: true, name: true, email: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: interviews });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
