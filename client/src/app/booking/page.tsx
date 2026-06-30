'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Check, ChevronRight, Calendar, User, ShoppingBag, Percent, ArrowLeft, Tag, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  duration: number;
}

interface Package {
  id: string;
  name: string;
  discountedPrice: number;
  duration: number;
}

interface Staff {
  id: string;
  user: { firstName: string; lastName: string; avatar: string };
}

interface Slot {
  time: string;
  datetime: string;
  available: boolean;
}

function BookingWizard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Booking step states
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Lists from backend
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Selection states
  const [bookingType, setBookingType] = useState<'service' | 'package'>('service');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    // Initial fetch of options
    Promise.all([
      api.get('/services'),
      api.get('/admin/packages'),
      api.get('/staff'),
    ]).then(([sRes, pRes, stRes]) => {
      setServices(sRes.data.data || []);
      setPackages(pRes.data.data || []);
      setStaff(stRes.data.data || []);
    }).catch(console.error);
  }, []);

  // Fetch slots when date or staff selection changes
  useEffect(() => {
    if (!selectedDate) return;
    const duration = bookingType === 'service'
      ? services.filter((s) => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.duration, 0)
      : packages.find((p) => p.id === selectedPackage)?.duration || 60;

    const queryParams = new URLSearchParams({
      date: selectedDate,
      duration: duration.toString(),
    });
    if (selectedStaff) queryParams.append('staffId', selectedStaff);

    api.get(`/appointments/slots?${queryParams.toString()}`)
      .then((res) => setSlots(res.data.data || []))
      .catch(() => setSlots([]));
  }, [selectedDate, selectedStaff, selectedServices, selectedPackage, bookingType, services, packages]);

  // Calculate pricing
  const subtotal = bookingType === 'service'
    ? services.filter((s) => selectedServices.includes(s.id)).reduce((sum, s) => sum + (s.discountedPrice ?? s.price), 0)
    : packages.find((p) => p.id === selectedPackage)?.discountedPrice || 0;

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, amount: subtotal });
      setAppliedCoupon(res.data.data);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to complete booking!');
      router.push('/login?redirect=/booking');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select an available slot');
      return;
    }

    setLoading(true);
    try {
      const apptBody = {
        bookingType: bookingType === 'service' ? 'SINGLE_SERVICE' : 'PACKAGE',
        serviceIds: bookingType === 'service' ? selectedServices : undefined,
        packageId: bookingType === 'package' ? selectedPackage : undefined,
        staffProfileId: selectedStaff || undefined,
        scheduledAt: selectedSlot.datetime,
        notes: notes || undefined,
        couponCode: appliedCoupon?.code || undefined,
      };

      const res = await api.post('/appointments', apptBody);
      toast.success('Appointment booked successfully! 🎉');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Try a different slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury max-w-4xl">
        {/* Progress Header */}
        <div className="text-center mb-10">
          <span className="section-badge">
            <Sparkles className="w-3.5 h-3.5" /> Booking Wizard
          </span>
          <h1 className="section-heading">Schedule Your <span className="text-gradient">Pampering</span></h1>
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6 max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step >= s ? 'bg-primary text-white' : 'glass text-muted'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full ${step > s ? 'bg-primary' : 'bg-border/60'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Panel */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Wizard Form */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-primary/10 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h2 className="font-heading font-bold text-xl">1. Select Treatments</h2>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => { setBookingType('service'); setSelectedPackage(''); }}
                      className={`flex-1 py-3.5 rounded-2xl font-semibold border ${
                        bookingType === 'service' ? 'bg-primary/5 border-primary text-primary' : 'border-border hover:bg-primary/5'
                      }`}
                    >
                      Individual Services
                    </button>
                    <button
                      onClick={() => { setBookingType('package'); setSelectedServices([]); }}
                      className={`flex-1 py-3.5 rounded-2xl font-semibold border ${
                        bookingType === 'package' ? 'bg-primary/5 border-primary text-primary' : 'border-border hover:bg-primary/5'
                      }`}
                    >
                      Curated Packages
                    </button>
                  </div>

                  {bookingType === 'service' ? (
                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                      {services.map((s) => {
                        const isSelected = selectedServices.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedServices((prev) =>
                                isSelected ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected ? 'bg-primary/5 border-primary' : 'border-border hover:bg-primary/5'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-sm">{s.name}</p>
                              <p className="text-xs text-muted mt-0.5">{s.duration} min</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                      {packages.map((p) => {
                        const isSelected = selectedPackage === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPackage(p.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected ? 'bg-primary/5 border-primary' : 'border-border hover:bg-primary/5'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-sm">{p.name}</p>
                              <p className="text-xs text-muted mt-0.5">{p.duration} min</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    disabled={(bookingType === 'service' && selectedServices.length === 0) || (bookingType === 'package' && !selectedPackage)}
                    onClick={() => setStep(2)}
                    className="btn-luxury w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h2 className="font-heading font-bold text-xl">2. Artist & Time</h2>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Select Artist (Optional)</label>
                    <select
                      id="booking-artist"
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className="input-luxury text-sm"
                    >
                      <option value="">Any Available Professional</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Select Date</label>
                    <input
                      id="booking-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-luxury"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-muted">Available Slots</label>
                      {slots.length === 0 ? (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> No slots available for this date. Try another date.
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                                !slot.available
                                  ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed'
                                  : selectedSlot?.time === slot.time
                                  ? 'bg-primary text-white border-primary'
                                  : 'glass hover:bg-primary/5 text-foreground'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-luxury-outline flex-1 py-3 text-sm">Back</button>
                    <button
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      className="btn-luxury flex-1 py-3 text-sm disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <h2 className="font-heading font-bold text-xl">3. Review & Confirm</h2>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Add Booking Notes (Optional)</label>
                    <textarea
                      id="booking-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requests or skincare details..."
                      rows={4}
                      className="input-luxury resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn-luxury-outline flex-1 py-3.5 text-sm">Back</button>
                    <button
                      disabled={loading}
                      onClick={handleBooking}
                      className="btn-luxury flex-1 py-3.5 text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? 'Confirming...' : 'Book Appointment Now'}
                    </button>
                  </div>
                </motion.div>
            </AnimatePresence>
          </div>

          {/* Selection Summary Sidebar Card */}
          <div className="lg:col-span-1 glass rounded-3xl p-5 border border-primary/10 h-fit space-y-4">
            <h2 className="font-heading font-bold text-lg border-b pb-2">Booking Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between font-medium">
                <span>Selected Treatments:</span>
                <span className="font-bold text-primary">
                  {bookingType === 'service' ? selectedServices.length : selectedPackage ? 1 : 0}
                </span>
              </div>
              {selectedDate && (
                <div className="flex justify-between text-xs text-muted">
                  <span>Date:</span>
                  <span>{selectedDate}</span>
                </div>
              )}
              {selectedSlot && (
                <div className="flex justify-between text-xs text-muted">
                  <span>Time Slot:</span>
                  <span>{selectedSlot.time}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingWizard />
    </React.Suspense>
  );
}
