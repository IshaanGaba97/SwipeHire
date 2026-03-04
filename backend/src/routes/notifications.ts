import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: req.user!.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.notification.count({ where: { userId: req.user!.id } }),
            prisma.notification.count({ where: { userId: req.user!.id, read: false } }),
        ]);

        res.json({
            success: true,
            data: { items: notifications, total, unreadCount, page: Number(page), limit: Number(limit) },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.id, read: false },
            data: { read: true },
        });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
