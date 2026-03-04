import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/messages/:otherUserId — Get messages between two users
router.get('/:otherUserId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { otherUserId } = req.params;
        const { page = '1', limit = '50' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: { senderId: otherUserId, receiverId: userId, read: false },
            data: { read: true },
        });

        res.json({ success: true, data: messages.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /api/messages — Get conversations list
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get unique conversation partners
        const sent = await prisma.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true },
            distinct: ['receiverId'],
        });
        const received = await prisma.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true },
            distinct: ['senderId'],
        });

        const partnerIds = [...new Set([
            ...sent.map((m) => m.receiverId),
            ...received.map((m) => m.senderId),
        ])];

        const conversations = await Promise.all(
            partnerIds.map(async (partnerId) => {
                const partner = await prisma.user.findUnique({
                    where: { id: partnerId },
                    select: { id: true, name: true, avatar: true, role: true },
                });

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: partnerId },
                            { senderId: partnerId, receiverId: userId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });

                const unreadCount = await prisma.message.count({
                    where: { senderId: partnerId, receiverId: userId, read: false },
                });

                return { partner, lastMessage, unreadCount };
            })
        );

        conversations.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt.getTime() ?? 0;
            const bTime = b.lastMessage?.createdAt.getTime() ?? 0;
            return bTime - aTime;
        });

        res.json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/messages — Send a message
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, content } = req.body;

        const message = await prisma.message.create({
            data: {
                senderId: req.user!.id,
                receiverId,
                content,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: 'NEW_MESSAGE',
                title: 'New Message',
                content: `${req.user!.name} sent you a message`,
            },
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
