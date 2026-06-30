'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  { id: 1, name: 'Priya Sharma', role: 'Bride', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=E91E63&color=fff&size=100', rating: 5, text: 'My wedding day was absolutely perfect! Meera did an incredible job with my bridal makeup. I felt like a queen. The HD makeup lasted all 10 hours and looked flawless in every photo. Highly recommend Glow Beauty Studio for bridal services!', service: 'Bridal Makeup' },
  { id: 2, name: 'Anjali Reddy', role: 'Regular Customer', avatar: 'https://ui-avatars.com/api/?name=Anjali+Reddy&background=C2185B&color=fff&size=100', rating: 5, text: 'I\'ve been coming to Glow Beauty Studio for 3 years now and the quality never disappoints! Anita\'s keratin treatment completely transformed my frizzy hair. Now I get compliments every day. The ambiance is so luxurious too!', service: 'Keratin Treatment' },
  { id: 3, name: 'Meena Krishnan', role: 'Working Professional', avatar: 'https://ui-avatars.com/api/?name=Meena+Krishnan&background=AD1457&color=fff&size=100', rating: 5, text: 'The skin brightening facial was absolutely amazing! Sneha was so thorough in her consultation and the results were visible in just one session. My skin feels so soft and radiant. Will definitely be back monthly!', service: 'Skin Brightening Facial' },
  { id: 4, name: 'Kavitha Nair', role: 'Entrepreneur', avatar: 'https://ui-avatars.com/api/?name=Kavitha+Nair&background=880E4F&color=fff&size=100', rating: 5, text: 'The Spa Retreat Package was worth every penny! The aromatherapy massage melted away all my stress. The studio is impeccably clean and the staff is so professional. This is my go-to relaxation spot now.', service: 'Spa Retreat Package' },
  { id: 5, name: 'Deepika Iyer', role: 'Teacher', avatar: 'https://ui-avatars.com/api/?name=Deepika+Iyer&background=E91E63&color=fff&size=100', rating: 5, text: 'Came for my sister\'s birthday with the Glow Package and we both absolutely loved it! The manicure and pedicure were so relaxing. The staff is warm, friendly and super skilled. Already booked our next appointment!', service: 'Glow Package' },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [auto]);

  const prev = () => { setAuto(false); setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length); };
  const next = () => { setAuto(false); setCurrent((p) => (p + 1) % testimonials.length); };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8FB 100%)' }}>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="section-badge">Testimonials</span>
          <h2 className="section-heading">
            What Our{' '}
            <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="section-subtitle">Real experiences from our beautiful community of loyal clients.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl p-8 md:p-12 shadow-luxury-lg border border-primary/10 relative"
            >
              <Quote className="absolute top-6 right-8 w-16 h-16 text-primary/10" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 italic font-light">
                "{testimonials[current].text}"
              </p>

              <div className="flex items-center gap-4">
                <Image
                  src={testimonials[current].avatar}
                  alt={testimonials[current].name}
                  width={60}
                  height={60}
                  className="rounded-full ring-4 ring-primary/20"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                  <p className="text-sm text-muted">{testimonials[current].role}</p>
                  <span className="badge-primary text-[10px] mt-1">{testimonials[current].service}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={prev} className="w-12 h-12 rounded-full glass border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAuto(false); setCurrent(i); }}
                  className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-primary/25'}`}
                />
              ))}
            </div>

            <button onClick={next} className="w-12 h-12 rounded-full glass border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
