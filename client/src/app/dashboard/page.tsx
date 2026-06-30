'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, User, Phone, Edit3, Camera, MapPin, Eye, Bell, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatPrice, formatDateShort, formatTime, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AppointmentItem {
  service: { name: string; price: number };
}

interface Appointment {
  id: string;
  scheduledAt: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  notes?: string;
  items: AppointmentItem[];
  staffProfile?: { user: { firstName: string; lastName: string } };
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    api.get('/appointments/my')
      .then((r) => {
        setAppointments(r.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, router]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.post(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully');
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'CANCELLED' } : app))
      );
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury max-w-6xl">
        {/* User Welcome Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-6 glass rounded-3xl border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/20 bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Hello, {user?.firstName}! ✨</h1>
              <p className="text-sm text-muted">Manage your bookings, invoices, and beauty plans.</p>
            </div>
          </div>
          <Link href="/booking" className="btn-luxury px-6 py-3 text-sm">
            Book New Appointment
          </Link>
        </div>

        {/* Dashboard Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-luxury p-6 bg-white">
              <h2 className="font-heading font-bold text-lg mb-4 border-b pb-2">Your Profile</h2>
              <ul className="space-y-3.5 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted">Full Name</span>
                  <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </li>
                {user?.phone && (
                  <li className="flex justify-between">
                    <span className="text-muted">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-muted">Account Role</span>
                  <span className="badge-primary text-[10px] font-bold">{user?.role}</span>
                </li>
              </ul>
            </div>

            <div className="card-luxury p-6 bg-white">
              <h2 className="font-heading font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Notifications
              </h2>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs">
                  <p className="font-bold text-primary mb-1">📢 Welcome to SS Beauty Parlour</p>
                  <p className="text-muted leading-relaxed">Bookings, staff configuration and templates are configured under new name!</p>
                </div>
                <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 text-xs">
                  <p className="font-bold text-secondary mb-1">✨ Update Complete</p>
                  <p className="text-muted leading-relaxed">Contact details updated: 9751972900. Address: Chengam, Thiruvannamalai.</p>
                </div>
              </div>
            </div>

            <div className="card-luxury p-6 bg-white">
              <h2 className="font-heading font-bold text-lg mb-4 border-b pb-2">Account Stats</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-2xl font-bold text-primary">{appointments.length}</div>
                  <div className="text-xs text-muted">Total Bookings</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-2xl font-bold text-green-700">
                    {appointments.filter((a) => a.status === 'COMPLETED').length}
                  </div>
                  <div className="text-xs text-muted">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-luxury p-6 bg-white flex-1">
              <h2 className="font-heading font-bold text-xl mb-4">Upcoming & Past Appointments</h2>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="shimmer h-24 rounded-2xl" />
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted mb-4">No appointments booked yet.</p>
                  <Link href="/booking" className="btn-luxury px-6 py-2.5 text-xs">Book Appointment Now</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <motion.div
                      key={app.id}
                      className="p-5 rounded-2xl border border-border/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-card transition-shadow"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge-primary text-[10px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDateShort(app.scheduledAt)} at {formatTime(app.scheduledAt)}
                          </span>
                        </div>
                        <h3 className="font-heading font-semibold text-lg text-foreground">
                          {app.items[0]?.service.name || 'Pamper Session'}
                          {app.items.length > 1 && ` (+${app.items.length - 1} more)`}
                        </h3>
                        <p className="text-xs text-muted mt-1">
                          Artist: {app.staffProfile ? `${app.staffProfile.user.firstName} ${app.staffProfile.user.lastName}` : 'Assigned Expert'}
                        </p>
                      </div>

                      <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                        <div className="text-lg font-bold text-primary mb-2">
                          {formatPrice(app.finalAmount)}
                        </div>
                        <div className="flex gap-2">
                          {['PENDING', 'CONFIRMED'].includes(app.status) && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <Link
                            href={`/dashboard/appointments/${app.id}`}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
