'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Eye, Heart, Sparkles, Filter } from 'lucide-react';
import api from '@/lib/api';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  category?: string;
  description?: string;
}

const fallbackGallery: GalleryItem[] = [
  { id: 'g-1', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', title: 'Luxury Bridal Makeup', category: 'Bridal', description: 'Glow HD bridal finish for wedding day.' },
  { id: 'g-2', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', title: 'Sun Kissed Balayage', category: 'Hair', description: 'Soft golden blonde highlights.' },
  { id: 'g-3', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', title: 'Classic Gel Nails', category: 'Nails', description: 'Elegant glitter tip gel nail art.' },
  { id: 'g-4', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', title: 'Hydrafacial Glow', category: 'Skin', description: 'Deep exfoliation skin facial treatment.' },
  { id: 'g-5', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', title: 'Swedish Body Spa', category: 'Spa', description: 'Relaxing full body oil massage.' },
  { id: 'g-6', imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', title: 'Glamorous Party Eyes', category: 'Makeup', description: 'Smokey eye glitter styling.' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Bridal', 'Hair', 'Nails', 'Skin', 'Spa', 'Makeup']);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    api.get('/gallery')
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems(fallbackGallery));
  }, []);

  const displayItems = items.length > 0 ? items : fallbackGallery;

  const filtered = activeFilter === 'All'
    ? displayItems
    : displayItems.filter((item) => item.category?.toLowerCase() === activeFilter.toLowerCase());

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-badge">
            <Camera className="w-4.5 h-4.5" /> Portfolio
          </span>
          <h1 className="section-heading">Sensational <span className="text-gradient">Transformations</span></h1>
          <p className="section-subtitle">A showcase of our master styling, makeup makeovers, and nail art creations.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === cat
                  ? 'bg-primary text-white shadow-glow'
                  : 'glass text-foreground hover:bg-primary/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setLightbox(item)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white border border-border shadow-card hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Portfolio Image'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="flex items-center justify-between text-white mb-2">
                      <span className="text-xs uppercase tracking-wider font-bold bg-primary px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <button
                        onClick={(e) => handleLike(item.id, e)}
                        className="flex items-center gap-1 text-xs hover:text-primary transition-colors bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" /> {likes[item.id] || 0}
                      </button>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-white/80 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-3xl w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              >
                <div className="relative h-[480px] w-full">
                  <Image
                    src={lightbox.imageUrl}
                    alt={lightbox.title || 'Lightbox'}
                    fill
                    className="object-contain bg-black"
                  />
                </div>
                <div className="p-6 bg-neutral-900 text-white">
                  <span className="text-xs bg-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {lightbox.category}
                  </span>
                  <h2 className="font-heading text-2xl font-bold mt-3 mb-2">{lightbox.title}</h2>
                  <p className="text-sm text-gray-400">{lightbox.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
