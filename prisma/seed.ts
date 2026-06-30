import { PrismaClient, Role } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌸 Seeding Glow Beauty Studio database...');

  // ── Admin User ──────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@glowbeauty.com' },
    update: {},
    create: {
      email: 'admin@glowbeauty.com',
      password: adminPass,
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98765 43210',
      role: Role.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ── Categories ──────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'hair-care' },
      update: {},
      create: { name: 'Hair Care', slug: 'hair-care', description: 'Premium hair treatments and styling', icon: '💇', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'skin-care' },
      update: {},
      create: { name: 'Skin Care', slug: 'skin-care', description: 'Luxurious facial and skin treatments', icon: '✨', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'nail-care' },
      update: {},
      create: { name: 'Nail Care', slug: 'nail-care', description: 'Beautiful nail art and treatments', icon: '💅', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'makeup' },
      update: {},
      create: { name: 'Makeup', slug: 'makeup', description: 'Professional makeup for every occasion', icon: '💄', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'body-spa' },
      update: {},
      create: { name: 'Body Spa', slug: 'body-spa', description: 'Relaxing spa and wellness treatments', icon: '🌿', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'bridal' },
      update: {},
      create: { name: 'Bridal', slug: 'bridal', description: 'Complete bridal beauty packages', icon: '👰', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', sortOrder: 6 },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  const [hairCat, skinCat, nailCat, makeupCat, spaCat, bridalCat] = categories;

  // ── Services ─────────────────────────────────────────────────────────
  const serviceData = [
    { categoryId: hairCat.id, name: 'Haircut & Styling', slug: 'haircut-styling', description: 'Expert haircut tailored to your face shape with professional blow-dry and styling.', shortDesc: 'Professional cut & style', image: 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=600', price: 500, duration: 45, isPopular: true, isFeatured: true, tags: ['hair', 'cut', 'style'] },
    { categoryId: hairCat.id, name: 'Hair Spa Treatment', slug: 'hair-spa', description: 'Deep conditioning hair spa with hot oil massage to restore shine and softness.', shortDesc: 'Deep conditioning treatment', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', price: 1500, duration: 90, isPopular: true, tags: ['hair', 'spa', 'treatment'] },
    { categoryId: hairCat.id, name: 'Hair Coloring', slug: 'hair-coloring', description: 'Professional hair coloring with premium quality colors. Includes consultation and aftercare tips.', shortDesc: 'Premium hair color', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600', price: 2500, duration: 180, isFeatured: true, tags: ['color', 'hair'] },
    { categoryId: hairCat.id, name: 'Keratin Treatment', slug: 'keratin-treatment', description: 'Brazilian keratin smoothing treatment for frizz-free, silky smooth hair for 3-6 months.', shortDesc: 'Frizz-free smoothing', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600', price: 4000, duration: 240, isFeatured: true, tags: ['keratin', 'smoothing'] },
    { categoryId: hairCat.id, name: 'Hair Straightening', slug: 'hair-straightening', description: 'Permanent hair straightening treatment for permanently straight, manageable hair.', shortDesc: 'Permanent straightening', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600', price: 3000, duration: 180, tags: ['straightening', 'hair'] },
    { categoryId: skinCat.id, name: 'Classic Facial', slug: 'classic-facial', description: 'Deep cleansing facial with exfoliation, massage, mask, and moisturizer for glowing skin.', shortDesc: 'Deep cleansing glow', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', price: 1200, duration: 60, isPopular: true, isFeatured: true, tags: ['facial', 'skin', 'glow'] },
    { categoryId: skinCat.id, name: 'Cleanup & Glow', slug: 'cleanup-glow', description: 'Quick cleanup treatment to remove dead skin cells and reveal fresh, glowing skin.', shortDesc: 'Instant skin refresh', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600', price: 800, duration: 45, isPopular: true, tags: ['cleanup', 'glow'] },
    { categoryId: skinCat.id, name: 'Skin Brightening Facial', slug: 'skin-brightening', description: 'Advanced brightening treatment with Vitamin C serum and brightening mask for radiant skin.', shortDesc: 'Vitamin C brightening', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600', price: 1800, duration: 75, isFeatured: true, tags: ['brightening', 'vitamin-c'] },
    { categoryId: skinCat.id, name: 'Anti-Aging Facial', slug: 'anti-aging-facial', description: 'Luxurious anti-aging treatment with peptide serum, collagen mask, and facial massage.', shortDesc: 'Age-defying luxury', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=600', price: 2500, duration: 90, tags: ['anti-aging', 'collagen'] },
    { categoryId: nailCat.id, name: 'Classic Manicure', slug: 'classic-manicure', description: 'Complete manicure with nail shaping, cuticle care, hand massage, and nail polish application.', shortDesc: 'Perfect nail care', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600', price: 600, duration: 45, isPopular: true, tags: ['manicure', 'nails'] },
    { categoryId: nailCat.id, name: 'Luxury Pedicure', slug: 'luxury-pedicure', description: 'Relaxing pedicure with foot soak, scrub, mask, massage, and nail polish.', shortDesc: 'Relaxing foot treatment', image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600', price: 800, duration: 60, isPopular: true, tags: ['pedicure', 'foot-care'] },
    { categoryId: nailCat.id, name: 'Nail Art Design', slug: 'nail-art', description: 'Creative and intricate nail art designs by our expert nail artists.', shortDesc: 'Creative nail designs', image: 'https://images.unsplash.com/photo-1604654894761-dc5e4f96e70a?w=600', price: 500, duration: 30, tags: ['nail-art', 'design'] },
    { categoryId: nailCat.id, name: 'Gel Nails', slug: 'gel-nails', description: 'Long-lasting gel nail application for beautiful, chip-free nails for up to 3 weeks.', shortDesc: 'Long-lasting gel finish', image: 'https://images.unsplash.com/photo-1604654894537-de52c7d63bc7?w=600', price: 1200, duration: 90, tags: ['gel', 'nails'] },
    { categoryId: makeupCat.id, name: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Stunning bridal makeup with HD techniques, airbrush finish, and long-lasting formula for your special day.', shortDesc: 'Perfect bridal look', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600', price: 15000, duration: 240, isPopular: true, isFeatured: true, tags: ['bridal', 'makeup', 'wedding'] },
    { categoryId: makeupCat.id, name: 'Party Makeup', slug: 'party-makeup', description: 'Glamorous party makeup with stunning eyes and long-lasting lipstick for any celebration.', shortDesc: 'Party glam look', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600', price: 3000, duration: 120, isPopular: true, tags: ['party', 'makeup', 'glam'] },
    { categoryId: makeupCat.id, name: 'HD Makeup', slug: 'hd-makeup', description: 'High-definition makeup perfect for photography and events, looks flawless in all lighting.', shortDesc: 'Camera-perfect HD finish', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600', price: 5000, duration: 180, isFeatured: true, tags: ['hd', 'makeup', 'photography'] },
    { categoryId: makeupCat.id, name: 'Airbrush Makeup', slug: 'airbrush-makeup', description: 'Professional airbrush makeup for a flawless, ultra-smooth finish that lasts all day.', shortDesc: 'Flawless airbrush finish', image: 'https://images.unsplash.com/photo-1525904097878-94fb15835963?w=600', price: 6000, duration: 180, tags: ['airbrush', 'makeup'] },
    { categoryId: spaCat.id, name: 'Relaxing Body Massage', slug: 'body-massage', description: 'Full body Swedish massage to relieve stress, tension, and muscle soreness.', shortDesc: 'Full body relaxation', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', price: 2000, duration: 90, isPopular: true, isFeatured: true, tags: ['massage', 'spa', 'relaxation'] },
    { categoryId: spaCat.id, name: 'Aromatherapy Massage', slug: 'aromatherapy', description: 'Relaxing aromatherapy massage with essential oils to restore mind-body balance.', shortDesc: 'Essential oil therapy', image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600', price: 2500, duration: 90, tags: ['aromatherapy', 'massage'] },
    { categoryId: spaCat.id, name: 'Deep Tissue Massage', slug: 'deep-tissue-massage', description: 'Therapeutic deep tissue massage targeting chronic muscle tension and pain relief.', shortDesc: 'Therapeutic deep tissue', image: 'https://images.unsplash.com/photo-1598901847881-afeae7c764ae?w=600', price: 2800, duration: 90, tags: ['deep-tissue', 'therapeutic'] },
  ];

  for (const s of serviceData) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }
  console.log('✅ Services created:', serviceData.length);

  // ── Staff Users ───────────────────────────────────────────────────
  const staffPass = await bcrypt.hash('Staff@123', 12);
  const staffData = [
    { email: 'silambu@ssbeautyparlour.com', firstName: 'Silambu', lastName: '', phone: '9751972900', specializations: ['Hair Styling', 'Keratin Treatment', 'Hair Coloring'], bio: 'Silambu is our master hair stylist known for creative cuts and styling treatments.', experience: 8 },
    { email: 'kaviya@ssbeautyparlour.com', firstName: 'Kaviya', lastName: '', phone: '9751972901', specializations: ['Facial', 'Skin Care', 'Anti-Aging'], bio: 'Kaviya is a certified skin specialist transforming skin with luxury treatments.', experience: 5 },
  ];

  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, firstName: s.firstName, lastName: s.lastName,
        phone: s.phone, role: Role.STAFF, password: staffPass, isVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=E91E63&color=fff&size=200`,
      },
    });
    await prisma.staffProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id, bio: s.bio, specializations: s.specializations,
        experience: s.experience, rating: 4.5 + Math.random() * 0.5,
        workingHours: { start: '09:00', end: '20:00' },
      },
    });
  }
  console.log('✅ Staff created:', staffData.length);

  // ── Packages ──────────────────────────────────────────────────────
  const allServices = await prisma.service.findMany();
  const getService = (slug: string) => allServices.find((s) => s.slug === slug);

  const packages = [
    {
      name: 'Bridal Bliss Package',
      slug: 'bridal-bliss',
      description: 'The ultimate bridal package for your dream wedding day. Includes complete bridal makeup, hair styling, facial, manicure & pedicure.',
      shortDesc: 'Complete wedding day glamour',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
      originalPrice: 25000,
      discountedPrice: 19999,
      duration: 480,
      isFeatured: true,
      isPopular: true,
      validityDays: 1,
      tags: ['bridal', 'wedding', 'complete'],
      services: ['bridal-makeup', 'classic-facial', 'classic-manicure', 'luxury-pedicure'],
    },
    {
      name: 'Glow Package',
      slug: 'glow-package',
      description: 'A comprehensive beauty package for glowing skin and beautiful nails. Perfect for a special occasion or self-care day.',
      shortDesc: 'Head-to-toe glow treatment',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
      originalPrice: 4500,
      discountedPrice: 3499,
      duration: 210,
      isFeatured: true,
      isPopular: true,
      validityDays: 30,
      tags: ['glow', 'skin', 'nails'],
      services: ['classic-facial', 'cleanup-glow', 'classic-manicure', 'luxury-pedicure'],
    },
    {
      name: 'Spa Retreat Package',
      slug: 'spa-retreat',
      description: 'A luxurious spa day experience combining body massage, aromatherapy, and facial for complete relaxation and rejuvenation.',
      shortDesc: 'Complete relaxation experience',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
      originalPrice: 7500,
      discountedPrice: 5999,
      duration: 240,
      isFeatured: false,
      isPopular: true,
      validityDays: 30,
      tags: ['spa', 'relaxation', 'massage'],
      services: ['body-massage', 'aromatherapy', 'classic-facial'],
    },
    {
      name: 'Monthly Membership',
      slug: 'monthly-membership',
      description: 'Enjoy regular beauty care with our monthly membership. Get any 4 services of your choice every month at a special price.',
      shortDesc: 'Any 4 services per month',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      originalPrice: 12000,
      discountedPrice: 7999,
      duration: 180,
      isFeatured: true,
      isPopular: false,
      validityDays: 30,
      tags: ['membership', 'monthly', 'value'],
      services: ['classic-facial', 'classic-manicure', 'luxury-pedicure', 'haircut-styling'],
    },
    {
      name: 'Premium Membership',
      slug: 'premium-membership',
      description: 'Our most exclusive membership offering unlimited basic services for 30 days. Priority booking, personalized consultations included.',
      shortDesc: 'Unlimited luxury access',
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
      originalPrice: 25000,
      discountedPrice: 14999,
      duration: 240,
      isFeatured: true,
      isPopular: false,
      validityDays: 30,
      tags: ['premium', 'unlimited', 'exclusive'],
      services: ['classic-facial', 'cleanup-glow', 'classic-manicure', 'luxury-pedicure', 'haircut-styling', 'body-massage'],
    },
  ];

  for (const pkg of packages) {
    const { services: sluList, ...pkgData } = pkg;
    const existing = await prisma.package.findUnique({ where: { slug: pkgData.slug } });
    if (!existing) {
      const created = await prisma.package.create({
        data: {
          ...pkgData,
          packageServices: {
            create: sluList
              .map((slug) => getService(slug))
              .filter(Boolean)
              .map((s) => ({ serviceId: s!.id })),
          },
        },
      });
    }
  }
  console.log('✅ Packages created:', packages.length);

  // ── Gallery Items ─────────────────────────────────────────────────
  const galleryItems = [
    { title: 'Bridal Transformation', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', category: 'Bridal', type: 'image', tags: ['bridal', 'transformation'] },
    { title: 'Hair Color Magic', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', category: 'Hair', type: 'image', tags: ['hair', 'color'] },
    { title: 'Nail Art Collection', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', category: 'Nails', type: 'image', tags: ['nails', 'art'] },
    { title: 'Facial Glow', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', category: 'Skin Care', type: 'image', tags: ['facial', 'glow'] },
    { title: 'Spa Day', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', category: 'Spa', type: 'image', tags: ['spa', 'relaxation'] },
    { title: 'Party Makeup Look', imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', category: 'Makeup', type: 'image', tags: ['makeup', 'party'] },
    { title: 'Hair Styling', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', category: 'Hair', type: 'image', tags: ['hair', 'styling'] },
    { title: 'Luxury Pedicure', imageUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800', category: 'Nails', type: 'image', tags: ['pedicure', 'luxury'] },
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.create({ data: { ...item, thumbnailUrl: item.imageUrl } });
  }
  console.log('✅ Gallery items created:', galleryItems.length);

  // ── Blogs ─────────────────────────────────────────────────────────
  const blogs = [
    {
      title: '10 Expert Tips for Healthy, Lustrous Hair',
      slug: 'healthy-hair-tips',
      excerpt: 'Discover professional secrets to maintain gorgeous, healthy hair all year round.',
      content: `# 10 Expert Tips for Healthy, Lustrous Hair\n\nHaving beautiful, healthy hair is a dream for many. Here are our top expert tips to help you achieve that salon-perfect look every day.\n\n## 1. Invest in a Quality Shampoo\nNot all shampoos are created equal. Choose one that matches your hair type...\n\n## 2. Never Skip Conditioner\nConditioning is essential for hydration and preventing breakage...\n\n## 3. Use a Heat Protectant\nBefore using any heat styling tool, always apply a quality heat protectant spray...\n\n## 4. Get Regular Trims\nTrimming every 6-8 weeks prevents split ends from traveling up the hair shaft...\n\n## 5. Oil Your Hair Weekly\nTraditional hair oiling with coconut or argan oil nourishes your scalp and strands...`,
      category: 'Hair Care',
      tags: ['hair', 'tips', 'beauty'],
      coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
      isPublished: true,
      publishedAt: new Date(),
      readTime: 5,
      authorId: admin.id,
    },
    {
      title: 'The Ultimate Guide to Bridal Skin Prep',
      slug: 'bridal-skin-prep-guide',
      excerpt: 'Start your bridal skin journey 6 months before your wedding for a radiant glow on your big day.',
      content: `# The Ultimate Guide to Bridal Skin Prep\n\nYour wedding day is one of the most photographed days of your life. Here's how to ensure your skin is absolutely glowing...\n\n## 6 Months Before\nStart with a thorough skin analysis consultation. Begin a regular facial routine...\n\n## 3 Months Before\nIntroduce targeted treatments like chemical peels or microdermabrasion...\n\n## 1 Month Before\nSwitch to gentle, hydrating treatments only. Avoid trying anything new...`,
      category: 'Skin Care',
      tags: ['bridal', 'skin', 'wedding'],
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      isPublished: true,
      publishedAt: new Date(),
      readTime: 8,
      authorId: admin.id,
    },
    {
      title: 'Trending Nail Art Designs for 2024',
      slug: 'trending-nail-art-2024',
      excerpt: 'From minimalist to maximalist, explore the hottest nail art trends that are taking over this year.',
      content: `# Trending Nail Art Designs for 2024\n\nNail art has evolved dramatically, and 2024 is bringing some stunning new trends...\n\n## Chrome & Mirror Nails\nThe metallic chrome effect continues to dominate with new color variations...\n\n## Botanical Designs\nFloral and botanical prints are having a major moment...\n\n## Negative Space Art\nMinimalist designs using negative space create stunning geometric patterns...`,
      category: 'Nail Care',
      tags: ['nails', 'trends', '2024'],
      coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200',
      isPublished: true,
      publishedAt: new Date(),
      readTime: 4,
      authorId: admin.id,
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.upsert({ where: { slug: blog.slug }, update: {}, create: blog });
  }
  console.log('✅ Blogs created:', blogs.length);

  // ── Coupons ───────────────────────────────────────────────────────
  const coupons = [
    { code: 'WELCOME10', description: '10% off for new customers', discountType: 'percentage', discountValue: 10, maxDiscount: 500, isActive: true, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    { code: 'GLOW20', description: '20% off on all services', discountType: 'percentage', discountValue: 20, maxDiscount: 1000, minOrderAmount: 2000, isActive: true, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    { code: 'BRIDAL500', description: 'Flat ₹500 off on bridal services', discountType: 'flat', discountValue: 500, minOrderAmount: 5000, isActive: true, validFrom: new Date(), validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
    { code: 'FIRSTBOOK', description: '15% off on first booking', discountType: 'percentage', discountValue: 15, maxDiscount: 300, maxUses: 100, isActive: true, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    { code: 'LOYALTY25', description: '25% off for loyal customers', discountType: 'percentage', discountValue: 25, maxDiscount: 2000, minOrderAmount: 3000, isActive: true, validFrom: new Date(), validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({ where: { code: coupon.code }, update: {}, create: coupon });
  }
  console.log('✅ Coupons created:', coupons.length);

  // ── Settings ──────────────────────────────────────────────────────
  const settings = [
    { key: 'salon_name', value: 'SS Beauty Parlour', group: 'general', label: 'Salon Name' },
    { key: 'salon_tagline', value: 'Where Beauty Meets Perfection', group: 'general', label: 'Tagline' },
    { key: 'salon_phone', value: '9751972900', group: 'contact', label: 'Phone' },
    { key: 'salon_email', value: 'hello@ssbeautyparlour.com', group: 'contact', label: 'Email' },
    { key: 'salon_address', value: 'Old Bus Stand Opposite, Chengam, Thiruvannamalai District, Tamilnadu', group: 'contact', label: 'Address' },
    { key: 'working_hours', value: JSON.stringify({ mon: '9AM-8PM', tue: '9AM-8PM', wed: '9AM-8PM', thu: '9AM-8PM', fri: '9AM-8PM', sat: '9AM-9PM', sun: '10AM-6PM' }), group: 'operations', label: 'Working Hours' },
    { key: 'booking_advance_days', value: '30', group: 'booking', label: 'Booking Advance Days' },
    { key: 'cancellation_hours', value: '24', group: 'booking', label: 'Cancellation Notice Hours' },
    { key: 'tax_rate', value: '18', group: 'billing', label: 'Tax Rate (%)' },
    { key: 'currency', value: 'INR', group: 'billing', label: 'Currency' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: setting });
  }
  console.log('✅ Settings created:', settings.length);

  // ── Notifications ─────────────────────────────────────────────────
  const notifications = [
    { userId: admin.id, title: 'Welcome to SS Beauty Parlour', message: 'Glad to have you manage SS Beauty Parlour! Check bookings daily.', type: 'GENERAL' as const },
    { userId: admin.id, title: 'Settings Updated', message: 'Address and mobile details were updated successfully.', type: 'GENERAL' as const }
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }
  console.log('✅ Sample notifications created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin login: admin@glowbeauty.com / Admin@123');
  console.log('📧 Staff login: silambu@ssbeautyparlour.com / Staff@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
