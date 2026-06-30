'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Star, Calendar, ChevronDown, Play } from 'lucide-react';

const floatingBadges = [
  { label: '500+ Happy Clients', icon: '💕', position: 'top-[20%] left-[5%]', delay: 0.8 },
  { label: '10+ Years Experience', icon: '✨', position: 'top-[15%] right-[5%]', delay: 1.0 },
  { label: '5★ Rated Salon', icon: '⭐', position: 'bottom-[25%] left-[3%]', delay: 1.2 },
  { label: 'Premium Services', icon: '💄', position: 'bottom-[20%] right-[3%]', delay: 1.4 },
];

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden" id="hero">
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1920&q=90"
          alt="Luxury Beauty Salon"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,28,29,0.92) 0%, rgba(21,46,48,0.85) 40%, rgba(10,28,29,0.75) 100%)' }} />
      </motion.div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full border border-primary/10 opacity-30 animate-spin-slow pointer-events-none" />
      <div className="absolute top-32 right-32 w-64 h-64 rounded-full border border-accent/10 opacity-20 animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 container-luxury w-full pt-24 pb-16"
      >
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white">Premium Luxury Beauty Salon</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-accent fill-accent" />)}
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]"
          >
            Where{' '}
            <span style={{ background: 'linear-gradient(135deg, #D4AF37, #B38F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Beauty
            </span>
            {' '}Meets{' '}
            <span className="italic" style={{ background: 'linear-gradient(135deg, #FCF9F2, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Perfection
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-white/75 mb-10 max-w-xl leading-relaxed"
          >
            Indulge in premium beauty services crafted with love. From hair to skin, nails to bridal – your dream look awaits at Glow Beauty Studio.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link
              href="/booking"
              id="hero-book-btn"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B08E27)', boxShadow: '0 8px 30px rgba(212,175,55,0.4)' }}
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <Link
              href="/services"
              id="hero-services-btn"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(10px)' }}
            >
              <Play className="w-5 h-5" />
              View Services
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex items-center gap-8"
          >
            {[
              { value: '5000+', label: 'Happy Clients' },
              { value: '50+', label: 'Services' },
              { value: '10+', label: 'Expert Staff' },
              { value: '4.9★', label: 'Average Rating' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold font-heading" style={{ background: 'linear-gradient(135deg, #D4AF37, #B38F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {value}
                </div>
                <div className="text-xs text-white/60">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Badges */}
      {floatingBadges.map(({ label, icon, position, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.5 }}
          className={`absolute ${position} hidden xl:flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-medium animate-float`}
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span>{icon}</span>
          {label}
        </motion.div>
      ))}

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
