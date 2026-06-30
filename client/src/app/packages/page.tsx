'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Tag, ArrowRight, Check, Flame, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface PackageService {
  service: { name: string; duration: number };
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
  isPopular: boolean;
  packageServices: PackageService[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/packages')
      .then((r) => {
        setPackages(r.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-badge">Package Deals</span>
          <h1 className="section-heading">Curated <span className="text-gradient">Pampering Sessions</span></h1>
          <p className="section-subtitle">Save up to 30% on combined treatments curated by our expert beauticians.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-[450px] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, i) => {
              const saving = pkg.originalPrice - pkg.discountedPrice;
              const savingPercent = Math.round((saving / pkg.originalPrice) * 100);

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-luxury flex flex-col relative h-full bg-white ${
                    pkg.isPopular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute top-4 right-4 z-10 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-white" /> Recommended
                    </span>
                  )}

                  {/* Image */}
                  <div className="relative h-52 w-full">
                    <Image
                      src={pkg.image || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600'}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-heading font-bold text-xl mb-2">{pkg.name}</h2>
                    <p className="text-sm text-muted mb-4">{pkg.shortDesc}</p>

                    <div className="flex items-center gap-4 text-xs text-muted mb-5">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {pkg.duration} mins</span>
                      <span>•</span>
                      <span>{pkg.packageServices.length} Treatments included</span>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      {pkg.packageServices.map((ps, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{ps.service.name} ({ps.service.duration}m)</span>
                        </li>
                      ))}
                    </ul>

                    {/* Pricing */}
                    <div className="pt-4 border-t border-border mt-auto">
                      <Link href={`/booking?package=${pkg.id}`} className="btn-luxury w-full flex items-center justify-center gap-2">
                        Book Package Deal <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
