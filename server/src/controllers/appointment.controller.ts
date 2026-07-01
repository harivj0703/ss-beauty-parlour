import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateAppointmentBody } from '../types';
import { sendBookingConfirmation, sendCancellationEmail, sendAdminBookingNotification } from '../utils/email';
import { generateInvoiceNumber } from '../utils/invoice';

const prisma = new PrismaClient();

// ── Available Slots ──────────────────────────────────────────────────
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  const { staffId, date, duration = '60' } = req.query as { staffId?: string; date: string; duration?: string };
  
  if (!date) {
    res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
    return;
  }

  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();

  // Salon working hours (9 AM to 8 PM)
  const startHour = 9;
  const endHour = 20;
  const slotDuration = parseInt(duration);

  // Get existing appointments for that day
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppts = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ['CANCELLED'] },
      ...(staffId && { staffProfileId: staffId }),
    },
    select: { scheduledAt: true, endTime: true, staffProfileId: true },
  });

  // Get staff availability
  let staffAvail = null;
  if (staffId) {
    staffAvail = await prisma.availability.findFirst({
      where: { staffProfileId: staffId, dayOfWeek },
    });
    if (staffAvail?.isOff) {
      res.json({ success: true, message: 'Staff not available on this day', data: [] });
      return;
    }
  }

  const slots: Array<{ time: string; datetime: string; available: boolean }> = [];
  const sStart = staffAvail ? parseInt(staffAvail.startTime.split(':')[0]) : startHour;
  const sEnd = staffAvail ? parseInt(staffAvail.endTime.split(':')[0]) : endHour;

  for (let h = sStart; h < sEnd; h++) {
    for (const min of [0, 30]) {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(h, min, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

      if (slotEnd.getHours() > sEnd) break;

      const isBooked = existingAppts.some((a) => {
        const aStart = new Date(a.scheduledAt);
        const aEnd = new Date(a.endTime);
        return slotStart < aEnd && slotEnd > aStart;
      });

      const isPast = slotStart <= new Date();

      slots.push({
        time: `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        datetime: slotStart.toISOString(),
        available: !isBooked && !isPast,
      });
    }
  }

  res.json({ success: true, message: 'Available slots', data: slots });
};

// ── Create Appointment ───────────────────────────────────────────────
export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log('[EMAIL TRACE] BOOKING REQUEST RECEIVED');
  console.log('[EMAIL TRACE] PAYLOAD:', JSON.stringify(req.body));
  
  const { serviceIds, packageId, staffProfileId, scheduledAt, notes, couponCode } =
    req.body as CreateAppointmentBody;

  if (!scheduledAt) {
    console.log('STEP 2: VALIDATION FAILED - scheduledAt missing');
    res.status(400).json({ success: false, message: 'Scheduled date/time is required' });
    return;
  }

  const scheduledDate = new Date(scheduledAt);

  // Fetch services to calculate amount
  let services: Array<{ id: string; name: string; price: number; duration: number }> = [];
  let pkg = null;
  let totalAmount = 0;

  if (packageId) {
    pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { packageServices: { include: { service: true } } },
    });
    if (!pkg) {
      console.log('STEP 2: VALIDATION FAILED - Package not found:', packageId);
      res.status(404).json({ success: false, message: 'Package not found' });
      return;
    }
    services = pkg.packageServices.map((ps) => ps.service);
    totalAmount = pkg.discountedPrice;
  } else if (serviceIds && serviceIds.length > 0) {
    const dbServices = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });
    services = dbServices;
    totalAmount = dbServices.reduce((sum, s) => sum + (s.discountedPrice ?? s.price), 0);
  }

  if (services.length === 0) {
    console.log('STEP 2: VALIDATION FAILED - No active services selected');
    res.status(400).json({ success: false, message: 'Please select at least one service' });
    return;
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const endTime = new Date(scheduledDate.getTime() + totalDuration * 60 * 1000);

  // Check coupon
  let couponDiscount = 0;
  let finalAmount = totalAmount;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && coupon.validUntil > new Date()) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = (totalAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      } else {
        couponDiscount = coupon.discountValue;
      }
      finalAmount = Math.max(0, totalAmount - couponDiscount);
    }
  }

  // Check slot availability
  if (staffProfileId) {
    console.log(`Checking slot availability for staff: ${staffProfileId}, start: ${scheduledDate.toISOString()}, end: ${endTime.toISOString()}`);
    const conflicting = await prisma.appointment.findFirst({
      where: {
        staffProfileId: staffProfileId,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
        OR: [
          {
            scheduledAt: { lt: endTime },
            endTime: { gt: scheduledDate }
          }
        ],
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    if (conflicting) {
      console.log(`STEP 2: SLOT CONFLICT FOUND! Existing booking ID: ${conflicting.id}`);
      res.status(409).json({ 
        success: false, 
        message: 'This time slot is already booked for the selected staff',
        conflicting: {
          id: conflicting.id,
          scheduledAt: conflicting.scheduledAt,
          endTime: conflicting.endTime,
          customerName: `${conflicting.user.firstName} ${conflicting.user.lastName}`
        }
      });
      return;
    }
  }

  // Assign any available staff if not specified
  let assignedStaffId = staffProfileId || null;
  if (!assignedStaffId) {
    const availableStaff = await prisma.staffProfile.findFirst({ where: { isAvailable: true } });
    assignedStaffId = availableStaff?.id || null;
  }

  console.log('STEP 2: VALIDATION PASSED. Preparing database insert transaction...');

  let appointment;
  try {
    appointment = await prisma.$transaction(async (tx) => {
      // 1. Create appointment
      const appt = await tx.appointment.create({
        data: {
          userId: req.user!.userId,
          staffProfileId: assignedStaffId,
          packageId: packageId || null,
          bookingType: packageId ? 'PACKAGE' : 'SINGLE_SERVICE',
          scheduledAt: scheduledDate,
          endTime,
          notes: notes || null,
          totalAmount,
          discountAmount: 0,
          couponCode: couponCode || null,
          couponDiscount,
          finalAmount,
          items: {
            create: services.map((s) => ({
              serviceId: s.id,
              price: s.price,
              duration: s.duration,
            })),
          },
        },
        include: {
          items: { include: { service: true } },
          staffProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      });

      console.log('STEP 3: APPOINTMENT CREATED IN DB:', appt.id);

      // 2. Create payment record
      await tx.payment.create({
        data: {
          appointmentId: appt.id,
          userId: req.user!.userId,
          amount: finalAmount,
          method: 'STRIPE',
          status: 'PENDING',
        },
      });

      // 3. Create invoice
      const invoiceNumber = generateInvoiceNumber();
      await tx.invoice.create({
        data: {
          invoiceNumber,
          appointmentId: appt.id,
          userId: req.user!.userId,
          amount: totalAmount,
          tax: 0,
          discount: couponDiscount,
          total: finalAmount,
        },
      });

      // 4. Create customer notification
      await tx.notification.create({
        data: {
          userId: req.user!.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed! 🌸',
          message: `Your appointment for ${services[0]?.name} has been confirmed.`,
          data: { appointmentId: appt.id },
        },
      });

      // 4.b Find Admin user to record a dashboard notification for them
      const adminUser = await tx.user.findFirst({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true }
      });
      if (adminUser) {
        // Fetch customer name for notification text
        const customer = await tx.user.findUnique({
          where: { id: req.user!.userId },
          select: { firstName: true, phone: true }
        });
        const customerName = customer ? customer.firstName : 'Client';
        const customerPhone = customer ? (customer.phone || 'N/A') : 'N/A';
        const dateStr = scheduledDate.toLocaleDateString('en-IN');
        const timeStr = scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        await tx.notification.create({
          data: {
            userId: adminUser.id,
            type: 'GENERAL',
            title: 'New Booking Received',
            message: `Customer: ${customerName} (Phone: ${customerPhone}), Service: ${services[0]?.name}, Date: ${dateStr}, Time: ${timeStr}, Status: PENDING`,
            data: { appointmentId: appt.id }
          }
        });
        console.log('STEP 4: ADMIN DASHBOARD NOTIFICATION CREATED');
      }

      return appt;
    });
    console.log('[EMAIL TRACE] APPOINTMENT CREATED (Transaction committed)');
  } catch (dbError: any) {
    console.error('[EMAIL TRACE] DATABASE TRANSACTION EXCEPTION:', dbError);
    res.status(500).json({ success: false, message: 'Booking failed. Try a different slot.' });
    return;
  }

  // 5. Send confirmation emails asynchronously
  prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, email: true, firstName: true, phone: true } })
    .then(async (user) => {
      if (user && appointment) {
        console.log(`[EMAIL TRACE] Customer ID: ${user.id}`);
        console.log(`[EMAIL TRACE] Customer Name: ${user.firstName}`);
        console.log(`[EMAIL TRACE] Customer Email: ${user.email}`);
        console.log(`[EMAIL TRACE] Booking ID: ${appointment.id}`);

        const staffName = appointment.staffProfile
          ? `${appointment.staffProfile.user.firstName} ${appointment.staffProfile.user.lastName}`
          : 'Our Expert';
        
        const dateStr = scheduledDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const serviceNames = services.map((s) => s.name).join(', ');

        console.log('STEP 5: DISPATCHING ASYNCHRONOUS EMAILS');

        console.log(`[EMAIL TRACE] CALLING sendBookingConfirmationEmail() for CUSTOMER: ${user.email}`);

        // 5.a Send confirmation email to Customer
        await sendBookingConfirmation(user.email, {
          appointmentId: appointment.id,
          serviceName: serviceNames,
          date: dateStr,
          time: timeStr,
          staffName,
          amount: finalAmount,
          customerName: user.firstName,
        }).then(() => console.log('[EMAIL TRACE] Customer Booking Email Sent SUCCESS'))
          .catch(err => console.error('[EMAIL TRACE] Customer Booking Email FAILED:', err));

        console.log('[EMAIL TRACE] CALLING sendAdminBookingNotification() for ADMIN');
        
        // 5.b Send booking alert email to Admin
        await sendAdminBookingNotification({
          appointmentId: appointment.id,
          customerName: user.firstName,
          customerEmail: user.email,
          customerPhone: user.phone || '',
          serviceName: serviceNames,
          packageName: pkg ? pkg.name : undefined,
          staffName,
          date: dateStr,
          time: timeStr,
          paymentStatus: 'PENDING',
          specialNotes: notes || '',
          bookingStatus: 'PENDING',
        }).then(() => console.log('[EMAIL TRACE] Admin Booking Email Sent SUCCESS'))
          .catch(err => console.error('[EMAIL TRACE] Admin Booking Email FAILED:', err));
      } else {
        console.warn('[EMAIL TRACE] SKIPPED EMAIL SENDING - user or appointment is null', { userExists: !!user, appointmentExists: !!appointment });
      }
    })
    .catch((emailErr) => {
      console.error('[EMAIL TRACE] TOP LEVEL ASYNC FLOW EXCEPTION:', emailErr);
    });

  console.log('[EMAIL TRACE] RETURNING HTTP 201 SUCCESS RESPONSE TO CLIENT');
  res.status(201).json({ success: true, message: 'Appointment booked successfully! 🎉', data: appointment });
  return;
};

// ── Get My Appointments ──────────────────────────────────────────────
export const getMyAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '10');
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = { userId: req.user!.userId };
  if (status) where.status = status;

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledAt: 'desc' },
      include: {
        items: { include: { service: { select: { name: true, price: true } } } },
        staffProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({
    success: true,
    message: 'My appointments fetched',
    data: appointments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

// ── Get Today Appointments ───────────────────────────────────────────
export const getTodayAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where: Record<string, unknown> = {
    scheduledAt: { gte: startOfDay, lte: endOfDay },
  };

  // If user is Staff, return only their appointments
  if (req.user!.role === 'STAFF') {
    const staff = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
    if (staff) where.staffProfileId = staff.id;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      items: { include: { service: { select: { name: true } } } },
    },
  });

  res.json({ success: true, message: 'Today appointments fetched', data: appointments });
};

// ── Get Appointment By ID ───────────────────────────────────────────
export const getAppointmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true } },
      staffProfile: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
      items: { include: { service: true } },
      payment: true,
      invoice: true,
      review: true,
    },
  });

  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }

  // Authorize check: ADMIN, STAFF, or the Customer who owns it
  if (
    req.user!.role !== 'ADMIN' &&
    req.user!.userId !== appointment.userId &&
    (req.user!.role !== 'STAFF' || appointment.staffProfile?.userId !== req.user!.userId)
  ) {
    res.status(403).json({ success: false, message: 'Unauthorized access to appointment details' });
    return;
  }
  res.json({ success: true, message: 'Appointment fetched', data: appointment });
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: req.user!.userId },
    include: { items: { include: { service: true } }, payment: true },
  });

  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }
  if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
    res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status.toLowerCase()} appointment` });
    return;
  }

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { email: true, firstName: true } });
  if (user) {
    await sendCancellationEmail(user.email, {
      serviceName: appointment.items[0]?.service?.name || 'Service',
      date: appointment.scheduledAt.toLocaleDateString('en-IN'),
      amount: appointment.finalAmount,
      customerName: user.firstName,
    }).catch(() => {});
  }

  await prisma.notification.create({
    data: {
      userId: req.user!.userId,
      type: 'BOOKING_CANCELLED',
      title: 'Appointment Cancelled',
      message: `Your appointment has been cancelled.`,
    },
  });

  res.json({ success: true, message: 'Appointment cancelled successfully' });
};

export const rescheduleAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { scheduledAt } = req.body;

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: req.user!.userId },
    include: { items: true },
  });
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }

  const totalDuration = appointment.items.reduce((sum, i) => sum + i.duration, 0);
  const newStart = new Date(scheduledAt);
  const newEnd = new Date(newStart.getTime() + totalDuration * 60 * 1000);

  await prisma.appointment.update({
    where: { id },
    data: { scheduledAt: newStart, endTime: newEnd, status: 'CONFIRMED' },
  });

  res.json({ success: true, message: 'Appointment rescheduled' });
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.user = { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] };
  }

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: { include: { service: { select: { name: true } } } },
        staffProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({
    success: true,
    message: 'All appointments fetched',
    data: appointments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  res.json({ success: true, message: 'Appointment status updated', data: appointment });
};
