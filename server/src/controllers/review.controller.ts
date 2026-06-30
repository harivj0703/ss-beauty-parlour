import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId, serviceId, rating, title, comment } = req.body;

  if (rating < 1 || rating > 5) {
    res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    return;
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId: req.user!.userId, status: 'COMPLETED' },
  });
  if (!appointment) {
    res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    return;
  }

  const existing = await prisma.review.findUnique({ where: { appointmentId } });
  if (existing) {
    res.status(409).json({ success: false, message: 'You have already reviewed this appointment' });
    return;
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user!.userId,
      appointmentId,
      serviceId: serviceId || null,
      rating: parseInt(rating),
      title: title || null,
      comment,
      isVerified: true,
    },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });

  // Update service rating
  if (serviceId) {
    const stats = await prisma.review.aggregate({
      where: { serviceId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.service.update({
      where: { id: serviceId },
      data: { rating: stats._avg.rating || 0, totalReviews: stats._count },
    });
  }

  res.status(201).json({ success: true, message: 'Review submitted! Thank you 🌸', data: review });
};

export const getServiceReviews = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '10');

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { serviceId: req.params.serviceId, isApproved: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    }),
    prisma.review.count({ where: { serviceId: req.params.serviceId, isApproved: true } }),
  ]);

  res.json({
    success: true,
    message: 'Reviews fetched',
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getMyReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: { service: { select: { name: true, image: true } } },
  });
  res.json({ success: true, message: 'My reviews', data: reviews });
};

export const replyToReview = async (req: Request, res: Response): Promise<void> => {
  const { reply } = req.body;
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { reply, repliedAt: new Date() },
  });
  res.json({ success: true, message: 'Reply added', data: review });
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Review deleted' });
};
