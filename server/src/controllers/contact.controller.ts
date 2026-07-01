import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { sendAdminInquiryNotification } from '../utils/email';

const prisma = new PrismaClient();

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, message: 'Name, email, subject, and message are required' });
    return;
  }

  const contact = await prisma.contactMessage.create({ data: { name, email, phone, subject, message } });
  
  // Send email notification to Admin asynchronously
  const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';
  sendAdminInquiryNotification({
    customerName: name,
    customerEmail: email,
    customerPhone: phone || '',
    subject,
    message,
    submissionDate: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    ipAddress: ipAddress || undefined
  }).catch(console.error);

  res.status(201).json({ success: true, message: 'Message sent! We will get back to you soon 🌸', data: { id: contact.id } });
};

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true },
    create: { email },
  });

  res.json({ success: true, message: 'Subscribed successfully! 💕 Welcome to the Glow family.' });
};

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user!.userId },
    include: {
      service: { select: { id: true, name: true, slug: true, image: true, price: true, discountedPrice: true } },
      package: { select: { id: true, name: true, slug: true, image: true, discountedPrice: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, message: 'Wishlist', data: items });
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { serviceId, packageId } = req.body;

  const existing = await prisma.wishlist.findFirst({
    where: { userId: req.user!.userId, serviceId: serviceId || undefined, packageId: packageId || undefined },
  });
  if (existing) {
    res.status(409).json({ success: false, message: 'Already in wishlist' });
    return;
  }

  const item = await prisma.wishlist.create({
    data: { userId: req.user!.userId, serviceId: serviceId || null, packageId: packageId || null },
  });
  res.status(201).json({ success: true, message: 'Added to wishlist 💕', data: item });
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await prisma.wishlist.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  res.json({ success: true, message: 'Removed from wishlist' });
};

export const clearWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  await prisma.wishlist.deleteMany({ where: { userId: req.user!.userId } });
  res.json({ success: true, message: 'Wishlist cleared' });
};
