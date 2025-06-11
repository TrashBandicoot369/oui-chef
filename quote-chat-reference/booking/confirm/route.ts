export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { sendMail } from '@/lib/mail';
import { addConsult } from '@/lib/calendar';

interface ConfirmBookingBody {
  bookingId: string;
}

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
  time: string; // Datetime string e.g., "YYYY-MM-DD HH:MM"
  quote: string;
  status: string;
  createdAt: string;
  tattooDetails?: string;
  chatHistory?: string; // Added: Stored as JSON string
  // other fields if any
}

export async function POST(request: NextRequest) {
  let bookingIdFromRequest: string | undefined;
  try {
    const body = await request.json() as ConfirmBookingBody;
    bookingIdFromRequest = body.bookingId;

    if (!bookingIdFromRequest) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    const currentBookingId = bookingIdFromRequest; // Use a const for operations after validation

    if (!kv) {
      console.error('[API CONFIRM BOOKING ERROR] Upstash KV is not configured');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const booking = await kv.hgetall(`booking:${currentBookingId}`) as BookingData | null;

    if (!booking) {
      return NextResponse.json({ error: `Booking not found for ID: ${currentBookingId}` }, { status: 404 });
    }

    if (booking.status === 'confirmed') {
        return NextResponse.json({ message: 'Booking already confirmed', booking }, { status: 200 });
    }

    // Prepare notes from tattooDetails or chat history
    let notesForCalendar = booking.tattooDetails || "";
    if (!notesForCalendar && booking.chatHistory) {
      try {
        const chatMessages: Message[] = JSON.parse(booking.chatHistory);
        if (Array.isArray(chatMessages) && chatMessages.length > 0) {
          notesForCalendar = chatMessages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n');
        }
      } catch (parseError) {
        console.error(`[API CONFIRM BOOKING ERROR] Failed to parse chatHistory for booking ${currentBookingId}:`, parseError);
      }
    }

    // 1. Add to Calendar
    try {
      if (!booking.time || isNaN(new Date(booking.time).getTime())) {
        console.error("[API CONFIRM BOOKING ERROR]", `Invalid date format for booking.time: ${booking.time} for booking ID: ${currentBookingId}`);
        throw new Error(`Invalid date format for booking time: ${booking.time}. Cannot add to calendar.`);
      }
      await addConsult(
        `Tattoo consult – ${booking.name}`,
        `Quote $${booking.quote} CAD • Phone ${booking.phone}`,
        new Date(booking.time).toISOString(),
        booking.email,
        notesForCalendar // Pass the generated notes
      );
    } catch (calendarError) {
        console.error(`[API CONFIRM BOOKING ERROR] Failed to add to calendar for booking ${currentBookingId}:`, calendarError);
        // Decide if this is a critical failure. For now, we'll proceed to update status and send email,
        // but include a note about the calendar issue.
        // Or, return an error straight away: return NextResponse.json({ error: 'Failed to add booking to calendar.' }, { status: 500 });
        // For now, let's consider it serious enough to halt.
         return NextResponse.json({ error: 'Failed to add booking to calendar. Please check calendar configuration and booking time.', details: (calendarError as Error).message }, { status: 500 });
    }

    // 2. Update booking status in KV store
    await kv.hset(`booking:${currentBookingId}`, { status: 'confirmed' });

    // 3. Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2D4A3E; text-align: center;">Shed Shop Booking Confirmed!</h2>
        <p>Hi ${booking.name},</p>
        <p>Great news! Your tattoo consultation with Shed Shop is confirmed.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
          <p><strong>Date & Time:</strong> ${booking.time}</p>
          <p><strong>Original Quote:</strong> $${booking.quote} CAD</p>
        </div>
        <p>We look forward to seeing you then!</p>
        <p style="color: #666; margin-top: 30px;">
          Best regards,<br>
          Hope @ Shed Shop
        </p>
      </div>
    `;

    try {
        await sendMail(
            booking.email,
            'Shed Shop Booking Confirmed',
            clientEmailHtml
        );
    } catch (emailError) {
        console.error(`[API CONFIRM BOOKING ERROR] Failed to send confirmation email to client for booking ${currentBookingId}:`, emailError);
        // Non-critical, booking is confirmed and in calendar. Log and proceed.
        // Optionally, could update booking status to 'confirmed_email_failed'
    }
    
    // Update the local booking object for the response
    const updatedBooking = { ...booking, status: 'confirmed' };

    return NextResponse.json({ message: 'Booking confirmed successfully!', booking: updatedBooking });

  } catch (error: any) {
    // Log with bookingIdFromRequest if available, otherwise indicate it was not retrievable
    const idForLog = bookingIdFromRequest || '[Booking ID not retrieved from request]';
    console.error(`[API CONFIRM BOOKING ERROR] General error for booking ${idForLog}:`, error);
    return NextResponse.json({ error: error.message || 'Failed to confirm booking. Please try again.' }, { status: 500 });
  }
} 