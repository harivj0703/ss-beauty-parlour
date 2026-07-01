import { Router } from 'express';
import * as service from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';
import { serviceUpload, singleUpload } from '../middleware/upload';

const router = Router();

// Public
router.get('/categories', service.getCategories);
router.get('/categories/:slug', service.getCategoryBySlug);
router.get('/', service.getServices);
router.get('/packages', service.getPackages);
router.get('/featured', service.getFeaturedServices);
router.get('/popular', service.getPopularServices);
router.get('/:slug', service.getServiceBySlug);

// Admin only
router.post('/categories', authenticate, authorize('ADMIN'), singleUpload, service.createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN'), singleUpload, service.updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN'), service.deleteCategory);
router.post('/', authenticate, authorize('ADMIN'), serviceUpload, service.createService);
router.put('/:id', authenticate, authorize('ADMIN'), serviceUpload, service.updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), service.deleteService);

export default router;
