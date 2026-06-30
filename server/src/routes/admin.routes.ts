import { Router } from 'express';
import * as admin from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { singleUpload, profileUpload } from '../middleware/upload';

const router = Router();
const adminAuth = [authenticate, authorize('ADMIN')];

router.get('/stats', ...adminAuth, admin.getDashboardStats);
router.get('/revenue-chart', ...adminAuth, admin.getRevenueChart);
router.get('/booking-chart', ...adminAuth, admin.getBookingChart);
router.get('/analytics', ...adminAuth, admin.getAnalytics);

router.get('/users', ...adminAuth, admin.getAllUsers);
router.patch('/users/:id/status', ...adminAuth, admin.updateUserStatus);

router.get('/staff', ...adminAuth, admin.getAllStaff);
router.post('/staff', ...adminAuth, profileUpload, admin.createStaff);
router.put('/staff/:id', ...adminAuth, admin.updateStaff);

router.get('/packages', ...adminAuth, admin.getAllPackages);
router.post('/packages', ...adminAuth, singleUpload, admin.createPackage);
router.put('/packages/:id', ...adminAuth, singleUpload, admin.updatePackage);
router.delete('/packages/:id', ...adminAuth, admin.deletePackage);

router.get('/reviews', ...adminAuth, admin.getAllReviews);
router.patch('/reviews/:id/approve', ...adminAuth, admin.approveReview);

router.get('/coupons', ...adminAuth, admin.getCoupons);
router.post('/coupons', ...adminAuth, admin.createCoupon);
router.put('/coupons/:id', ...adminAuth, admin.updateCoupon);
router.delete('/coupons/:id', ...adminAuth, admin.deleteCoupon);

router.get('/settings', ...adminAuth, admin.getSettings);
router.put('/settings', ...adminAuth, admin.updateSettings);

router.get('/contact-messages', ...adminAuth, admin.getContactMessages);
router.patch('/contact-messages/:id/read', ...adminAuth, admin.markMessageRead);

export default router;
