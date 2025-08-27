import { MailService } from '@sendgrid/mail';
import type { Booking } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateBookingConfirmationEmail(booking: Booking): string {
  const checkinDate = new Date(booking.checkinDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkoutDate = new Date(booking.checkoutDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nights = Math.ceil((new Date(booking.checkoutDate).getTime() - new Date(booking.checkinDate).getTime()) / (1000 * 60 * 60 * 24));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - LuxeStay</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .booking-card { background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #3b82f6; }
        .booking-detail { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .label { font-weight: 600; color: #475569; }
        .value { color: #1e293b; }
        .total { font-size: 20px; font-weight: bold; color: #3b82f6; border-bottom: none !important; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 30px; text-align: center; }
        .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .contact-info { margin: 20px 0; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏖️ LuxeStay</div>
          <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your luxury villa reservation is confirmed</p>
        </div>
        
        <div class="content">
          <p>Dear ${booking.guestName},</p>
          
          <p>Thank you for choosing LuxeStay! We're excited to confirm your reservation at our luxury villa. Your booking details are below:</p>
          
          <div class="booking-card">
            <h3 style="margin-top: 0; color: #1e293b;">Reservation Details</h3>
            
            <div class="booking-detail">
              <span class="label">Booking ID:</span>
              <span class="value">${booking.id}</span>
            </div>
            
            <div class="booking-detail">
              <span class="label">Check-in:</span>
              <span class="value">${checkinDate}</span>
            </div>
            
            <div class="booking-detail">
              <span class="label">Check-out:</span>
              <span class="value">${checkoutDate}</span>
            </div>
            
            <div class="booking-detail">
              <span class="label">Duration:</span>
              <span class="value">${nights} night${nights > 1 ? 's' : ''}</span>
            </div>
            
            <div class="booking-detail">
              <span class="label">Guests:</span>
              <span class="value">${booking.guests} guest${booking.guests > 1 ? 's' : ''}</span>
            </div>
            
            <div class="booking-detail total">
              <span class="label">Total Amount:</span>
              <span class="value">$${booking.totalAmount}</span>
            </div>
          </div>
          
          <h3>What's Next?</h3>
          <ul style="line-height: 1.8;">
            <li>Our concierge team will contact you 48 hours before your arrival</li>
            <li>Check-in time is 3:00 PM, check-out is 11:00 AM</li>
            <li>You'll receive detailed arrival instructions via email</li>
            <li>Airport transfer can be arranged upon request</li>
          </ul>
          
          <div class="contact-info">
            <h3>Need Help?</h3>
            <p><strong>Phone:</strong> +1 (555) 123-4567<br>
            <strong>Email:</strong> reservations@luxestay.com<br>
            <strong>24/7 Concierge:</strong> concierge@luxestay.com</p>
          </div>
          
          <p>We can't wait to welcome you to your luxury retreat!</p>
          
          <p>Best regards,<br>
          <strong>The LuxeStay Team</strong></p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">© 2024 LuxeStay. All rights reserved.</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">123 Coastal Highway, Malibu, CA 90265</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBookingConfirmation(booking: Booking): Promise<boolean> {
  const emailHtml = generateBookingConfirmationEmail(booking);
  
  return await sendEmail({
    to: booking.guestEmail,
    from: 'reservations@luxestay.com', // This should be a verified sender in SendGrid
    subject: `Booking Confirmed - LuxeStay Villa Reservation #${booking.id.slice(-8)}`,
    html: emailHtml
  });
}