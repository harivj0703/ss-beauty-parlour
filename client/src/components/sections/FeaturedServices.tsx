'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Clock, Star, ArrowRight, Sparkles, Heart } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

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
  category: { name: string; slug: string };
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [wishlisted, setWishlisted] = useState(false);
  const discountPct = service.discountedPrice
    ? Math.round(((service.price - service.discountedPrice) / service.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="service-card group"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={service.image || 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=600'}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="overlay" />
        {discountPct > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {discountPct}% OFF
          </div>
        )}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-primary text-primary' : 'text-white'}`} />
        </button>
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-medium text-white/90 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {service.category.name}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {service.name}
        </h3>
        <p className="text-sm text-muted line-clamp-2 mb-4">{service.description}</p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3.5 h-3.5" />
            {service.duration} min
          </div>
          {service.totalReviews > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              {service.rating.toFixed(1)} ({service.totalReviews})
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/booking?service=${service.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E91E63, #AD1457)', boxShadow: '0 4px 15px rgba(233,30,99,0.35)' }}
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    api.get('/services/featured').then((r) => {
      setServices(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fallback static services if API not connected
  const fallbackServices: Service[] = [
    { id: '1', name: 'Bridal Makeup', slug: 'bridal-makeup', description: 'Stunning bridal makeup with HD techniques for your perfect day.', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600', price: 15000, duration: 240, rating: 4.9, totalReviews: 124, category: { name: 'Makeup', slug: 'makeup' } },
    { id: '2', name: 'Classic Facial', slug: 'classic-facial', description: 'Deep cleansing facial with exfoliation and mask for glowing skin.', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', price: 1200, duration: 60, rating: 4.8, totalReviews: 89, category: { name: 'Skin Care', slug: 'skin-care' } },
    { id: '3', name: 'Keratin Treatment', slug: 'keratin-treatment', description: 'Frizz-free silky smooth hair for 3-6 months with keratin.', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600', price: 4000, discountedPrice: 3499, duration: 240, rating: 4.9, totalReviews: 67, category: { name: 'Hair Care', slug: 'hair-care' } },
    { id: '4', name: 'Body Massage', slug: 'body-massage', description: 'Full body Swedish massage to relieve stress and muscle soreness.', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', price: 2000, duration: 90, rating: 4.7, totalReviews: 52, category: { name: 'Body Spa', slug: 'body-spa' } },
    { id: '5', name: 'Nail Art Design', slug: 'nail-art', description: 'Creative nail art designs by our expert nail artists.', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600', price: 500, duration: 30, rating: 4.6, totalReviews: 43, category: { name: 'Nail Care', slug: 'nail-care' } },
    { id: '6', name: 'Skin Brightening', slug: 'skin-brightening', description: 'Vitamin C brightening treatment for radiant, glowing skin.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600', price: 1800, discountedPrice: 1499, duration: 75, rating: 4.8, totalReviews: 38, category: { name: 'Skin Care', slug: 'skin-care' } },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-badge">
            <Sparkles className="w-3.5 h-3.5" />
            Our Services
          </span>
          <h2 className="section-heading">
            Featured{' '}
            <span className="text-gradient">Beauty Services</span>
          </h2>
          <p className="section-subtitle">
            Discover our most loved services, crafted with expertise and delivered with a touch of luxury.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden">
                <div className="h-56 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 shimmer rounded-full w-3/4" />
                  <div className="h-4 shimmer rounded-full" />
                  <div className="h-4 shimmer rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/services" className="btn-luxury-outline inline-flex items-center gap-2">
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
