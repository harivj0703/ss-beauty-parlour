import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { uploadBuffer } from '../utils/cloudinary';

const prisma = new PrismaClient();

// ── Dashboard Stats ──────────────────────────────────────────────────
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const [totalUsers, totalStaff, totalAppointments, pendingBookings, todayBookings, completedToday, revenueResult] =
    await prisma.$transaction([
      prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      prisma.user.count({ where: { role: 'STAFF', isActive: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfToday, lte: endOfToday } } }),
      prisma.appointment.count({ where: { status: 'COMPLETED', scheduledAt: { gte: startOfToday, lte: endOfToday } } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    ]);

  res.json({
    success: true,
    message: 'Dashboard stats',
    data: {
      totalUsers,
      totalStaff,
      totalAppointments,
      totalRevenue: revenueResult._sum.amount || 0,
      pendingBookings,
      todayBookings,
      completedToday,
    },
  });
};

export const getRevenueChart = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) };
  });

  const data = await Promise.all(
    months.map(async ({ year, month, label }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const result = await prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      return { month: label, revenue: result._sum.amount || 0 };
    })
  );
  res.json({ success: true, message: 'Revenue chart data', data });
};

export const getBookingChart = async (_req: Request, res: Response): Promise<void> => {
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const data = await Promise.all(
    last30.map(async (date) => {
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await prisma.appointment.count({ where: { createdAt: { gte: start, lte: end } } });
      return { date: start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), bookings: count };
    })
  );
  res.json({ success: true, message: 'Booking chart data', data });
};

// ── Users ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, role: true, isActive: true, createdAt: true,
        _count: { select: { appointments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, message: 'Users fetched', data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive } = req.body;
  const user = await prisma.user.update({ where: { id }, data: { isActive }, select: { id: true, isActive: true } });
  res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: user });
};

// ── Staff ─────────────────────────────────────────────────────────────
export const getAllStaff = async (_req: Request, res: Response): Promise<void> => {
  const staff = await prisma.staffProfile.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
      services: { include: { service: { select: { name: true } } } },
      _count: { select: { appointments: true } },
    },
  });
  res.json({ success: true, message: 'Staff fetched', data: staff });
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  const { email, firstName, lastName, phone, bio, specializations, experience, password } = req.body;
  let avatar: string | undefined;
  if (req.file) avatar = await uploadBuffer(req.file.buffer, 'glow-beauty/staff');

  const hashedPass = await bcrypt.hash(password || 'Staff@123', 12);

  const user = await prisma.user.create({
    data: {
      email, firstName, lastName, phone, role: 'STAFF',
      password: hashedPass,
      ...(avatar && { avatar }),
      staffProfile: {
        create: {
          bio: bio || null,
          specializations: specializations ? JSON.parse(specializations) : [],
          experience: parseInt(experience) || 0,
          workingHours: { start: '09:00', end: '20:00' },
        },
      },
    },
    include: { staffProfile: true },
  });

  res.status(201).json({ success: true, message: 'Staff member created', data: user });
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { bio, specializations, experience, isAvailable } = req.body;

  const staff = await prisma.staffProfile.update({
    where: { id },
    data: {
      ...(bio !== undefined && { bio }),
      ...(specializations && { specializations: JSON.parse(specializations) }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
      ...(isAvailable !== undefined && { isAvailable }),
    },
    include: { user: true },
  });
  res.json({ success: true, message: 'Staff updated', data: staff });
};

// ── Packages ──────────────────────────────────────────────────────────
export const getAllPackages = async (_req: Request, res: Response): Promise<void> => {
  const packages = await prisma.package.findMany({
    include: { packageServices: { include: { service: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, message: 'Packages fetched', data: packages });
};

export const createPackage = async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, shortDesc, originalPrice, discountedPrice, duration, serviceIds, validityDays, isFeatured, isPopular } = req.body;
  let image: string | undefined;
  if (req.file) image = await uploadBuffer(req.file.buffer, 'glow-beauty/packages');

  const pkg = await prisma.package.create({
    data: {
      name, slug, description,
      shortDesc: shortDesc || null,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: parseFloat(discountedPrice),
      duration: parseInt(duration),
      validityDays: parseInt(validityDays) || 30,
      isFeatured: isFeatured === 'true',
      isPopular: isPopular === 'true',
      ...(image && { image }),
      packageServices: {
        create: (JSON.parse(serviceIds || '[]') as string[]).map((sid: string) => ({ serviceId: sid })),
      },
    },
    include: { packageServices: { include: { service: true } } },
  });
  res.status(201).json({ success: true, message: 'Package created', data: pkg });
};

export const updatePackage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { serviceIds, ...rest } = req.body;
  let image: string | undefined;
  if (req.file) image = await uploadBuffer(req.file.buffer, 'glow-beauty/packages');

  const pkg = await prisma.package.update({
    where: { id },
    data: { ...rest, ...(image && { image }) },
    include: { packageServices: { include: { service: true } } },
  });
  res.json({ success: true, message: 'Package updated', data: pkg });
};

export const deletePackage = async (req: Request, res: Response): Promise<void> => {
  await prisma.package.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Package deleted' });
};

// ── Reviews ───────────────────────────────────────────────────────────
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const approved = req.query.approved;

  const where: Record<string, unknown> = {};
  if (approved !== undefined) where.isApproved = approved === 'true';

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  res.json({ success: true, message: 'Reviews fetched', data: reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const approveReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const review = await prisma.review.update({ where: { id }, data: { isApproved } });
  res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'rejected'}`, data: review });
};

// ── Coupons ───────────────────────────────────────────────────────────
export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, message: 'Coupons fetched', data: coupons });
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, message: 'Coupon updated', data: coupon });
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Coupon deleted' });
};

// ── Settings ──────────────────────────────────────────────────────────
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await prisma.setting.findMany({ orderBy: { group: 'asc' } });
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });
  res.json({ success: true, message: 'Settings fetched', data: settingsMap });
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Record<string, string>;
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  res.json({ success: true, message: 'Settings updated' });
};

// ── Analytics ─────────────────────────────────────────────────────────
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const [topServices, serviceStats, userGrowth] = await Promise.all([
    prisma.appointmentItem.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    }),
    prisma.service.aggregate({ _avg: { rating: true }, _sum: { totalBookings: true } }),
    prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const topServiceDetails = await prisma.service.findMany({
    where: { id: { in: topServices.map((ts) => ts.serviceId) } },
    select: { id: true, name: true, totalBookings: true, rating: true },
  });

  res.json({
    success: true,
    message: 'Analytics data',
    data: {
      topServices: topServiceDetails,
      averageRating: serviceStats._avg.rating || 0,
      totalBookings: serviceStats._sum.totalBookings || 0,
    },
  });
};

// ── Contact Messages ──────────────────────────────────────────────────
export const getContactMessages = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const [messages, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.contactMessage.count(),
  ]);
  res.json({ success: true, message: 'Messages fetched', data: messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
  await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json({ success: true, message: 'Message marked as read' });
};
