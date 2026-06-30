'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Calendar, Phone, Sparkles } from 'lucide-react';

export default function FloatingElements() {
  const [chatOpen, setChatOpen] = useState(false);
  const whatsappNumber = '+919751972900';
  const whatsappMsg = 'Hello! I would like to book an appointment at SS Beauty Parlour.';

  return (
    <>
      {/* Floating Book Now Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-24 right-5 z-40 hidden md:block"
      >
        <Link
          href="/booking"
          className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-semibold shadow-luxury-xl transition-all duration-300 hover:scale-105 hover:shadow-glow"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </Link>
      </motion.div>

      {/* WhatsApp Chat Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        className="fixed bottom-5 right-5 z-50"
      >
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-72 glass rounded-2xl shadow-luxury-xl border border-primary/10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">SS Beauty Parlour</p>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online – Reply in minutes
                    </p>
                  </div>
                </div>
              </div>
              {/* Chat bubble */}
              <div className="p-4 bg-white/90">
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-gray-700 mb-4">
                  👋 Hi! Welcome to SS Beauty Parlour. How can we help you today?
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+919751972900"
                  className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl text-primary text-sm font-semibold border border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call Us Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-luxury-xl transition-all duration-300 hover:scale-110"
          style={{ background: chatOpen ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#25D366' }}
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {chatOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Cookie Consent */}
      <CookieConsent />
    </>
  );
}

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 3 }}
      className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 lg:p-4"
    >
      <div className="max-w-3xl mx-auto glass rounded-2xl shadow-luxury-xl border border-primary/10 p-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-foreground/80 flex-1 text-center sm:text-left">
          🍪 We use cookies to enhance your experience. By continuing to use our site, you agree to our{' '}
          <Link href="/cookies" className="text-primary underline">Cookie Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShow(false)} className="px-4 py-2 text-xs font-medium border border-border rounded-full hover:bg-primary/5 transition-all">
            Decline
          </button>
          <button onClick={accept} className="px-4 py-2 text-xs font-medium text-white rounded-full transition-all" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
            Accept All
          </button>
        </div>
      </div>
    </motion.div>
  );
}
