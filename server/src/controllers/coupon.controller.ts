import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const { code, amount } = req.body;
  if (!code) {
    res.status(400).json({ success: false, message: 'Coupon code required' });
    return;
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) {
    res.status(404).json({ success: false, message: 'Invalid coupon code' });
    return;
  }
  if (!coupon.isActive) {
    res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    return;
  }
  if (coupon.validUntil < new Date()) {
    res.status(400).json({ success: false, message: 'This coupon has expired' });
    return;
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    return;
  }
  if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
    res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    return;
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    success: true,
    message: `Coupon applied! You saved ₹${discount.toFixed(0)} 🎉`,
    data: {
      code: coupon.code,
      discount: Math.round(discount),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      finalAmount: Math.max(0, amount - discount),
    },
  });
};
