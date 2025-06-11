export const runtime = 'nodejs'

// REQUIRED ENVIRONMENT VARIABLE:
// Add EMAIL_LINK_SECRET=your-secret-key-here to your .env.local file
// This is used to generate secure tokens for email confirmation links
// EMAIL LINK STRUCTURE: http://localhost:3000/api/booking/confirm-suggestion?bookingId=ID&timeSlot=ISO_DATETIME&token=SECURE_TOKEN

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { sendMail } from '@/lib/mail';
import { addConsult } from '@/lib/calendar';
import crypto from 'crypto';
import { summarizeChatHistory, Message as SummaryMessage } from '@/lib/summary';

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

interface BookingData {
  name: string;
  email: string;
  phone: string;
  time: string; // Original or newly confirmed time
  quote: string;
  status: string;
  createdAt: string;
  proposedTimes?: { datetime: string; token: string }[]; // Array of {datetime, token}
  tattooDetails?: string;
  chatHistory?: string; // Added: Stored as JSON string
}

function generateSecureToken(bookingId: string, timeSlot: string): string {
  const secret = process.env.EMAIL_LINK_SECRET || 'fallback-secret-key-super-secure-do-not-use-in-prod';
  if (secret === 'fallback-secret-key-super-secure-do-not-use-in-prod') {
    console.warn('[WARN] Using fallback EMAIL_LINK_SECRET. Please set a secure secret in your .env.local file.');
  }
  return crypto.createHmac('sha256', secret).update(`${bookingId}-${timeSlot}`).digest('hex').substring(0, 16);
}

