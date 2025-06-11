export const runtime = 'nodejs'

// REQUIRED ENVIRONMENT VARIABLE:
// Add EMAIL_LINK_SECRET=your-secret-key-here to your .env.local file
// This is used to generate secure tokens for email confirmation links
// EMAIL LINK STRUCTURE: http://localhost:3000/api/booking/confirm-suggestion?bookingId=ID&timeSlot=ISO_DATETIME&token=SECURE_TOKEN

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { sendMail } from '@/lib/mail';
import crypto from 'crypto'; // Using ES6 import for crypto

interface ProposeTimesBody {
  bookingId: string;
  proposedTimes: string[]; // Array of ISO datetime strings
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  time: string;
  quote: string;
  status: string;
  createdAt: string;
  proposedTimes?: { datetime: string; token: string }[];
}

function generateSecureToken(bookingId: string, timeSlot: string): string {
  const secret = process.env.EMAIL_LINK_SECRET || 'fallback-secret-key-super-secure-do-not-use-in-prod'; // Added a more explicit fallback
  if (secret === 'fallback-secret-key-super-secure-do-not-use-in-prod') {
    console.warn('[WARN] Using fallback EMAIL_LINK_SECRET. Please set a secure secret in your .env.local file.');
  }
  return crypto.createHmac('sha256', secret).update(`${bookingId}-${timeSlot}`).digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest) {
  let bookingIdFromRequest: string | undefined;
  try {
    const body = await request.json() as ProposeTimesBody;
    bookingIdFromRequest = body.bookingId;
    const { proposedTimes } = body;

    if (!bookingIdFromRequest) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    if (!proposedTimes || proposedTimes.length === 0 || proposedTimes.some(t => !t)) {
      return NextResponse.json({ error: 'At least one proposed time is required and times cannot be empty.' }, { status: 400 });
    }
    if (proposedTimes.length > 3) {
        return NextResponse.json({ error: 'A maximum of 3 proposed times are allowed.' }, { status: 400 });
    }

    const currentBookingId = bookingIdFromRequest;

    if (!kv) {
      console.error('[API PROPOSE TIMES ERROR] Upstash KV is not configured');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const booking = await kv.hgetall(`booking:${currentBookingId}`) as BookingData | null;

    if (!booking) {
      return NextResponse.json({ error: `Booking not found for ID: ${currentBookingId}` }, { status: 404 });
    }

    // Generate tokens for each proposed time
    const proposedTimesWithTokens = proposedTimes.map(timeSlot => {
      if (isNaN(new Date(timeSlot).getTime())) {
        // Throw an error that will be caught by the main try-catch block
        throw new Error(`Invalid date format for proposed time: ${timeSlot}`);
      }
      const token = generateSecureToken(currentBookingId, timeSlot);
      return { datetime: timeSlot, token };
    });

    // Update booking in KV store
    const updatedBookingData = {
      ...booking,
      proposedTimes: proposedTimesWithTokens,
      status: 'awaiting-reschedule-choice',
    };
    await kv.hmset(`booking:${currentBookingId}`, updatedBookingData);

    // Format HTML email
    const timeButtonsHtml = proposedTimesWithTokens.map(pt => {
      const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/booking/confirm-suggestion?bookingId=${currentBookingId}&timeSlot=${encodeURIComponent(pt.datetime)}&token=${pt.token}`;
      const displayTime = new Date(pt.datetime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      return `
        <a href="${confirmationLink}" style="display: inline-block; background-color: #2D4A3E; color: white; padding: 10px 20px; margin: 5px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          ${displayTime}
        </a>`;
    }).join('');

    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2D4A3E; text-align: center;">Choose a New Time for Your Shed Shop Consultation</h2>
        <p>Hi ${booking.name},</p>
        <p>We'd like to propose some alternative times for your tattoo consultation. Please choose one of the options below that works best for you:</p>
        <div style="text-align: center; margin: 20px 0;">
          ${timeButtonsHtml}
        </div>
        <p>If none of these times work, please reply to this email or contact us directly.</p>
        <p style="color: #666; margin-top: 30px;">
          Best regards,<br>
          Hope @ Shed Shop
        </p>
      </div>
    `;

    try {
      await sendMail(
        booking.email,
        'Shed Shop - Please Choose a New Consultation Time',
        clientEmailHtml
      );
    } catch (emailError) {
      console.error(`[API PROPOSE TIMES ERROR] Failed to send proposed times email to client for booking ${currentBookingId}:`, emailError);
      // Log and proceed, but maybe inform admin or add a special status?
      // For now, we consider the primary operation (updating KV) as success if email fails.
      // Could return a slightly different success message or status.
    }

    return NextResponse.json({ message: 'Proposed times sent successfully!', booking: updatedBookingData });

  } catch (error: any) {
    const idForLog = bookingIdFromRequest || '[Booking ID not retrieved from request]';
    console.error(`[API PROPOSE TIMES ERROR] General error for booking ${idForLog}:`, error);
    // If the error is due to invalid date format from our check
    if (error.message.startsWith('Invalid date format for proposed time')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to send proposed times. Please try again.' }, { status: 500 });
  }
} 