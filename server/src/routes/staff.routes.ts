import { Router } from 'express';
import * as staff from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', staff.getStaffList);
router.get('/me', authenticate, authorize('STAFF'), staff.getMyStaffProfile);
router.get('/me/appointments', authenticate, authorize('STAFF'), staff.getMyStaffAppointments);
router.get('/me/stats', authenticate, authorize('STAFF'), staff.getMyStats);
router.get('/me/leaves', authenticate, authorize('STAFF'), staff.getMyLeaves);
router.put('/me', authenticate, authorize('STAFF'), staff.updateMyStaffProfile);
router.put('/me/availability', authenticate, authorize('STAFF'), staff.updateAvailability);
router.post('/me/leave', authenticate, authorize('STAFF'), staff.applyLeave);
router.post('/appointments/:id/complete', authenticate, authorize('STAFF', 'ADMIN'), staff.completeAppointment);
router.get('/:id', staff.getStaffById);

export default router;
