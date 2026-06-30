import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId: req.user!.userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId: req.user!.userId } }),
    prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
  ]);

  res.json({
    success: true,
    message: 'Notifications',
    data: { notifications, unreadCount },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isRead: true },
  });
  res.json({ success: true, message: 'Notification marked as read' });
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true, message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await prisma.notification.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  res.json({ success: true, message: 'Notification deleted' });
};
