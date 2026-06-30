import { Router, raw } from 'express';
import * as payment from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/stripe/create-intent', authenticate, payment.createStripePaymentIntent);
router.post('/stripe/webhook', raw({ type: 'application/json' }), payment.confirmStripePayment);
router.post('/razorpay/create-order', authenticate, payment.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, payment.verifyRazorpayPayment);
router.get('/my', authenticate, payment.getPaymentHistory);
router.get('/all', authenticate, authorize('ADMIN'), payment.getAllPayments);
router.get('/revenue-stats', authenticate, authorize('ADMIN'), payment.getRevenueStats);
router.post('/refund', authenticate, payment.requestRefund);

export default router;
