'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Heart, Leaf, Star, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Award, title: 'Award-Winning Salon', desc: 'Recognized for excellence in beauty services across the region.' },
  { icon: Heart, title: 'Client-First Approach', desc: 'Every treatment is tailored to your unique needs and preferences.' },
  { icon: Leaf, title: 'Organic Products', desc: 'We use only premium, skin-friendly and eco-conscious beauty products.' },
  { icon: Star, title: 'Expert Professionals', desc: 'Our stylists have 5+ years of industry experience each.' },
];

const highlights = [
  'Internationally trained beauty experts',
  'Hygienic & sterile salon environment',
  '100% premium product guarantee',
  'Flexible appointment scheduling',
  'Competitive & transparent pricing',
];

export default function AboutPreview() {
  return (
    <section className="py-24 bg-white overflow-hidden" id="about">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-luxury-xl">
              <Image
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
                alt="About Glow Beauty Studio"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(173,20,87,0.3) 0%, transparent 60%)' }} />
            </div>
            {/* Floating card */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 glass rounded-2xl p-5 shadow-luxury-xl border border-primary/10 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">4.9/5 Rating</p>
              <p className="text-xs text-muted">Based on 500+ reviews</p>
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -top-6 -left-6 glass rounded-2xl p-4 shadow-luxury border border-primary/10"
            >
              <div className="text-3xl mb-1">💄</div>
              <p className="text-sm font-bold text-primary">10+ Years</p>
              <p className="text-xs text-muted">of Excellence</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="section-badge">About Us</span>
            <h2 className="section-heading">
              A Legacy of{' '}
              <span className="text-gradient">Beauty & Excellence</span>
            </h2>
            <p className="text-muted leading-relaxed">
              Founded with a passion for transformative beauty, Glow Beauty Studio has been Bangalore's premier luxury beauty destination for over a decade. We believe every person deserves to feel beautiful, confident, and pampered.
            </p>
            <p className="text-muted leading-relaxed">
              Our team of expert stylists and beauty professionals bring creativity, skill, and genuine care to every appointment – whether it's a quick cleanup or a complete bridal transformation.
            </p>

            {/* Highlights */}
            <ul className="space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              ))}
            </div>

            <Link href="/about" className="btn-luxury inline-flex items-center gap-2 mt-4">
              Learn Our Story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
