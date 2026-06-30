import { Router } from 'express';
import * as coupon from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/validate', coupon.validateCoupon);

export default router;
