'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Gift } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/contact/newsletter', { email });
      toast.success('🌸 Welcome to the Glow family! Check your inbox for a special surprise.');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #E91E63 0%, #AD1457 50%, #880E4F 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,215,0,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [-20, 20, -20], x: [i % 2 === 0 ? -10 : 10, i % 2 === 0 ? 10 : -10] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute text-white/10 text-5xl pointer-events-none"
          style={{ top: `${10 + i * 15}%`, left: `${5 + i * 15}%` }}
        >
          ✨
        </motion.div>
      ))}

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">Exclusive Offer</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Get{' '}
            <span style={{ background: 'linear-gradient(135deg, #FFD700, #FFA000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              10% Off
            </span>
            {' '}Your First Visit
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Subscribe to our newsletter and receive exclusive beauty tips, special offers, seasonal discounts, and an instant 10% discount coupon!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-11 pr-4 py-4 rounded-full bg-white border-0 outline-none text-foreground placeholder:text-gray-400 text-sm font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-4 rounded-full font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #FFD700, #FFA000)', color: '#2D2D2D', boxShadow: '0 4px 20px rgba(255,215,0,0.4)' }}
            >
              {loading ? '...' : '✨ Subscribe Free'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 mt-8">
            {['No spam, ever', 'Unsubscribe anytime', 'Exclusive members\' offers'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-white/70 text-xs">
                <Sparkles className="w-3 h-3 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
