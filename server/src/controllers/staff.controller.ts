import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export const getStaffList = async (_req: Request, res: Response): Promise<void> => {
  const staff = await prisma.staffProfile.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
      services: { include: { service: { select: { name: true, slug: true } } } },
    },
    orderBy: { rating: 'desc' },
  });
  res.json({ success: true, message: 'Staff list', data: staff });
};

export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  const staff = await prisma.staffProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true, email: true } },
      services: { include: { service: true } },
      availability: true,
    },
  });
  if (!staff) {
    res.status(404).json({ success: false, message: 'Staff not found' });
    return;
  }
  res.json({ success: true, message: 'Staff profile', data: staff });
};

export const getMyStaffProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({
    where: { userId: req.user!.userId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
      services: { include: { service: true } },
      availability: true,
      leaves: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }
  res.json({ success: true, message: 'My profile', data: profile });
};

export const updateMyStaffProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { bio, specializations, experience } = req.body;
  const profile = await prisma.staffProfile.update({
    where: { userId: req.user!.userId },
    data: {
      ...(bio !== undefined && { bio }),
      ...(specializations && { specializations }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
    },
  });
  res.json({ success: true, message: 'Profile updated', data: profile });
};

export const getMyStaffAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }

  const type = (req.query.type as string) || 'upcoming';
  const now = new Date();

  const where: Record<string, unknown> = { staffProfileId: profile.id };
  if (type === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    where.scheduledAt = { gte: start, lte: end };
  } else if (type === 'upcoming') {
    where.scheduledAt = { gte: new Date() };
    where.status = { notIn: ['CANCELLED', 'COMPLETED'] };
  } else if (type === 'completed') {
    where.status = 'COMPLETED';
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true, avatar: true } },
      items: { include: { service: { select: { name: true, duration: true } } } },
    },
  });
  res.json({ success: true, message: 'Appointments', data: appointments });
};

export const updateAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }

  const slots: Array<{ dayOfWeek: number; startTime: string; endTime: string; isOff: boolean }> = req.body.slots;

  await prisma.availability.deleteMany({ where: { staffProfileId: profile.id } });
  await prisma.availability.createMany({
    data: slots.map((s) => ({ ...s, staffProfileId: profile.id })),
  });

  res.json({ success: true, message: 'Availability updated' });
};

export const applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }

  const { startDate, endDate, reason } = req.body;
  const leave = await prisma.leave.create({
    data: {
      staffProfileId: profile.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });
  res.status(201).json({ success: true, message: 'Leave applied', data: leave });
};

export const getMyLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }

  const leaves = await prisma.leave.findMany({
    where: { staffProfileId: profile.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, message: 'Leaves', data: leaves });
};

export const completeAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  const appointment = await prisma.appointment.findFirst({
    where: { id: req.params.id, staffProfileId: profile?.id },
  });
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }

  await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
  res.json({ success: true, message: 'Appointment marked as completed' });
};

export const getMyStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ success: false, message: 'Staff profile not found' });
    return;
  }

  const [totalAppointments, completedAppointments, cancelledAppointments] = await prisma.$transaction([
    prisma.appointment.count({ where: { staffProfileId: profile.id } }),
    prisma.appointment.count({ where: { staffProfileId: profile.id, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { staffProfileId: profile.id, status: 'CANCELLED' } }),
  ]);

  res.json({
    success: true,
    message: 'My stats',
    data: {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      rating: profile.rating,
      totalReviews: profile.totalReviews,
    },
  });
};
