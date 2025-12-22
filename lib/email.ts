import { Resend } from 'resend';

// Initialize Resend only if API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@besthotelrates.co.uk';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@besthotelrates.co.uk';

interface BookingEmailData {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  hotelLocation: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  ratePlan?: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalAmount: number;
  currency: string;
  isFreeCancellation?: boolean;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

function getNights(checkIn: Date, checkOut: Date): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const nights = getNights(data.checkIn, data.checkOut);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Best Hotel Rates</h1>
      <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Your booking is confirmed!</p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h2 style="color: #0f172a; font-size: 24px; margin: 0 0 10px 0; text-align: center;">Thank you, ${data.guestName}!</h2>
      <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0; text-align: center;">Your reservation has been confirmed.</p>

      <!-- Booking Reference -->
      <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
        <p style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0; font-family: monospace;">${data.bookingReference}</p>
      </div>

      <!-- Hotel Details -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #0f172a; font-size: 20px; margin: 0 0 5px 0;">${data.hotelName}</h3>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0;">📍 ${data.hotelLocation}</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Check-in</p>
            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${formatDate(data.checkIn)}</p>
            <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">From 3:00 PM</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Check-out</p>
            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${formatDate(data.checkOut)}</p>
            <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">By 11:00 AM</p>
          </div>
        </div>
      </div>

      <!-- Booking Summary -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-bottom: 25px;">
        <h4 style="color: #0f172a; font-size: 16px; margin: 0 0 15px 0;">Booking Summary</h4>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b;">Room Type</span>
          <span style="color: #0f172a; font-weight: 500;">${data.roomType}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b;">Duration</span>
          <span style="color: #0f172a; font-weight: 500;">${nights} night${nights > 1 ? 's' : ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b;">Rooms</span>
          <span style="color: #0f172a; font-weight: 500;">${data.numberOfRooms}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b;">Guests</span>
          <span style="color: #0f172a; font-weight: 500;">${data.numberOfGuests}</span>
        </div>
      </div>

      <!-- Total -->
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); border-radius: 12px; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 5px 0;">Total Amount Paid</p>
        <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;">${formatCurrency(data.totalAmount, data.currency)}</p>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://best-hotel-rates.vercel.app/api/bookings/${data.bookingId}/voucher" style="display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">📄 Download Voucher</a>
        <a href="https://best-hotel-rates.vercel.app/bookings/${data.bookingId}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">View My Booking</a>
      </div>
      
      ${data.isFreeCancellation ? `
      <!-- Free Cancellation Notice -->
      <div style="background: #dcfce7; border-radius: 12px; padding: 15px; margin-top: 25px; text-align: center;">
        <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 600;">✓ Free Cancellation Available</p>
        <p style="color: #166534; font-size: 12px; margin: 5px 0 0 0;">Cancel for free up to 24 hours before check-in</p>
      </div>
      ` : ''}

