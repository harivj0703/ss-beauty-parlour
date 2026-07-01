import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, ServiceFilters } from '../types';
import { uploadBuffer } from '../utils/cloudinary';

const prisma = new PrismaClient();

const buildPagination = (page: number, limit: number, total: number) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

// ── Categories ───────────────────────────────────────────────────────

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { services: true } } },
  });
  res.json({ success: true, message: 'Categories fetched', data: categories });
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  res.json({ success: true, message: 'Category fetched', data: category });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, icon } = req.body;
  let image: string | undefined;
  if (req.file) image = await uploadBuffer(req.file.buffer, 'glow-beauty/categories');

  const category = await prisma.category.create({
    data: { name, slug, description, icon, ...(image && { image }) },
  });
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let image: string | undefined;
  if (req.file) image = await uploadBuffer(req.file.buffer, 'glow-beauty/categories');

  const category = await prisma.category.update({
    where: { id },
    data: { ...req.body, ...(image && { image }) },
  });
  res.json({ success: true, message: 'Category updated', data: category });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Category deleted' });
};

// ── Services ─────────────────────────────────────────────────────────

export const getServices = async (req: Request, res: Response): Promise<void> => {
  const { category, search, minPrice, maxPrice, featured, popular, page = '1', limit = '12' } =
    req.query as ServiceFilters;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (featured === 'true') where.isFeatured = true;
  if (popular === 'true') where.isPopular = true;
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) }),
    };
  }

  const [services, total] = await prisma.$transaction([
    prisma.service.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.service.count({ where }),
  ]);

  res.json({
    success: true,
    message: 'Services fetched',
    data: services,
    pagination: buildPagination(pageNum, limitNum, total),
  });
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      },
    },
  });
  if (!service || !service.isActive) {
    res.status(404).json({ success: false, message: 'Service not found' });
    return;
  }
  res.json({ success: true, message: 'Service fetched', data: service });
};

export const getFeaturedServices = async (_req: Request, res: Response): Promise<void> => {
  const services = await prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { sortOrder: 'asc' },
    include: { category: { select: { name: true, slug: true } } },
  });
  res.json({ success: true, message: 'Featured services', data: services });
};

export const getPopularServices = async (_req: Request, res: Response): Promise<void> => {
  const services = await prisma.service.findMany({
    where: { isActive: true, isPopular: true },
    take: 6,
    orderBy: { totalBookings: 'desc' },
    include: { category: { select: { name: true, slug: true } } },
  });
  res.json({ success: true, message: 'Popular services', data: services });
};

export const getPackages = async (_req: Request, res: Response): Promise<void> => {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    include: { packageServices: { include: { service: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, message: 'Packages fetched', data: packages });
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  const { name, slug, categoryId, description, shortDesc, price, discountedPrice, duration, tags, isPopular, isFeatured } = req.body;
  let imageUrl: string | undefined;

  if (req.file) imageUrl = await uploadBuffer(req.file.buffer, 'glow-beauty/services');

  const service = await prisma.service.create({
    data: {
      name, slug, categoryId, description,
      shortDesc: shortDesc || null,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      duration: parseInt(duration),
      tags: tags ? JSON.parse(tags) : [],
      isPopular: isPopular === 'true',
      isFeatured: isFeatured === 'true',
      ...(imageUrl && { image: imageUrl }),
    },
  });
  res.status(201).json({ success: true, message: 'Service created', data: service });
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  let imageUrl: string | undefined;
  if (req.file) imageUrl = await uploadBuffer(req.file.buffer, 'glow-beauty/services');

  const data: Record<string, unknown> = { ...req.body };
  if (data.price) data.price = parseFloat(data.price as string);
  if (data.duration) data.duration = parseInt(data.duration as string);
  if (imageUrl) data.image = imageUrl;

  const service = await prisma.service.update({ where: { id }, data });
  res.json({ success: true, message: 'Service updated', data: service });
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true, message: 'Service deleted' });
};
