import { Router } from 'express';
import * as notif from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notif.getMyNotifications);
router.put('/read-all', authenticate, notif.markAllAsRead);
router.put('/:id/read', authenticate, notif.markAsRead);
router.delete('/:id', authenticate, notif.deleteNotification);

export default router;
