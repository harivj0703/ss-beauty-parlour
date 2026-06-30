import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { profileUpload } from '../middleware/upload';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/refresh-token', auth.refreshToken);
router.post('/forgot-password', auth.forgotPassword);
router.put('/reset-password', auth.resetPassword);
router.get('/profile', authenticate, auth.getProfile);
router.put('/profile', authenticate, profileUpload, auth.updateProfile);
router.put('/change-password', authenticate, auth.changePassword);

export default router;
