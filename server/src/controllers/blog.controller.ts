import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { uploadBuffer } from '../utils/cloudinary';

const prisma = new PrismaClient();

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '9');
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const where: Record<string, unknown> = { isPublished: true };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [blogs, total] = await prisma.$transaction([
    prisma.blog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, category: true, tags: true, publishedAt: true, readTime: true, views: true },
    }),
    prisma.blog.count({ where }),
  ]);

  res.json({ success: true, message: 'Blogs fetched', data: blogs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  const blog = await prisma.blog.findUnique({
    where: { slug: req.params.slug },
    include: {
      comments: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!blog || !blog.isPublished) {
    res.status(404).json({ success: false, message: 'Blog not found' });
    return;
  }
  await prisma.blog.update({ where: { id: blog.id }, data: { views: { increment: 1 } } });
  res.json({ success: true, message: 'Blog fetched', data: blog });
};

export const getRecentBlogs = async (_req: Request, res: Response): Promise<void> => {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    take: 5,
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, coverImage: true, publishedAt: true, readTime: true },
  });
  res.json({ success: true, message: 'Recent blogs', data: blogs });
};

export const getBlogCategories = async (_req: Request, res: Response): Promise<void> => {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true, category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });
  const categories = blogs.map((b) => b.category).filter(Boolean);
  res.json({ success: true, message: 'Blog categories', data: categories });
};

export const createBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, slug, excerpt, content, category, tags, readTime } = req.body;
  let coverImage: string | undefined;
  if (req.file) coverImage = await uploadBuffer(req.file.buffer, 'glow-beauty/blogs');

  const blog = await prisma.blog.create({
    data: {
      title, slug, excerpt: excerpt || null, content,
      category: category || null,
      tags: tags ? JSON.parse(tags) : [],
      readTime: readTime ? parseInt(readTime) : null,
      authorId: req.user!.userId,
      ...(coverImage && { coverImage }),
    },
  });
  res.status(201).json({ success: true, message: 'Blog created', data: blog });
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  let coverImage: string | undefined;
  if (req.file) coverImage = await uploadBuffer(req.file.buffer, 'glow-beauty/blogs');

  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: { ...req.body, ...(coverImage && { coverImage }) },
  });
  res.json({ success: true, message: 'Blog updated', data: blog });
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  await prisma.blog.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Blog deleted' });
};

export const publishBlog = async (req: Request, res: Response): Promise<void> => {
  const blog = await prisma.blog.update({
    where: { id: req.params.id },
    data: { isPublished: true, publishedAt: new Date() },
  });
  res.json({ success: true, message: 'Blog published', data: blog });
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  const { name, email, comment } = req.body;
  const blogComment = await prisma.blogComment.create({
    data: { blogId: req.params.id, name, email, comment },
  });
  res.status(201).json({ success: true, message: 'Comment submitted for review', data: blogComment });
};

export const approveComment = async (req: Request, res: Response): Promise<void> => {
  const comment = await prisma.blogComment.update({
    where: { id: req.params.commentId },
    data: { isApproved: true },
  });
  res.json({ success: true, message: 'Comment approved', data: comment });
};
