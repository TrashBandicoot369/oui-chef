export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { sendMail } from '@/lib/mail';
import { randomUUID } from 'crypto';
import { summarizeChatHistory, Message as SummaryMessage } from '@/lib/summary';

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

interface BookingRequestBody {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  quote: number;
  chatHistory: Message[]; // Added chatHistory
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BookingRequestBody;
    const { fullName, email, phone, date, time, quote, chatHistory } = body; // Added chatHistory

    // Validation
    if (!fullName || !email || !phone || !date || !time || quote === undefined || !chatHistory) { // Added chatHistory
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!Array.isArray(chatHistory)) { // Basic validation for chatHistory
        return NextResponse.json({ error: 'Invalid chatHistory format' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check KV availability
    if (!kv) {
      console.error('[BOOKING ERROR] Upstash KV is not configured');
      return NextResponse.json({ error: 'Booking service temporarily unavailable' }, { status: 503 });
    }

    // Generate unique booking ID
    const bookingId = randomUUID();
    
    // Create datetime string for storage
    const datetime = `${date} ${time}`;

    // Convert to the summary helper's Message type
    const summaryInput: SummaryMessage[] = chatHistory.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }));
    const tattooDetails = await summarizeChatHistory(summaryInput);
    
    // Save booking to KV store
    await kv.hset(`booking:${bookingId}`, {
      name: fullName,
      email: email,
      phone: phone,
      time: datetime,
      quote: quote.toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      tattooDetails,
      chatHistory: JSON.stringify(chatHistory),
    });

    // Send notification email to admin/owner
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const manageBookingUrl = `${baseUrl}/confirmation?bookingId=${bookingId}`;

    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2D4A3E; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">New Booking Request</h2>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; font-size: 1.1em;">Client Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #007bff; text-decoration: none;">${phone}</a></p>
          <p style="margin: 5px 0;"><strong>Preferred Date/Time:</strong> ${datetime}</p>
          <p style="margin: 5px 0;"><strong>Quoted Amount:</strong> $${quote} CAD</p>
        </div>

        <div style="background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">
          <h3 style="margin-top: 0; color: #333; font-size: 1.1em;">Tattoo Details:</h3>
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${tattooDetails}</pre>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${manageBookingUrl}" 
             style="background-color: #4A6B5C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 1em; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            Manage Booking
          </a>
        </div>

        <p style="color: #555; font-size: 0.9em; text-align: center; margin-top: 25px;">
          Click the button above to go to the confirmation page where you can confirm, reject, or propose new times for this booking.
        </p>
      </div>
    `;

    // Send email to admin
    await sendMail(
      process.env.ADMIN_EMAIL!,
      `New Booking Request - ${fullName}`,
      adminEmailHtml
    );

    // Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D4A3E;">Booking Request Received - Shed Shop</h2>
        
        <p>Hi ${fullName},</p>
        
        <p>Thank you for your booking request! We\'ve received your consultation request and will review it shortly.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2D4A3E;">Your Request Details</h3>
          <p><strong>Preferred Date/Time:</strong> ${datetime}</p>
          <p><strong>Quoted Amount:</strong> $${quote} CAD</p>
        </div>
        
        <p>We\'ll get back to you within 24 hours to confirm your appointment or suggest alternative times.</p>
        
        <p style="color: #666; margin-top: 30px;">
          Best regards,<br>
          Hope @ Shed Shop
        </p>
      </div>
    `;

    await sendMail(
      email,
      'Booking Request Received - Shed Shop',
      clientEmailHtml
    );

    console.log('Booking saved and emails sent:', {
      bookingId,
      client: email,
      admin: process.env.ADMIN_EMAIL
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Booking request submitted successfully! Check your email for confirmation.',
      bookingId 
    });

  } catch (error) {
    console.error('Error processing booking request:', error);
    return NextResponse.json({ 
      error: 'Something went wrong processing the request. Please try again.' 
    }, { status: 500 });
  }
} 