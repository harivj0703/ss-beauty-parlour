'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, Heart, Grid, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  rating: number;
  totalReviews: number;
  categoryId: string;
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync URL query parameters
    const cat = searchParams.get('category');
    if (cat) setSelectedCat(cat);
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      api.get('/services/categories'),
      api.get('/services'),
    ]).then(([catRes, servRes]) => {
      setCategories(catRes.data.data || []);
      setServices(servRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCat === 'all') return matchesSearch;
    // Match by category slug
    const catObj = categories.find((c) => c.slug === selectedCat || c.id === selectedCat);
    return matchesSearch && s.categoryId === catObj?.id;
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="section-badge">Our Menu</span>
          <h1 className="section-heading">Sensational <span className="text-gradient">Beauty Treatments</span></h1>
          <p className="section-subtitle">Discover a world of specialized, high-end care designed for your well-being.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-4 glass rounded-2xl border border-primary/10">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              id="service-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search treatments..."
              className="input-luxury pl-11 py-2 text-sm"
            />
          </div>

          {/* Categories Tab Selector */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCat === 'all' ? 'bg-primary text-white' : 'glass hover:bg-primary/5 text-foreground'
              }`}
            >
              All Treatments
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCat === c.slug ? 'bg-primary text-white' : 'glass hover:bg-primary/5 text-foreground'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shimmer h-72" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((service, index) => {
                const discountPct = service.discountedPrice
                  ? Math.round(((service.price - service.discountedPrice) / service.price) * 100)
                  : 0;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={service.id}
                    className="service-card group"
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={service.image || 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=600'}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {discountPct > 0 && (
                        <span className="absolute top-3 left-3 bg-gradient-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col justify-between min-h-[220px]">
                      <div>
                        <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {service.name}
                        </h3>
                        <p className="text-xs text-muted mb-3 line-clamp-2">{service.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {service.duration} mins
                          </span>
                          {service.totalReviews > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> {service.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-4">
                        <div>
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(service.discountedPrice ?? service.price)}
                          </div>
                          {service.discountedPrice && (
                            <div className="text-xs text-muted line-through">{formatPrice(service.price)}</div>
                          )}
                        </div>
                        <Link href={`/booking?service=${service.id}`} className="btn-luxury px-5 py-2 text-xs">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
