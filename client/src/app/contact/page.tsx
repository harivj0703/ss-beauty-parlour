'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setLoading(true);
    try {
      await api.post('/contact', { name, email, phone, subject, message });
      toast.success('🌸 Your message has been sent successfully! We will get back to you shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-badge">Get in touch</span>
          <h1 className="section-heading">Connect <span className="text-gradient">With Us</span></h1>
          <p className="section-subtitle">Have questions about our services or need assistance? Drop us a message.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="glass rounded-3xl p-6 border border-primary/10 space-y-6">
            <h2 className="font-heading font-bold text-2xl mb-4">Contact Information</h2>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Call Us Directly</p>
                  <p className="text-sm text-muted">9751972900</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Email Us</p>
                  <p className="text-sm text-muted">ssbeautyparlour2528@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Visit Salon</p>
                  <p className="text-sm text-muted leading-relaxed">Old Bus Stand Opposite, Chengam, Thiruvannamalai District, Tamilnadu</p>
                </div>
              </li>
            </ul>

            <div className="pt-4 border-t border-border/50">
              <h3 className="font-semibold text-sm mb-3">Salon Timings</h3>
              <ul className="space-y-1.5 text-xs text-muted">
                <li className="flex justify-between"><span>Mon - Fri</span><span>9:00 AM - 8:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span><span>9:00 AM - 9:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span><span>10:00 AM - 6:00 PM</span></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 glass rounded-3xl p-8 border border-primary/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="input-luxury"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-luxury"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Phone Number</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Booking Inquiry"
                    className="input-luxury"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you are looking for..."
                  rows={5}
                  className="input-luxury resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury w-full py-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Message...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
