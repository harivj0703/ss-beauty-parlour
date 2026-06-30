import { Router } from 'express';
import * as appt from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/slots', appt.getAvailableSlots);
router.post('/', authenticate, appt.createAppointment);
router.get('/my', authenticate, appt.getMyAppointments);
router.get('/today', authenticate, authorize('STAFF', 'ADMIN'), appt.getTodayAppointments);
router.get('/all', authenticate, authorize('ADMIN'), appt.getAllAppointments);
router.get('/:id', authenticate, appt.getAppointmentById);
router.post('/:id/cancel', authenticate, appt.cancelAppointment);
router.put('/:id/reschedule', authenticate, appt.rescheduleAppointment);
router.put('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), appt.updateAppointmentStatus);

export default router;
