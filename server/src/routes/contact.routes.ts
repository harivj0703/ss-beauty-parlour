import { Router } from 'express';
import * as contact from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', contact.submitContact);
router.post('/newsletter', contact.subscribeNewsletter);

export default router;
