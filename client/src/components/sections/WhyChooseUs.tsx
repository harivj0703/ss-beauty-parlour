'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Leaf, Award, HeartHandshake, Sparkles, Users, Star } from 'lucide-react';

const reasons = [
  { icon: Award, title: 'Award-Winning Services', desc: 'Recognized as the Best Luxury Salon in Bangalore for 3 consecutive years.', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Leaf, title: 'Premium Organic Products', desc: 'Only internationally certified, skin-safe, eco-friendly products used.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: Shield, title: 'Hygiene First', desc: 'Hospital-grade sterilization and single-use tools for every client.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Clock, title: 'Punctual & Professional', desc: 'We respect your time. On-time appointments, every time.', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: HeartHandshake, title: 'Personalized Care', desc: 'Every service tailored to your unique skin type, hair texture, and preferences.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Users, title: 'Expert Team', desc: '10+ certified beauty professionals with 5+ years of experience each.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { icon: Star, title: '5-Star Experience', desc: 'Luxury ambiance, premium refreshments, and exceptional hospitality.', color: 'text-accent', bg: 'bg-amber-50' },
  { icon: Sparkles, title: 'Results Guaranteed', desc: 'If you\'re not 100% satisfied, we will make it right — no questions asked.', color: 'text-rose-500', bg: 'bg-rose-50' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white" id="why-us">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-badge">Why Glow?</span>
          <h2 className="section-heading">
            Why Choose{' '}
            <span className="text-gradient">Glow Beauty Studio?</span>
          </h2>
          <p className="section-subtitle">We don't just offer beauty services – we deliver transformative experiences that make you feel extraordinary.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reasons.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-luxury transition-all duration-300 cursor-default"
            >
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
