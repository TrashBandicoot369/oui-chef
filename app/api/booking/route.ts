import { NextRequest, NextResponse } from 'next/server';
import { summarizeChat } from '@/lib/summary';

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

interface BookingData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  guestCount: number;
  additionalNotes?: string;
  quote: number;
  chatHistory: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Validate required fields
    const { fullName, email, phone, eventDate, location, guestCount, quote, chatHistory } = bookingData;
    
    if (!fullName || !email || !phone || !eventDate || !location || !guestCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Summarize the chat conversation
    const chatSummary = await summarizeChat(chatHistory);

    // Create consultation request object
    const consultationRequest = {
      id: `booking_${Date.now()}`,
      timestamp: new Date().toISOString(),
      client: {
        name: fullName,
        email,
        phone,
      },
      event: {
        date: eventDate,
        time: bookingData.eventTime || 'TBD',
        location,
        guestCount,
        estimatedQuote: quote,
        additionalNotes: bookingData.additionalNotes || '',
      },
      chatSummary,
      status: 'pending_review'
    };

    // Here you would typically:
    // 1. Save to database
    // 2. Send confirmation email to client
    // 3. Send notification email to chef
    // 4. Add to calendar system
    
    console.log('New consultation request:', consultationRequest);

    // For now, we'll just log it and return success
    // In production, you'd implement actual email sending and database storage

    return NextResponse.json({
      success: true,
      message: 'Consultation request received successfully',
      bookingId: consultationRequest.id
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    );
  }
} 