'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Sparkles, ArrowRight, Search, Tag } from 'lucide-react';
import api from '@/lib/api';
import { formatDateShort } from '@/lib/utils';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readTime: number;
  views: number;
  publishedAt: string;
}

const fallbackBlogs: Blog[] = [
  {
    id: 'b-1',
    title: '10 Expert Tips for Healthy, Lustrous Hair',
    slug: 'healthy-hair-tips',
    excerpt: 'Discover professional secrets to maintain gorgeous, healthy hair all year round from our master stylists.',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    category: 'Hair Care',
    readTime: 5,
    views: 124,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'b-2',
    title: 'The Ultimate Guide to Bridal Skin Prep',
    slug: 'bridal-skin-prep-guide',
    excerpt: 'Start your bridal skin journey 6 months before your wedding for a radiant glow on your big day.',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    category: 'Skin Care',
    readTime: 8,
    views: 345,
    publishedAt: new Date().toISOString(),
  },
  {
    id: 'b-3',
    title: 'Trending Nail Art Designs for 2024',
    slug: 'trending-nail-art-2024',
    excerpt: 'From minimalist chrome to botanical patterns, explore the hottest nail art trends taking over this year.',
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200',
    category: 'Nail Care',
    readTime: 4,
    views: 201,
    publishedAt: new Date().toISOString(),
  },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog')
      .then((r) => {
        setBlogs(r.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayBlogs = blogs.length > 0 ? blogs : fallbackBlogs;

  const filtered = displayBlogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-badge">
            <Sparkles className="w-3.5 h-3.5" /> Glow Journal
          </span>
          <h1 className="section-heading">Beauty <span className="text-gradient">Secrets & Guides</span></h1>
          <p className="section-subtitle">Read the latest trends, lifestyle tips, and beauty advice from our salon experts.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            id="blog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="input-luxury pl-11"
          />
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-96 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-luxury flex flex-col h-full bg-white border border-border"
              >
                {/* Cover */}
                <div className="relative h-52 w-full">
                  <Image
                    src={blog.coverImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white font-bold text-xs px-2.5 py-1 rounded-full">
                    {blog.category}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-muted mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateShort(blog.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.readTime}m read</span>
                    </div>

                    <h2 className="font-heading font-bold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>
                    <p className="text-sm text-muted mb-4 line-clamp-3">{blog.excerpt}</p>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views} views</span>
                    <Link href={`/blog/${blog.slug}`} className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
