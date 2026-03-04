import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { email, passwordHash, name, role },
            select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
        });

        // Create candidate profile if candidate
        if (role === 'CANDIDATE') {
            await prisma.candidateProfile.create({
                data: { userId: user.id },
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, email: true, name: true, role: true, avatar: true, createdAt: true,
                candidateProfile: true,
                company: true,
            },
        });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res: Response) => {
    try {
        const { googleId, email, name, avatar, role } = req.body;

        let user = await prisma.user.findUnique({ where: { googleId } });

        if (!user) {
            user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, avatar: avatar || user.avatar },
                });
            } else {
                user = await prisma.user.create({
                    data: { email, name, role: role || 'CANDIDATE', googleId, avatar },
                });
                if (user.role === 'CANDIDATE') {
                    await prisma.candidateProfile.create({ data: { userId: user.id } });
                }
            }
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id, email: user.email, name: user.name,
                    role: user.role, avatar: user.avatar, createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
