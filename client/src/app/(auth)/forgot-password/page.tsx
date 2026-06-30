'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset link sent! Please check your email.');
    } catch {
      toast.error('Could not send reset link. Verify email and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="glass rounded-3xl p-8 shadow-luxury-xl border border-primary/10">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading text-3xl font-bold mb-2">Forgot Password</h1>
                <p className="text-sm text-muted">Enter your email to receive a password reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="input-luxury pl-11"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-luxury w-full py-3.5 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="font-heading text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-sm text-muted mb-6">
                We have sent password recovery instructions to <span className="font-semibold">{email}</span>.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Resend email
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center">
            <Link href="/login" className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
