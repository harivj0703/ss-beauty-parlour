import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadBuffer } from '../utils/cloudinary';

const prisma = new PrismaClient();

export const getGallery = async (req: Request, res: Response): Promise<void> => {
  const category = req.query.category as string | undefined;
  const type = req.query.type as string | undefined;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '12');

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (type) where.type = type;

  const [items, total] = await prisma.$transaction([
    prisma.galleryItem.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.galleryItem.count({ where }),
  ]);

  res.json({ success: true, message: 'Gallery fetched', data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getGalleryCategories = async (_req: Request, res: Response): Promise<void> => {
  const items = await prisma.galleryItem.findMany({
    where: { isActive: true, category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });
  res.json({ success: true, data: items.map((i) => i.category) });
};

export const addGalleryItem = async (req: Request, res: Response): Promise<void> => {
  let imageUrl = req.body.imageUrl;
  if (req.file) imageUrl = await uploadBuffer(req.file.buffer, 'glow-beauty/gallery');

  const item = await prisma.galleryItem.create({
    data: {
      title: req.body.title || null,
      description: req.body.description || null,
      imageUrl,
      category: req.body.category || null,
      type: req.body.type || 'image',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    },
  });
  res.status(201).json({ success: true, message: 'Gallery item added', data: item });
};

export const updateGalleryItem = async (req: Request, res: Response): Promise<void> => {
  const item = await prisma.galleryItem.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, message: 'Gallery item updated', data: item });
};

export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  await prisma.galleryItem.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Gallery item deleted' });
};
