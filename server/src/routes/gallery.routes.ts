import { Router } from 'express';
import * as gallery from '../controllers/gallery.controller';
import { authenticate, authorize } from '../middleware/auth';
import { galleryUpload } from '../middleware/upload';

const router = Router();

router.get('/', gallery.getGallery);
router.get('/categories', gallery.getGalleryCategories);
router.post('/', authenticate, authorize('ADMIN'), galleryUpload, gallery.addGalleryItem);
router.put('/:id', authenticate, authorize('ADMIN'), gallery.updateGalleryItem);
router.delete('/:id', authenticate, authorize('ADMIN'), gallery.deleteGalleryItem);

export default router;
