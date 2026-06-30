import { Router } from 'express';
import * as blog from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth';
import { blogUpload } from '../middleware/upload';

const router = Router();

router.get('/', blog.getBlogs);
router.get('/recent', blog.getRecentBlogs);
router.get('/categories', blog.getBlogCategories);
router.get('/:slug', blog.getBlogBySlug);
router.post('/:id/comment', blog.addComment);

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), blogUpload, blog.createBlog);
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), blogUpload, blog.updateBlog);
router.delete('/:id', authenticate, authorize('ADMIN'), blog.deleteBlog);
router.post('/:id/publish', authenticate, authorize('ADMIN'), blog.publishBlog);
router.post('/:id/comments/:commentId/approve', authenticate, authorize('ADMIN'), blog.approveComment);

export default router;
