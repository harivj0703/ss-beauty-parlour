'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Star, Instagram, Award } from 'lucide-react';
import api from '@/lib/api';

interface Staff {
  id: string;
  bio: string;
  specializations: string[];
  rating: number;
  experience: number;
  user: { firstName: string; lastName: string; avatar: string };
}

const fallbackStaff: Staff[] = [
  { id: '1', bio: 'Master hair stylist with 8 years of experience in creative cuts and color.', specializations: ['Hair Styling', 'Keratin', 'Coloring'], rating: 4.9, experience: 8, user: { firstName: 'Anita', lastName: 'Kapoor', avatar: 'https://ui-avatars.com/api/?name=Anita+Kapoor&background=E91E63&color=fff&size=200' } },
  { id: '2', bio: 'Certified skin specialist who transforms skin with advanced facial treatments.', specializations: ['Facials', 'Skin Care', 'Anti-Aging'], rating: 4.8, experience: 5, user: { firstName: 'Sneha', lastName: 'Reddy', avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=C2185B&color=fff&size=200' } },
  { id: '3', bio: 'Award-winning makeup artist with 500+ bridal transformations across India.', specializations: ['Bridal Makeup', 'HD Makeup', 'Airbrush'], rating: 5.0, experience: 10, user: { firstName: 'Meera', lastName: 'Patel', avatar: 'https://ui-avatars.com/api/?name=Meera+Patel&background=AD1457&color=fff&size=200' } },
  { id: '4', bio: 'Spa specialist trained in Swedish and deep tissue massage techniques.', specializations: ['Massage', 'Aromatherapy', 'Body Spa'], rating: 4.9, experience: 7, user: { firstName: 'Divya', lastName: 'Nair', avatar: 'https://ui-avatars.com/api/?name=Divya+Nair&background=880E4F&color=fff&size=200' } },
];

export default function OurExperts() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    api.get('/staff').then((r) => setStaff(r.data.data || [])).catch(() => setStaff([]));
  }, []);

  const displayStaff = staff.length > 0 ? staff : fallbackStaff;

  return (
    <section ref={ref} className="py-20 bg-white" id="experts">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="section-badge">Our Team</span>
          <h2 className="section-heading">
            Meet Our{' '}
            <span className="text-gradient">Expert Artists</span>
          </h2>
          <p className="section-subtitle">
            Our talented team of beauty professionals are dedicated to making you look and feel your absolute best.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStaff.slice(0, 4).map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="card-luxury text-center p-6 overflow-hidden">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(233,30,99,0.04), rgba(248,187,208,0.08))' }} />

                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                    <Image
                      src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}+${member.user.lastName}&background=E91E63&color=fff&size=200`}
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                </div>

                <h3 className="font-heading font-semibold text-lg mb-1">{member.user.firstName} {member.user.lastName}</h3>

                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < Math.round(member.rating) ? 'fill-accent text-accent' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                  <span className="text-xs text-muted ml-1">{member.rating.toFixed(1)}</span>
                </div>

                <p className="text-xs text-muted mb-4 line-clamp-2">{member.bio}</p>

                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {member.specializations.slice(0, 3).map((spec) => (
                    <span key={spec} className="badge-primary text-[10px]">{spec}</span>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-muted pt-3 border-t border-border">
                  <span>{member.experience}+ yrs exp</span>
                  <a href="#" className="text-pink-500 hover:text-primary transition-colors">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/about#team" className="btn-luxury-outline">
            Meet the Full Team
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
