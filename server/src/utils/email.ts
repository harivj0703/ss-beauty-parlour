import nodemailer from 'nodemailer';
import { logger } from './logger';

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const portRaw = process.env.EMAIL_PORT || process.env.SMTP_PORT || '465';
  const port = parseInt(portRaw, 10);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    logger.warn('[EMAIL] WARNING: EMAIL_USER / EMAIL_PASS not set. Emails will NOT be sent. Configure these in Render environment variables.');
  }

  // port 465 = implicit SSL (secure:true), port 587 = STARTTLS (secure:false)
  const secure = port === 465;

  const config: any = {
    host,
    port,
    secure,
    tls: { rejectUnauthorized: false },
  };

  if (user && pass) {
    config.auth = { user, pass };
  }

  return nodemailer.createTransport(config);
};

const getEmailWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #FFF8FB; color: #2D2D2D; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(233,30,99,0.1); }
    .header { background: linear-gradient(135deg, #E91E63, #AD1457); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; }
    .logo-dot { width: 8px; height: 8px; background: #FFD700; border-radius: 50%; display: inline-block; margin: 0 4px; }
    .body { padding: 40px 36px; }
    .greeting { font-size: 20px; font-weight: 600; color: #E91E63; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #555; margin-bottom: 20px; }
    .card { background: linear-gradient(135deg, #FFF0F5, #FFF8FB); border: 1px solid #F8BBD0; border-radius: 14px; padding: 24px; margin: 24px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #FADADD; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #888; font-weight: 500; }
    .card-value { color: #2D2D2D; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #E91E63, #C2185B); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; margin: 20px 0; letter-spacing: 0.5px; }
    .footer { background: #2D2D2D; color: #aaa; text-align: center; padding: 28px; font-size: 13px; }
    .footer a { color: #E91E63; text-decoration: none; }
    .gold-line { height: 3px; background: linear-gradient(90deg, #FFD700, #FFA000, #FFD700); }
    .badge { display: inline-block; background: #E91E63; color: #fff; padding: 4px 12px; border-radius: 50px; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 SS Beauty Parlour <span class="logo-dot"></span></h1>
      <p>Where Beauty Meets Perfection</p>
    </div>
    <div class="gold-line"></div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SS Beauty Parlour. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="#">Unsubscribe</a> &nbsp;•&nbsp;
        <a href="#">Privacy Policy</a> &nbsp;•&nbsp;
        <a href="#">Contact Us</a>
      </p>
      <p style="margin-top: 12px; font-size: 11px; color: #666;">
        This email was sent by SS Beauty Parlour. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to: string, subject: string, html: string): Promise<any> => {
  console.log(`[EMAIL TRACE] ENTERED email.ts - sendEmail()`);
  console.log(`[EMAIL TRACE] RECIPIENT: ${to}`);
  console.log(`[EMAIL TRACE] SUBJECT: ${subject}`);
  try {
    const transporter = createTransporter();
    const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || '"SS Beauty Parlour" <ssbeautyparlour2528@gmail.com>';
    console.log(`[EMAIL TRACE] FROM ADDRESS: ${sender}`);
    
    console.log(`[EMAIL TRACE] ABOUT TO EXECUTE transporter.sendMail()`);
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
    });
    
    console.log(`[EMAIL TRACE] SMTP RESPONSE:`, info.response);
    console.log(`[EMAIL TRACE] MESSAGE ID:`, info.messageId);
    console.log(`[EMAIL TRACE] EMAIL SENT SUCCESSFULLY`);
    return info;
  } catch (error) {
    console.error(`[EMAIL TRACE] SMTP EXCEPTION THROWN:`, error);
    throw error; // DO NOT CATCH AND HIDE EXCEPTIONS
  }
};

export const sendWelcomeEmail = async (to: string, firstName: string): Promise<void> => {
  const content = `
    <div class="badge">Welcome to the Family! 💕</div>
    <div class="greeting">Hello, ${firstName}! 🌸</div>
    <p class="text">Welcome to <strong>SS Beauty Parlour</strong> – your new home for luxury beauty treatments! We're absolutely thrilled to have you with us.</p>
    <p class="text">Your beauty journey begins now. Explore our wide range of premium services – from glamorous bridal makeup to rejuvenating spa treatments. You deserve to look and feel your absolute best!</p>
    <div class="card">
      <div class="card-row"><span class="card-label">🎁 First Booking Offer</span><span class="card-value">10% OFF</span></div>
      <div class="card-row"><span class="card-label">🏷️ Use Code</span><span class="card-value">WELCOME10</span></div>
      <div class="card-row"><span class="card-label">⏰ Valid For</span><span class="card-value">30 Days</span></div>
    </div>
    <a href="${process.env.CLIENT_URL}/services" class="btn">Explore Services ✨</a>
    <p class="text">If you have any questions, our team is always here to help. We can't wait to make you feel gorgeous!</p>
    <p class="text">With love & beauty,<br><strong>The SS Beauty Parlour Team 💄</strong></p>
  `;
  await sendEmail(to, '💕 Welcome to SS Beauty Parlour!', getEmailWrapper(content, 'Welcome'));
};

export const sendBookingConfirmation = async (
  to: string,
  data: {
    appointmentId: string;
    serviceName: string;
    date: string;
    time: string;
    staffName: string;
    amount: number;
    customerName: string;
  }
): Promise<void> => {
  const content = `
    <div class="badge">Booking Confirmed! ✅</div>
    <div class="greeting">Hi, ${data.customerName}! 🌸</div>
    <p class="text">Great news! Your appointment at <strong>SS Beauty Parlour</strong> has been successfully confirmed. We're looking forward to pampering you!</p>
    <div class="card">
      <div class="card-row"><span class="card-label">🔖 Booking ID</span><span class="card-value">#${data.appointmentId.slice(-8).toUpperCase()}</span></div>
      <div class="card-row"><span class="card-label">📋 Service</span><span class="card-value">${data.serviceName}</span></div>
      <div class="card-row"><span class="card-label">📅 Date</span><span class="card-value">${data.date}</span></div>
      <div class="card-row"><span class="card-label">⏰ Time</span><span class="card-value">${data.time}</span></div>
      <div class="card-row"><span class="card-label">💆 Stylist</span><span class="card-value">${data.staffName}</span></div>
      <div class="card-row"><span class="card-label">💰 Amount</span><span class="card-value">₹${data.amount.toLocaleString('en-IN')}</span></div>
    </div>
    <p class="text">📍 <strong>Salon Address:</strong><br>Old Bus Stand Opposite, Chengam, Thiruvannamalai District, Tamilnadu</p>
    <p class="text">⚠️ <strong>Cancellation Policy:</strong><br>Please arrive 10 minutes before your appointment. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View My Booking 📱</a>
    <p class="text">See you soon! 💕<br><strong>SS Beauty Parlour Team</strong></p>
  `;
  await sendEmail(to, '✅ Booking Confirmed – SS Beauty Parlour', getEmailWrapper(content, 'Booking Confirmation'));
};

export const sendPasswordReset = async (to: string, resetLink: string): Promise<void> => {
  const content = `
    <div class="badge">Password Reset Request 🔐</div>
    <div class="greeting">Password Reset Request</div>
    <p class="text">We received a request to reset your SS Beauty Parlour account password. Click the button below to create a new password:</p>
    <a href="${resetLink}" class="btn">Reset My Password 🔐</a>
    <div class="card">
      <div class="card-row"><span class="card-label">⏰ Link expires in</span><span class="card-value">1 Hour</span></div>
    </div>
    <p class="text">If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account is safe.</p>
    <p class="text">For security, never share this link with anyone.</p>
    <p class="text">Stay beautiful,<br><strong>SS Beauty Parlour Team 💄</strong></p>
  `;
  await sendEmail(to, '🔐 Reset Your SS Beauty Parlour Password', getEmailWrapper(content, 'Password Reset'));
};

export const sendAppointmentReminder = async (
  to: string,
  data: { serviceName: string; date: string; time: string; customerName: string }
): Promise<void> => {
  const content = `
    <div class="badge">Appointment Reminder ⏰</div>
    <div class="greeting">Hi, ${data.customerName}! 🌸</div>
    <p class="text">Just a friendly reminder that your appointment at <strong>SS Beauty Parlour</strong> is tomorrow. We're excited to see you!</p>
    <div class="card">
      <div class="card-row"><span class="card-label">📋 Service</span><span class="card-value">${data.serviceName}</span></div>
      <div class="card-row"><span class="card-label">📅 Date</span><span class="card-value">${data.date}</span></div>
      <div class="card-row"><span class="card-label">⏰ Time</span><span class="card-value">${data.time}</span></div>
    </div>
    <p class="text">💡 <strong>Tips for your visit:</strong><br>
    • Arrive 10 minutes early<br>
    • Come with clean, dry hair (for hair services)<br>
    • Wear comfortable clothing</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Appointment Details 📱</a>
    <p class="text">See you tomorrow! 💕<br><strong>SS Beauty Parlour Team</strong></p>
  `;
  await sendEmail(to, '⏰ Appointment Reminder – Tomorrow at SS Beauty Parlour', getEmailWrapper(content, 'Reminder'));
};

export const sendCancellationEmail = async (
  to: string,
  data: { serviceName: string; date: string; amount: number; customerName: string }
): Promise<void> => {
  const content = `
    <div class="badge">Booking Cancelled</div>
    <div class="greeting">Hi, ${data.customerName}</div>
    <p class="text">We're sorry to hear that you've cancelled your appointment. Your booking for <strong>${data.serviceName}</strong> on <strong>${data.date}</strong> has been successfully cancelled.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">📋 Service</span><span class="card-value">${data.serviceName}</span></div>
      <div class="card-row"><span class="card-label">📅 Date</span><span class="card-value">${data.date}</span></div>
      <div class="card-row"><span class="card-label">💰 Refund Amount</span><span class="card-value">₹${data.amount.toLocaleString('en-IN')}</span></div>
      <div class="card-row"><span class="card-label">⏳ Refund Timeline</span><span class="card-value">5-7 Business Days</span></div>
    </div>
    <p class="text">We hope to see you again soon! Feel free to book another appointment whenever you're ready.</p>
    <a href="${process.env.CLIENT_URL}/booking" class="btn">Book Again 🌸</a>
    <p class="text">Take care,<br><strong>SS Beauty Parlour Team 💄</strong></p>
  `;
  await sendEmail(to, 'Booking Cancelled – SS Beauty Parlour', getEmailWrapper(content, 'Cancellation'));
};

// ── Admin Notification Emails ────────────────────────────────────────

export const sendAdminBookingNotification = async (
  data: {
    appointmentId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceName: string;
    packageName?: string;
    staffName: string;
    date: string;
    time: string;
    paymentStatus: string;
    specialNotes: string;
    bookingStatus: string;
  }
): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'ssbeautyparlour2528@gmail.com';
  const content = `
    <div class="badge">New Booking Received 📅</div>
    <div class="greeting">Hello, Admin!</div>
    <p class="text">A new appointment has been successfully booked at <strong>SS Beauty Parlour</strong>. Here are the details:</p>
    
    <div class="card">
      <div class="card-row"><span class="card-label">🔖 Booking ID</span><span class="card-value">#${data.appointmentId.slice(-8).toUpperCase()}</span></div>
      <div class="card-row"><span class="card-label">👤 Customer Name</span><span class="card-value">${data.customerName}</span></div>
      <div class="card-row"><span class="card-label">✉️ Customer Email</span><span class="card-value">${data.customerEmail}</span></div>
      <div class="card-row"><span class="card-label">📞 Customer Phone</span><span class="card-value">${data.customerPhone || 'N/A'}</span></div>
      <div class="card-row"><span class="card-label">📋 Service Name</span><span class="card-value">${data.serviceName}</span></div>
      ${data.packageName ? `<div class="card-row"><span class="card-label">🎁 Package</span><span class="card-value">${data.packageName}</span></div>` : ''}
      <div class="card-row"><span class="card-label">💆 Staff Assigned</span><span class="card-value">${data.staffName}</span></div>
      <div class="card-row"><span class="card-label">📅 Date</span><span class="card-value">${data.date}</span></div>
      <div class="card-row"><span class="card-label">⏰ Time</span><span class="card-value">${data.time}</span></div>
      <div class="card-row"><span class="card-label">💰 Payment Status</span><span class="card-value">${data.paymentStatus}</span></div>
      <div class="card-row"><span class="card-label">📝 Special Notes</span><span class="card-value">${data.specialNotes || 'None'}</span></div>
      <div class="card-row"><span class="card-label">⚡ Booking Status</span><span class="card-value">${data.bookingStatus}</span></div>
    </div>
    
    <a href="${process.env.CLIENT_URL || 'https://ss-beauty-parlour.vercel.app'}/admin/appointments" class="btn">View Booking on Admin Dashboard 🖥️</a>
  `;
  
  await sendEmail(adminEmail, 'New Appointment Booking', getEmailWrapper(content, 'New Booking Alert'));
};

export const sendAdminInquiryNotification = async (
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subject: string;
    message: string;
    submissionDate: string;
    ipAddress?: string;
  }
): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'ssbeautyparlour2528@gmail.com';
  const content = `
    <div class="badge" style="background:#FFA000;">New Customer Inquiry ✉️</div>
    <div class="greeting">Hello, Admin!</div>
    <p class="text">A new customer message has been received from the Contact Us form:</p>
    
    <div class="card">
      <div class="card-row"><span class="card-label">👤 Customer Name</span><span class="card-value">${data.customerName}</span></div>
      <div class="card-row"><span class="card-label">✉️ Email</span><span class="card-value">${data.customerEmail}</span></div>
      <div class="card-row"><span class="card-label">📞 Phone</span><span class="card-value">${data.customerPhone || 'N/A'}</span></div>
      <div class="card-row"><span class="card-label">📌 Subject</span><span class="card-value">${data.subject}</span></div>
      <div class="card-row"><span class="card-label">⏰ Submission Date</span><span class="card-value">${data.submissionDate}</span></div>
      ${data.ipAddress ? `<div class="card-row"><span class="card-label">🌐 IP Address</span><span class="card-value">${data.ipAddress}</span></div>` : ''}
    </div>
    
    <div class="card" style="background:#FFF;">
      <h4 style="color:#E91E63; margin-bottom:8px; font-size:13px;">MESSAGE:</h4>
      <p style="font-size:14px; line-height:1.6; color:#555; white-space:pre-wrap;">${data.message}</p>
    </div>
  `;
  
  await sendEmail(adminEmail, 'New Customer Inquiry', getEmailWrapper(content, 'Inquiry Alert'));
};
