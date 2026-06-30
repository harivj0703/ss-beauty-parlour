import { Router } from 'express';
import * as contact from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, contact.getWishlist);
router.post('/', authenticate, contact.addToWishlist);
router.delete('/clear', authenticate, contact.clearWishlist);
router.delete('/:id', authenticate, contact.removeFromWishlist);

export default router;
