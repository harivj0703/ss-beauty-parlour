import { Request } from 'express';

// ── Auth & JWT ───────────────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// ── Pagination ───────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// ── API Response ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Service Types ────────────────────────────────────────────────────
export interface ServiceFilters {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  popular?: string;
  page?: string;
  limit?: string;
}

// ── Appointment Types ────────────────────────────────────────────────
export interface CreateAppointmentBody {
  serviceIds: string[];
  packageId?: string;
  staffProfileId?: string;
  scheduledAt: string;
  notes?: string;
  couponCode?: string;
}

export interface AppointmentSlot {
  time: string;
  available: boolean;
}

// ── Payment Types ────────────────────────────────────────────────────
export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

// ── Email Types ──────────────────────────────────────────────────────
export interface BookingEmailData {
  appointmentId: string;
  serviceName: string;
  date: string;
  time: string;
  staffName: string;
  amount: number;
  customerName: string;
}

export interface CancellationEmailData {
  serviceName: string;
  date: string;
  amount: number;
  customerName: string;
}

// ── Invoice Types ────────────────────────────────────────────────────
export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  services: Array<{ name: string; price: number; duration: number }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  issuedAt: Date;
  appointmentId: string;
  paymentMethod?: string;
}

// ── Dashboard Types ──────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalStaff: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingBookings: number;
  todayBookings: number;
  completedToday: number;
  cancelledToday: number;
}