      <!-- Help Section -->
      <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">Need help? Contact us at <a href="mailto:support@besthotelrates.co.uk" style="color: #3b82f6;">support@besthotelrates.co.uk</a></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 Best Hotel Rates. All rights reserved.</p>
      <p style="color: #94a3b8; font-size: 11px; margin: 10px 0 0 0;">
        <a href="https://best-hotel-rates.vercel.app/terms" style="color: #94a3b8;">Terms</a> · 
        <a href="https://best-hotel-rates.vercel.app/privacy" style="color: #94a3b8;">Privacy</a> · 
        <a href="https://best-hotel-rates.vercel.app/contact" style="color: #94a3b8;">Contact</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.log('⚠️ Resend API key not configured, skipping confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `Booking Confirmed - ${data.hotelName} | ${data.bookingReference}`,
      html,
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error };
    }

    console.log('✅ Confirmation email sent:', result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotificationEmail(data: BookingEmailData) {
  const nights = getNights(data.checkIn, data.checkOut);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Notification</title>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: #22c55e; padding: 20px 30px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🎉 New Booking Received!</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Booking Reference</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Guest Name</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 500; text-align: right;">${data.guestName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Guest Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-align: right;">${data.guestEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Hotel</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 500; text-align: right;">${data.hotelName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Location</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-align: right;">${data.hotelLocation}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Dates</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-align: right;">${formatDate(data.checkIn)} - ${formatDate(data.checkOut)} (${nights} nights)</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Room Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-align: right;">${data.roomType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Rooms / Guests</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-align: right;">${data.numberOfRooms} room(s), ${data.numberOfGuests} guest(s)</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; color: #64748b; font-size: 18px;">Total Amount</td>
          <td style="padding: 15px 0; color: #22c55e; font-size: 24px; font-weight: 700; text-align: right;">${formatCurrency(data.totalAmount, data.currency)}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://best-hotel-rates.vercel.app/admin/bookings" style="display: inline-block; background: #1e3a5f; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600;">View in Admin</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.log('⚠️ Resend API key not configured, skipping admin notification');
      return { success: false, error: 'Email service not configured' };
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `💰 New Booking: ${data.bookingReference} - ${formatCurrency(data.totalAmount, data.currency)}`,
      html,
    });

    if (error) {
      console.error('Failed to send admin notification:', error);
      return { success: false, error };
    }

    console.log('✅ Admin notification sent:', result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Admin email send error:', error);
    return { success: false, error };
  }
}

interface CancellationEmailData {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  hotelLocation: string;
  checkIn: Date;
  checkOut: Date;
  refundAmount?: number;
  currency: string;
}

export async function sendCancellationEmail(data: CancellationEmailData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancellation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #991b1b 0%, #450a0a 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Best Hotel Rates</h1>
      <p style="color: #fca5a5; margin: 10px 0 0 0; font-size: 14px;">Booking Cancelled</p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Cancelled Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #fef2f2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>

      <h2 style="color: #0f172a; font-size: 24px; margin: 0 0 10px 0; text-align: center;">Booking Cancelled</h2>
      <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0; text-align: center;">Hi ${data.guestName}, your booking has been cancelled.</p>

      <!-- Booking Reference -->
      <div style="background: #fef2f2; border: 2px dashed #fecaca; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Cancelled Booking</p>
        <p style="color: #dc2626; font-size: 28px; font-weight: 700; margin: 0; font-family: monospace; text-decoration: line-through;">${data.bookingReference}</p>
      </div>

      <!-- Hotel Details -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
        <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 5px 0;">${data.hotelName}</h3>
        <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">📍 ${data.hotelLocation}</p>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          ${formatDate(data.checkIn)} → ${formatDate(data.checkOut)}
        </p>
      </div>

      ${data.refundAmount && data.refundAmount > 0 ? `
      <!-- Refund Info -->
      <div style="background: #dcfce7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
        <p style="color: #166534; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">💸 Refund Processing</p>
        <p style="color: #166534; font-size: 24px; font-weight: 700; margin: 0;">${formatCurrency(data.refundAmount, data.currency)}</p>
        <p style="color: #166534; font-size: 12px; margin: 10px 0 0 0;">Your refund will be processed within 5-10 business days</p>
      </div>
      ` : `
      <!-- No Refund -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">This was a non-refundable booking. No refund will be issued.</p>
      </div>
      `}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://best-hotel-rates.vercel.app" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Book Another Hotel</a>
      </div>

      <!-- Help Section -->
      <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">Questions? Contact us at <a href="mailto:support@besthotelrates.co.uk" style="color: #3b82f6;">support@besthotelrates.co.uk</a></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 Best Hotel Rates. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const resend = getResend();
    if (!resend) {
      console.log('⚠️ Resend API key not configured, skipping cancellation email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `Booking Cancelled - ${data.bookingReference}`,
      html,
    });

    if (error) {
      console.error('Failed to send cancellation email:', error);
      return { success: false, error };
    }

    console.log('✅ Cancellation email sent:', result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Cancellation email send error:', error);
    return { success: false, error };
  }
}

