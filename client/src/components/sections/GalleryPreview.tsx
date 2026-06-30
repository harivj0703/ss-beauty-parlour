'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
}

const fallback: GalleryItem[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', title: 'Bridal Transformation', category: 'Bridal' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', title: 'Hair Color Magic', category: 'Hair' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', title: 'Nail Art', category: 'Nails' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', title: 'Facial Glow', category: 'Skin' },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', title: 'Spa Day', category: 'Spa' },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', title: 'Party Makeup', category: 'Makeup' },
];

export default function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    api.get('/gallery?limit=6').then((r) => setItems(r.data.data || [])).catch(() => setItems([]));
  }, []);

  const display = items.length > 0 ? items : fallback;

  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8FB 100%)' }}>
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-badge">
            <Camera className="w-3.5 h-3.5" />
            Gallery
          </span>
          <h2 className="section-heading">
            Our{' '}
            <span className="text-gradient">Transformations</span>
          </h2>
          <p className="section-subtitle">Browse through our gallery of stunning before & afters, nail art, bridal looks, and more.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {display.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'row-span-2' : ''}`}
              style={{ height: i === 0 ? '480px' : '228px' }}
            >
              <Image
                src={item.imageUrl}
                alt={item.title || 'Gallery'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-white font-semibold text-sm">{item.title}</p>
                {item.category && <span className="badge-primary text-[10px] mt-1">{item.category}</span>}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/gallery" className="btn-luxury inline-flex items-center gap-2">
            View Full Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
