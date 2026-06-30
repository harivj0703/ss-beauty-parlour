'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Clock, Star, ArrowRight, Sparkles, Check, Flame } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface PackageService {
  service: { name: string };
}

interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  duration: number;
  validityDays: number;
  isFeatured: boolean;
  isPopular: boolean;
  packageServices: PackageService[];
}

const fallbackPackages: Package[] = [
  {
    id: 'pkg-1',
    name: 'Bridal Bliss Package',
    slug: 'bridal-bliss',
    description: 'The ultimate bridal package for your dream wedding day. Includes complete bridal makeup, hair styling, facial, manicure & pedicure.',
    shortDesc: 'Complete wedding day glamour',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    originalPrice: 25000,
    discountedPrice: 19999,
    duration: 480,
    validityDays: 1,
    isFeatured: true,
    isPopular: true,
    packageServices: [
      { service: { name: 'Bridal Makeup' } },
      { service: { name: 'Classic Facial' } },
      { service: { name: 'Classic Manicure' } },
      { service: { name: 'Luxury Pedicure' } },
    ],
  },
  {
    id: 'pkg-2',
    name: 'Glow Package',
    slug: 'glow-package',
    description: 'A comprehensive beauty package for glowing skin and beautiful nails. Perfect for a special occasion or self-care day.',
    shortDesc: 'Head-to-toe glow treatment',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
    originalPrice: 4500,
    discountedPrice: 3499,
    duration: 210,
    validityDays: 30,
    isFeatured: true,
    isPopular: true,
    packageServices: [
      { service: { name: 'Classic Facial' } },
      { service: { name: 'Cleanup & Glow' } },
      { service: { name: 'Classic Manicure' } },
      { service: { name: 'Luxury Pedicure' } },
    ],
  },
  {
    id: 'pkg-3',
    name: 'Spa Retreat Package',
    slug: 'spa-retreat',
    description: 'A luxurious spa day experience combining body massage, aromatherapy, and facial for complete relaxation and rejuvenation.',
    shortDesc: 'Complete relaxation experience',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
    originalPrice: 7500,
    discountedPrice: 5999,
    duration: 240,
    validityDays: 30,
    isFeatured: false,
    isPopular: false,
    packageServices: [
      { service: { name: 'Body Massage' } },
      { service: { name: 'Aromatherapy' } },
      { service: { name: 'Classic Facial' } },
    ],
  },
];

export default function PopularPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    api.get('/admin/packages')
      .then((r) => setPackages(r.data.data || []))
      .catch(() => setPackages([]));
  }, []);

  const displayPackages = packages.length > 0 ? packages : fallbackPackages;

  return (
    <section ref={ref} className="py-20 bg-background relative overflow-hidden" id="packages">
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="section-badge">
            <Sparkles className="w-3.5 h-3.5" /> Special Offers
          </span>
          <h2 className="section-heading">
            Popular <span className="text-gradient">Beauty Packages</span>
          </h2>
          <p className="section-subtitle font-body">
            Get premium head-to-toe beauty packages curated by our artists at unbeatable prices.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPackages.slice(0, 3).map((pkg, i) => {
            const saving = pkg.originalPrice - pkg.discountedPrice;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`card-luxury flex flex-col h-full relative ${
                  pkg.isPopular ? 'ring-2 ring-primary border-transparent' : ''
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute top-4 right-4 z-10 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-glow animate-pulse">
                    <Flame className="w-3 h-3 fill-white" /> Popular Choice
                  </span>
                )}

                {/* Cover Image */}
                <div className="relative h-48 w-full">
                  <Image
                    src={pkg.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600'}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs uppercase tracking-wider bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                      {pkg.validityDays > 1 ? `${pkg.validityDays} Days Validity` : 'Single Session'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-heading font-bold text-xl mb-2 line-clamp-1">{pkg.name}</h3>
                  <p className="text-sm text-muted mb-4">{pkg.shortDesc}</p>

                  <div className="flex items-center gap-3 text-xs text-muted mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {pkg.duration} min
                    </span>
                    <span>•</span>
                    <span>{pkg.packageServices.length} Services included</span>
                  </div>

                  {/* Services Checklist */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.packageServices.map((ps, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{ps.service.name}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing Details */}
                  <div className="pt-4 border-t border-border mt-auto">
                    <Link
                      href={`/booking?package=${pkg.id}`}
                      className="btn-luxury w-full text-sm font-semibold flex items-center justify-center gap-2 py-3"
                    >
                      Book Package <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center mt-12"
        >
          <Link href="/packages" className="btn-luxury-outline inline-flex items-center gap-2">
            View All Packages <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
