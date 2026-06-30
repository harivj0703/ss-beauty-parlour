import { InvoiceData } from '../types';

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `GBS-${year}-${random}`;
};

export const calculateTax = (
  amount: number,
  taxRate: number = 18
): { tax: number; total: number } => {
  const tax = Math.round((amount * taxRate) / 100 * 100) / 100;
  return { tax, total: Math.round((amount + tax) * 100) / 100 };
};

export const formatCurrency = (
  amount: number,
  currency: string = 'INR'
): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const servicesRows = data.services
    .map(
      (s) => `
      <tr>
        <td style="padding:12px 16px; border-bottom:1px solid #fce4ec; color:#444;">${s.name}</td>
        <td style="padding:12px 16px; border-bottom:1px solid #fce4ec; color:#444; text-align:center;">${s.duration} min</td>
        <td style="padding:12px 16px; border-bottom:1px solid #fce4ec; color:#444; text-align:right; font-weight:600;">${formatCurrency(s.price)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #2D2D2D; }
    .invoice { max-width: 750px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand h1 { font-size: 28px; color: #E91E63; font-weight: 800; }
    .brand p { color: #888; font-size: 13px; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 24px; color: #2D2D2D; font-weight: 700; letter-spacing: 2px; }
    .invoice-meta p { color: #888; font-size: 13px; margin-top: 4px; }
    .gold-line { height: 3px; background: linear-gradient(90deg, #E91E63, #FFD700); border-radius: 2px; margin: 24px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .info-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #E91E63; margin-bottom: 10px; }
    .info-block p { font-size: 14px; color: #444; line-height: 1.8; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: linear-gradient(135deg, #E91E63, #AD1457); }
    thead th { padding: 14px 16px; text-align: left; color: #fff; font-size: 13px; font-weight: 600; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
    .total-row.grand { border-top: 2px solid #E91E63; margin-top: 8px; padding-top: 14px; font-size: 18px; font-weight: 700; color: #E91E63; }
    .footer { margin-top: 48px; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #fce4ec; padding-top: 24px; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; border-radius: 50px; padding: 4px 16px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
  </style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="brand">
      <h1>🌸 Glow Beauty Studio</h1>
      <p>Where Beauty Meets Perfection</p>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p>#${data.invoiceNumber}</p>
      <p>Issued: ${new Date(data.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
  <div class="gold-line"></div>
  <div class="info-grid">
    <div class="info-block">
      <h3>Billed To</h3>
      <p><strong>${data.customerName}</strong><br>${data.customerEmail}${data.customerPhone ? `<br>${data.customerPhone}` : ''}</p>
    </div>
    <div class="info-block">
      <h3>From</h3>
      <p><strong>Glow Beauty Studio</strong><br>your-address@city.com<br>+91 98765 43210</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th style="text-align:center;">Duration</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${servicesRows}</tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${formatCurrency(data.subtotal)}</span></div>
    ${data.discount > 0 ? `<div class="total-row"><span>Discount</span><span style="color:#e53935;">-${formatCurrency(data.discount)}</span></div>` : ''}
    <div class="total-row"><span>GST (18%)</span><span>${formatCurrency(data.tax)}</span></div>
    <div class="total-row grand"><span>Total Paid</span><span>${formatCurrency(data.total)}</span></div>
  </div>
  <div style="margin-top:32px;"><span class="badge">✓ Payment Successful – ${data.paymentMethod || 'Online'}</span></div>
  <div class="footer">
    <p>Thank you for choosing Glow Beauty Studio! 💕</p>
    <p style="margin-top:8px;">This is a computer-generated invoice and requires no signature.</p>
  </div>
</div>
</body>
</html>
  `;
};
