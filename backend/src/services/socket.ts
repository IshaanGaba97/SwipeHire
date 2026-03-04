import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export function setupSocket(io: Server) {
    // Authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
            (socket as any).userId = decoded.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        console.log(`User connected: ${userId}`);

        // Join user's personal room for notifications
        socket.join(`user:${userId}`);

        // Chat: join conversation room
        socket.on('join:chat', (otherUserId: string) => {
            const room = [userId, otherUserId].sort().join(':');
            socket.join(`chat:${room}`);
        });

        // Chat: send message
        socket.on('send:message', (data: { receiverId: string; content: string }) => {
            const room = [userId, data.receiverId].sort().join(':');
            io.to(`chat:${room}`).emit('new:message', {
                senderId: userId,
                receiverId: data.receiverId,
                content: data.content,
                createdAt: new Date().toISOString(),
            });

            // Also send notification to receiver
            io.to(`user:${data.receiverId}`).emit('notification', {
                type: 'NEW_MESSAGE',
                title: 'New Message',
                content: data.content,
            });
        });

        // Typing indicator
        socket.on('typing:start', (otherUserId: string) => {
            const room = [userId, otherUserId].sort().join(':');
            socket.to(`chat:${room}`).emit('typing:start', { userId });
        });

        socket.on('typing:stop', (otherUserId: string) => {
            const room = [userId, otherUserId].sort().join(':');
            socket.to(`chat:${room}`).emit('typing:stop', { userId });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
}

// Helper to send notification via socket
export function sendNotification(io: Server, userId: string, notification: any) {
    io.to(`user:${userId}`).emit('notification', notification);
}
