'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  { q: 'How do I book an appointment?', a: 'You can book online through our website, call us directly at +91 97519 72900, or WhatsApp us. Online booking is available 24/7 and you can choose your preferred service, staff member, and time slot.' },
  { q: 'What is your cancellation policy?', a: 'We require 24 hours advance notice for cancellations. Cancellations made within 24 hours may incur a 20% charge. No-shows are charged 50% of the service price. You can reschedule up to 2 hours before your appointment for free.' },
  { q: 'Do you offer group bookings for events?', a: 'Absolutely! We love hosting group events – bachelorette parties, baby showers, birthday celebrations, and corporate wellness days. Contact us for special group packages and exclusive event pricing.' },
  { q: 'What products do you use?', a: 'We use only premium, internationally certified brands including Wella, Schwarzkopf, Kérastase, and Forest Essentials. All products are cruelty-free, dermatologically tested, and safe for sensitive skin.' },
  { q: 'Is there parking available?', a: 'Yes! We have dedicated free parking for our clients in our building\'s basement. For longer services, valet parking is also available on weekends for a minimal charge.' },
  { q: 'Do you have services for men?', a: 'We offer several services for men including haircuts, scalp treatments, facials, massage, and grooming services. Call us to enquire about our full men\'s grooming menu.' },
  { q: 'Can I get a consultation before booking?', a: 'Absolutely! We offer complimentary 15-minute consultation calls for new clients. For bridal services, we recommend an in-person consultation at least 1 month before your wedding date.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and cash. We also accept EMI on bookings above ₹5,000. Our online payment system uses bank-grade 256-bit encryption for your security.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF8FB 100%)' }} id="faq">
      <div className="container-luxury max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-badge">FAQs</span>
          <h2 className="section-heading">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="section-subtitle">Have questions? We have answers. Find everything you need to know about our services and policies.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-luxury transition-all duration-300"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={open === i}
                id={`faq-btn-${i}`}
              >
                <span className="font-medium text-foreground pr-4">{q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-primary shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-border/50 pt-4">
                      {a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-muted mb-4">Still have questions? We're here to help!</p>
          <Link href="/contact" className="btn-luxury inline-flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Contact Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
