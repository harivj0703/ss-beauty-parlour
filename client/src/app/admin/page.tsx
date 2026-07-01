'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCircle, Clock, MessageCircle, ChevronDown } from 'lucide-react';
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalStaff: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingBookings: number;
  todayBookings: number;
  completedToday: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'notifications' | 'messages'>('bookings');

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, router]);

  // Data fetch – runs only when user is confirmed ADMIN
  useEffect(() => {
    if (authLoading || !user || user.role !== 'ADMIN') return;

    setLoading(true);

    const fetchAll = async () => {
      try {
        // Appointments (required)
        const apptRes = await api.get('/appointments/all?limit=50');
        const appts: Appointment[] = apptRes.data.data || [];
        setAppointments(appts);

        // Stats (optional – fall back to computed)
        try {
          const statsRes = await api.get('/admin/stats');
          setStats(statsRes.data.data);
        } catch {
          // Fallback: compute from appointments
          setStats({
            totalUsers: 0,
            totalStaff: 0,
            totalAppointments: appts.length,
            totalRevenue: appts
              .filter((a) => a.status === 'COMPLETED')
              .reduce((sum, a) => sum + a.finalAmount, 0),
            pendingBookings: appts.filter((a) => a.status === 'PENDING').length,
            todayBookings: 0,
            completedToday: appts.filter((a) => a.status === 'COMPLETED').length,
          });
        }

        // Admin notifications (optional)
        try {
          const notifRes = await api.get('/notifications?limit=20');
          setNotifications(notifRes.data.data?.notifications || []);
        } catch {
          setNotifications([]);
        }

        // Contact messages (optional)
        try {
          const contactRes = await api.get('/admin/contact-messages?limit=20');
          setContacts(contactRes.data.data || []);
        } catch {
          setContacts([]);
        }
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user, authLoading]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch { /* silent */ }
  };

  const handleMarkContactRead = async (id: string) => {
    try {
      await api.patch(`/admin/contact-messages/${id}/read`);
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isRead: true } : c))
      );
    } catch { /* silent */ }
  };

  // Show spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Don't render content if not admin (redirect will happen from useEffect)
  if (!user || user.role !== 'ADMIN') return null;

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadContacts = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container-luxury max-w-6xl">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-6 glass rounded-3xl border border-primary/10">
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Dashboard 🖥️</h1>
            <p className="text-sm text-muted">
              Welcome, <strong>{user.firstName}</strong> — SS Beauty Parlour Management
            </p>
          </div>
          <span className="badge-primary px-4 py-2 font-bold rounded-full text-xs uppercase tracking-wider">
            ADMIN MODE
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Appointments', value: stats?.totalAppointments ?? appointments.length, color: 'text-primary' },
            { label: 'Pending', value: stats?.pendingBookings ?? pendingCount, color: 'text-yellow-600' },
            { label: 'Completed Today', value: stats?.completedToday ?? 0, color: 'text-green-700' },
            {
              label: 'Revenue (Paid)',
              value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
              color: 'text-secondary',
            },
          ].map((s) => (
            <div key={s.label} className="card-luxury p-5 bg-white text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(
            [
              { key: 'bookings', label: `Bookings (${appointments.length})` },
              { key: 'notifications', label: `Notifications ${unreadNotifs > 0 ? `(${unreadNotifs} new)` : ''}` },
              { key: 'messages', label: `Messages ${unreadContacts > 0 ? `(${unreadContacts} new)` : ''}` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'glass border border-border/60 hover:bg-primary/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="card-luxury p-6 bg-white">
            <h2 className="font-heading font-bold text-xl mb-6">All Customer Bookings</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="shimmer h-24 rounded-2xl" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted">No appointments found in the database.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-border/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-card transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                        <span className="text-xs text-muted">
                          {formatDateShort(app.scheduledAt)} at {formatTime(app.scheduledAt)}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-base text-foreground">
                        {app.items[0]?.service.name || 'Pamper Session'}
                        {app.items.length > 1 && ` (+${app.items.length - 1} more)`}
                      </h3>
                      <p className="text-sm text-primary mt-1">
                        Customer: <strong>{app.user?.firstName} {app.user?.lastName}</strong>{' '}
                        <span className="text-muted">({app.user?.email})</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Phone: {app.user?.phone || 'N/A'} | Artist:{' '}
                        {app.staffProfile
                          ? `${app.staffProfile.user.firstName} ${app.staffProfile.user.lastName}`
                          : 'Any Expert'}
                      </p>
                      {app.notes && (
                        <p className="text-xs italic text-gray-500 bg-gray-50 border border-gray-100 p-2 rounded-lg mt-2">
                          Notes: {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                      <div className="font-bold text-foreground">₹{app.finalAmount.toLocaleString('en-IN')}</div>
                      <div className="flex gap-2 flex-wrap">
                        {app.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(app.status) && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(app.status) && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
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
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="card-luxury p-6 bg-white">
            <h2 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Admin Notifications
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-16 rounded-xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-muted py-12">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      n.isRead ? 'border-border/40 bg-white' : 'border-primary/20 bg-primary/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${n.isRead ? 'text-foreground' : 'text-primary'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted mt-2">
                          {new Date(n.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkNotifRead(n.id)}
                          className="text-[10px] text-primary hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <div className="card-luxury p-6 bg-white">
            <h2 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" /> Customer Contact Messages
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-24 rounded-xl" />
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-center text-muted py-12">No contact messages yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-colors ${
                      c.isRead ? 'border-border/40 bg-white' : 'border-primary/20 bg-primary/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!c.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <p className="font-semibold text-sm">{c.subject}</p>
                        </div>
                        <p className="text-xs text-primary">
                          {c.name} · {c.email}{c.phone ? ` · ${c.phone}` : ''}
                        </p>
                        <p className="text-sm text-muted mt-2 leading-relaxed">{c.message}</p>
                        <p className="text-[10px] text-muted mt-2">
                          {new Date(c.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      {!c.isRead && (
                        <button
                          onClick={() => handleMarkContactRead(c.id)}
                          className="text-[10px] text-primary hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