// Helper to generate HTML responses
function htmlResponse(title: string, message: string, isError: boolean = false, homeLink: boolean = true) {
  const headerColor = isError ? '#D32F2F' : '#2D4A3E'; // Red for error, Green for success
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Shed Shop</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; text-align: center; }
        .container { background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 500px; width: 90%; }
        h1 { color: ${headerColor}; margin-bottom: 20px; }
        p { color: #333; font-size: 1.1em; margin-bottom: 25px; }
        a { color: #fff; background-color: #2D4A3E; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; transition: background-color 0.3s ease; }
        a:hover { background-color: #1E3228; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        ${homeLink ? '<a href="/">Return to Homepage</a>' : ''}
      </div>
    </body>
    </html>
  `;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingId = searchParams.get('bookingId');
  const timeSlot = searchParams.get('timeSlot'); // This is the new proposed time
  const token = searchParams.get('token');

  try {
    if (!bookingId || !timeSlot || !token) {
      return new NextResponse(htmlResponse('Invalid Link', 'This confirmation link is incomplete. Please check the link or contact support.', true), { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    if (isNaN(new Date(timeSlot).getTime())) {
      return new NextResponse(htmlResponse('Invalid Time Format', 'The time in the confirmation link is not valid.', true), { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    const expectedToken = generateSecureToken(bookingId, timeSlot);
    if (token !== expectedToken) {
      return new NextResponse(htmlResponse('Link Invalid or Expired', 'This confirmation link is invalid or may have expired. Please request a new one if needed.', true), { status: 403, headers: { 'Content-Type': 'text/html' } });
    }

    if (!kv) {
      console.error('[API CONFIRM SUGGESTION ERROR] Upstash KV is not configured');
      return new NextResponse(htmlResponse('Service Unavailable', 'We are currently unable to process your request. Please try again later.', true), { status: 503, headers: { 'Content-Type': 'text/html' } });
    }

    const booking = await kv.hgetall(`booking:${bookingId}`) as BookingData | null;

    if (!booking) {
      return new NextResponse(htmlResponse('Booking Not Found', `We couldn't find a booking with ID: ${bookingId}.`, true), { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    if (booking.status === 'confirmed' && booking.time === timeSlot) {
      const displayTime = new Date(booking.time).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
      return new NextResponse(htmlResponse('Already Confirmed', `This booking for ${displayTime} is already confirmed. No further action is needed.`, false, true), { status: 200, headers: { 'Content-Type': 'text/html' } });
    }
    
    if (booking.status !== 'awaiting-reschedule-choice') {
      return new NextResponse(htmlResponse('Invalid Action', 'This booking is not awaiting a reschedule choice or may have been cancelled.', true), { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    // Validate if the timeSlot was one of the originally proposed times by checking the token (already done by token check)
    // And also by checking if it exists in the proposedTimes array for robustness, though token check is primary.
    const isValidProposedTime = booking.proposedTimes?.some(pt => pt.datetime === timeSlot && pt.token === token);
    if (!isValidProposedTime) {
      return new NextResponse(htmlResponse('Invalid Time Slot', 'The selected time slot is not valid or the link has expired.', true), { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    // Prepare notes from tattooDetails or chat history
    let tattooDetails = booking.tattooDetails || "";
    if (booking.chatHistory) {
      try {
        const storedHistory: Message[] = JSON.parse(booking.chatHistory);
        const summaryInput: SummaryMessage[] = storedHistory.map(m => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content
        }));
        tattooDetails = await summarizeChatHistory(summaryInput);
      } catch (parseError) {
        console.error(`[API CONFIRM SUGGESTION ERROR] Failed to parse chatHistory or generate summary for booking ${bookingId}:`, parseError);
      }
    }

    // All checks passed, proceed to update booking
    const updatedBookingData = {
      ...booking,
      time: timeSlot, // Set the new confirmed time
      status: 'confirmed',
      proposedTimes: [] // Clear proposed times
    };

    // 1. Add to Calendar (using the new timeSlot)
    try {
      await addConsult(
        `Tattoo consult – ${booking.name}`,
        `Quote $${booking.quote} CAD • Phone ${booking.phone}`,
        new Date(timeSlot).toISOString(), // Ensure it's ISO string for calendar
        booking.email,
        tattooDetails // Pass the generated notes
      );
    } catch (calendarError) {
      console.error(`[API CONFIRM SUGGESTION ERROR] Failed to add to calendar for booking ${bookingId} (new time ${timeSlot}):`, calendarError);
      // This is a critical failure as the time was chosen by user.
      return new NextResponse(htmlResponse('Calendar Error', 'Your time was confirmed in our system, but there was an issue adding it to our calendar. Please contact us to ensure it is scheduled correctly.', true), { status: 500, headers: { 'Content-Type': 'text/html' } });
    }

    // 2. Update booking status in KV store
    // Use hmset to update fields and ensure `proposedTimes` is effectively removed if stored as a complex object or set to empty array
    await kv.hmset(`booking:${bookingId}`, { 
        time: timeSlot,
        status: 'confirmed' 
    });
    // If proposedTimes is a top-level field that needs explicit deletion or setting to null/empty:
    await kv.hdel(`booking:${bookingId}`, 'proposedTimes'); // Or set to empty array depending on how KV handles it: kv.hset(`booking:${bookingId}`, { proposedTimes: [] })

    const displayConfirmedTime = new Date(timeSlot).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

    // 3. Send confirmation email to client with summary
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D4A3E;">Booking Confirmed - Shed Shop</h2>
        <p>Hi ${booking.name},</p>
        <p>Your consultation has been successfully rescheduled and confirmed for <strong>${displayConfirmedTime}</strong>. We look forward to seeing you!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2D4A3E;">Tattoo Details Summary</h3>
          <p style="white-space: pre-wrap;">${tattooDetails}</p>
        </div>
        <p style="color: #666; margin-top: 30px;">
          Best regards,<br>
          Hope @ Shed Shop
        </p>
      </div>
    `;

    try {
      await sendMail(
        booking.email,
        `Booking Confirmed: Your Consultation on ${new Date(timeSlot).toLocaleDateString()}`,
        clientEmailHtml
      );
    } catch (emailError) {
      console.error(`[API CONFIRM SUGGESTION ERROR] Failed to send client confirmation email for booking ${bookingId}:`, emailError);
      // Non-critical, client will still see the success page.
    }

    // 4. Send confirmation email to admin (and optionally to client again)
    const adminEmail = process.env.ADMIN_EMAIL; // Assuming you have admin email in .env
    if (adminEmail) {
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2D4A3E;">Booking Rescheduled and Confirmed</h2>
          <p>Client <strong>${booking.name}</strong> (Booking ID: ${bookingId}) has confirmed a new time for their consultation:</p>
          <p><strong>New Date & Time:</strong> ${new Date(timeSlot).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
          <p><strong>Original Email:</strong> ${booking.email}</p>
          <p><strong>Original Phone:</strong> ${booking.phone}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <h3 style="margin-top: 0; color: #333;">Tattoo Summary:</h3>
            <p style="white-space: pre-wrap;">${tattooDetails}</p>
          </div>
          <p>This has been updated in the system and added to the calendar.</p>
        </div>
      `;
      try {
        await sendMail(
          adminEmail,
          `Booking Rescheduled: ${booking.name} - ${new Date(timeSlot).toLocaleDateString()}`,
          adminEmailHtml
        );
      } catch (emailError) {
        console.error(`[API CONFIRM SUGGESTION ERROR] Failed to send admin confirmation email for booking ${bookingId}:`, emailError);
        // Non-critical for the client, but admin should be aware.
      }
    }

    // Send success HTML response to client
    return new NextResponse(htmlResponse('Time Confirmed!', `Your consultation is successfully confirmed for: <strong>${displayConfirmedTime}</strong>. We look forward to seeing you!`, false), { status: 200, headers: { 'Content-Type': 'text/html' } });

  } catch (error: any) {
    console.error(`[API CONFIRM SUGGESTION ERROR] General error for booking ${bookingId || '[Unknown ID]'}:`, error);
    return new NextResponse(htmlResponse('Error', 'An unexpected error occurred. Please try again or contact support if the problem persists.', true), { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
} 