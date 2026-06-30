import { Request, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { generateInvoiceNumber } from '../utils/invoice';

const prisma = new PrismaClient();

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe key not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as Stripe.LatestApiVersion });
};

const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
};

// ── Stripe ───────────────────────────────────────────────────────────

export const createStripePaymentIntent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId } = req.body;
  const payment = await prisma.payment.findUnique({
    where: { appointmentId },
    include: { appointment: true },
  });

  if (!payment) {
    res.status(404).json({ success: false, message: 'Payment record not found' });
    return;
  }
  if (payment.userId !== req.user!.userId) {
    res.status(403).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(payment.amount * 100), // in paise
    currency: 'inr',
    metadata: { appointmentId, userId: req.user!.userId },
  });

  await prisma.payment.update({
    where: { appointmentId },
    data: { stripePaymentId: intent.id },
  });

  res.json({
    success: true,
    message: 'Payment intent created',
    data: { clientSecret: intent.client_secret, paymentIntentId: intent.id },
  });
};

export const confirmStripePayment = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { appointmentId } = intent.metadata;

    await prisma.$transaction([
      prisma.payment.update({
        where: { appointmentId },
        data: { status: 'PAID', paidAt: new Date(), transactionId: intent.id },
      }),
      prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' } }),
    ]);
  }

  res.json({ received: true });
};

// ── Razorpay ─────────────────────────────────────────────────────────

export const createRazorpayOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId } = req.body;
  const payment = await prisma.payment.findUnique({ where: { appointmentId } });

  if (!payment) {
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }

  const razorpay = await getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(payment.amount * 100),
    currency: 'INR',
    notes: { appointmentId },
  });

  await prisma.payment.update({
    where: { appointmentId },
    data: { razorpayOrderId: order.id, method: 'RAZORPAY' },
  });

  res.json({
    success: true,
    message: 'Razorpay order created',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
};

export const verifyRazorpayPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { appointmentId },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
      },
    }),
    prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'CONFIRMED' } }),
  ]);

  res.json({ success: true, message: 'Payment verified successfully! 🎉' });
};

// ── Payment History ───────────────────────────────────────────────────

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '10');

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: { userId: req.user!.userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            items: { include: { service: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.payment.count({ where: { userId: req.user!.userId } }),
  ]);

  res.json({
    success: true,
    message: 'Payment history',
    data: payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        appointment: { select: { scheduledAt: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    success: true,
    message: 'All payments',
    data: payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getRevenueStats = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) };
  }).reverse();

  const revenueData = await Promise.all(
    months.map(async ({ year, month, label }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const result = await prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      });
      return { label, revenue: result._sum.amount || 0, count: result._count };
    })
  );

  res.json({ success: true, message: 'Revenue stats', data: revenueData });
};

export const requestRefund = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { appointmentId, reason } = req.body;
  const payment = await prisma.payment.findUnique({ where: { appointmentId } });

  if (!payment || payment.userId !== req.user!.userId) {
    res.status(404).json({ success: false, message: 'Payment not found' });
    return;
  }
  if (payment.status !== 'PAID') {
    res.status(400).json({ success: false, message: 'Only paid payments can be refunded' });
    return;
  }

  // Mark for refund (actual Stripe/Razorpay refund would go here)
  await prisma.payment.update({
    where: { appointmentId },
    data: { status: 'REFUNDED', refundAmount: payment.amount },
  });

  res.json({ success: true, message: 'Refund initiated. It will appear in 5-7 business days.' });
};
