'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Award, Star, Clock, Smile, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, value: 5000, suffix: '+', label: 'Happy Clients', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', delay: 0 },
  { icon: Award, value: 50, suffix: '+', label: 'Services Offered', color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', delay: 0.1 },
  { icon: Star, value: 4.9, suffix: '★', label: 'Average Rating', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', delay: 0.2 },
  { icon: TrendingUp, value: 10, suffix: '+', label: 'Years Experience', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', delay: 0.3 },
  { icon: Smile, value: 98, suffix: '%', label: 'Satisfaction Rate', color: 'from-primary-500 to-primary-700', bg: 'bg-primary-50', delay: 0.4 },
  { icon: Clock, value: 3000, suffix: '+', label: 'Hours of Service', color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', delay: 0.5 },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const isDecimal = !Number.isInteger(value);
    const duration = 1500;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal ? +(eased * value).toFixed(1) : Math.floor(eased * value);
      setDisplay(current);
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);
  return <>{display}{suffix}</>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8FB 50%, #FFF0F5 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-badge">Our Achievements</span>
          <h2 className="section-heading text-gradient">Numbers That Speak</h2>
          <p className="section-subtitle">Over a decade of beauty excellence, thousands of happy clients, and countless transformations.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(({ icon: Icon, value, suffix, label, color, bg, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay, duration: 0.6 }}
              className="stat-card text-center group"
            >
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${color} bg-clip-text`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              </div>
              <div className={`text-3xl font-bold font-heading mb-1 bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
                <AnimatedNumber value={value} suffix={suffix} inView={inView} />
              </div>
              <div className="text-xs text-muted font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
