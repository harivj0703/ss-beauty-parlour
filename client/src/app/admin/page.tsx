'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, FileText, Bell, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDateShort, formatTime, getStatusColor } from '@/lib/utils';
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
  user: { firstName: string; lastName: string; email: string; phone?: string };
  items: AppointmentItem[];
  staffProfile?: { user: { firstName: string; lastName: string } };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, completed: 0, pending: 0, revenue: 0 });
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    // Load admin statistics & appointments
    Promise.all([
      api.get('/appointments/all'),
      api.get('/admin/stats').catch(() => ({ data: { data: null } }))
    ])
      .then(([apptsRes, statsRes]) => {
        const appts = apptsRes.data.data || [];
        setAppointments(appts);
        
        // Calculate basic stats fallback if stats API is empty
        const completed = appts.filter((a: any) => a.status === 'COMPLETED').length;
        const pending = appts.filter((a: any) => a.status === 'PENDING').length;
        const revenue = appts.reduce((sum: number, a: any) => sum + (a.status === 'COMPLETED' ? a.finalAmount : 0), 0);
        
        setStats(statsRes.data.data || {
          totalBookings: appts.length,
          completed,
          pending,
          revenue
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, router]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Booking status updated to ${status}`);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury max-w-6xl">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-6 glass rounded-3xl border border-primary/10">
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Management Dashboard 🖥️</h1>
            <p className="text-sm text-muted">Viewing all system appointments, messages, and settings.</p>
          </div>
          <span className="badge-primary px-4 py-2 font-bold rounded-full text-xs">ADMIN MODE: SILAMBU</span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="card-luxury p-5 bg-white text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
            <div className="text-xs text-muted mt-1">Total Appointments</div>
          </div>
          <div className="card-luxury p-5 bg-white text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted mt-1">Pending Status</div>
          </div>
          <div className="card-luxury p-5 bg-white text-center">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-xs text-muted mt-1">Completed Status</div>
          </div>
          <div className="card-luxury p-5 bg-white text-center">
            <div className="text-2xl font-bold text-secondary">₹{stats.revenue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted mt-1">Total Revenue</div>
          </div>
        </div>

        {/* Appointments Table List */}
        <div className="card-luxury p-6 bg-white">
          <h2 className="font-heading font-bold text-xl mb-6">Customer Bookings List</h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shimmer h-24 rounded-2xl" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">No appointments found in the system database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => (
                <motion.div
                  key={app.id}
                  className="p-5 rounded-2xl border border-border/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-card transition-shadow"
                >
                  <div className="flex-1">
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
                    <p className="text-sm text-primary mt-1">
                      Customer: <strong>{app.user?.firstName} {app.user?.lastName}</strong> ({app.user?.email})
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Phone: {app.user?.phone || 'N/A'} | Artist: {app.staffProfile ? `${app.staffProfile.user.firstName} ${app.staffProfile.user.lastName}` : 'Assigned Expert'}
                    </p>
                    {app.notes && (
                      <p className="text-xs italic text-gray-500 bg-gray-50 border border-gray-100 p-2.5 rounded-lg mt-2.5">
                        Notes: {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                    <div className="text-right font-bold text-foreground mb-1">
                      ₹{app.finalAmount}
                    </div>
                    <div className="flex gap-2">
                      {app.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(app.status) && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(app.status) && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
