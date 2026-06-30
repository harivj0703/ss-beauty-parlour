'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Heart, ShieldCheck, HeartHandshake, Eye, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury max-w-5xl space-y-16">
        
        {/* Banner Section */}
        <div className="text-center">
          <span className="section-badge">Our Story</span>
          <h1 className="section-heading text-gradient font-heading">Where Beauty Meets Perfection</h1>
          <p className="section-subtitle">A heritage of luxury grooming, relaxation therapies and premium cosmetics in Bangalore.</p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative h-[380px] rounded-3xl overflow-hidden shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
              alt="Glow interior"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-5">
            <h2 className="font-heading font-bold text-3xl">Glow Beauty Studio</h2>
            <p className="text-sm text-muted leading-relaxed">
              Established in 2016, Glow Beauty Studio was founded on the philosophy that grooming is a form of self-care and rejuvenation. We create experiences that allow every client to celebrate their natural beauty.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Our salon features sterile private spaces, aromatherapy-infused treatment rooms, and highly personalized hair care diagnostics. We use only organic, non-comedogenic cosmetics to preserve and nourish your skin and hair.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="text-center flex-1 p-4 glass rounded-2xl border border-primary/10">
                <div className="text-xl font-bold text-primary">10k+</div>
                <div className="text-xs text-muted">Happy Clients</div>
              </div>
              <div className="text-center flex-1 p-4 glass rounded-2xl border border-primary/10">
                <div className="text-xl font-bold text-primary">15+</div>
                <div className="text-xs text-muted">Specialists</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <h2 className="font-heading font-bold text-2xl text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Hygienic Environment', desc: 'Surgical level sterilization on all metal tools and single-use supplies.' },
              { icon: HeartHandshake, title: 'Customer Delight', desc: 'Tailoring services based on custom skin patch tests and texture evaluations.' },
              { icon: Award, title: 'Premium Products Only', desc: 'Certified partnerships with top luxury haircare and cosmetics brands.' },
            ].map((val, idx) => (
              <div key={idx} className="p-6 card-luxury bg-white space-y-3">
                <val.icon className="w-8 h-8 text-primary" />
                <h3 className="font-bold text-lg">{val.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-primary text-center text-white space-y-4">
          <h2 className="font-heading text-3xl font-bold">Ready to Experience Glow?</h2>
          <p className="text-sm text-white/80 max-w-lg mx-auto">Book your first luxury session now and claim your flat 10% welcome discount.</p>
          <Link href="/booking" className="btn-gold inline-flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4" /> Book Appointment Now
          </Link>
        </div>

      </div>
    </div>
  );
}
