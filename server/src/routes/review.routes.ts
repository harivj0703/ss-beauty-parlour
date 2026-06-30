import { Router } from 'express';
import * as review from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, review.createReview);
router.get('/my', authenticate, review.getMyReviews);
router.get('/service/:serviceId', review.getServiceReviews);
router.put('/:id/reply', authenticate, authorize('ADMIN'), review.replyToReview);
router.delete('/:id', authenticate, authorize('ADMIN'), review.deleteReview);

export default router;
