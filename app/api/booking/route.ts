import { NextRequest, NextResponse } from 'next/server';
import { summarizeChat } from '@/lib/summary';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';
import { createCalendarEvent } from '@/lib/calendar';
import { db } from '@/lib/firebase-admin';

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
  console.log('🚀 BOOKING WORKFLOW: Starting booking request processing');
  
  try {
    console.log('🚀 STEP A: Parsing request data...');
    const bookingData: BookingData = await request.json();
    console.log('🚀 STEP A: Received booking data:', JSON.stringify(bookingData, null, 2));

    const { fullName, email, phone, eventDate, location, guestCount, quote, chatHistory } = bookingData;

    console.log('🚀 STEP B: Validating required fields...');
    if (!fullName || !email || !phone || !eventDate || !location || !guestCount) {
      console.error('🚀 STEP B: ❌ Missing required fields:', {
        fullName: !!fullName,
        email: !!email,
        phone: !!phone,
        eventDate: !!eventDate,
        location: !!location,
        guestCount: !!guestCount
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    console.log('🚀 STEP B: ✅ All required fields present');

    console.log('🚀 STEP C: Generating chat summary...');
    const chatSummary = await summarizeChat(chatHistory);
    console.log('🚀 STEP C: ✅ Chat summary generated:', chatSummary);

    console.log('🚀 STEP D: Creating consultation request object...');
    const consultationRequest = {
      id: `booking_${Date.now()}`,
      timestamp: new Date().toISOString(),
      client: { name: fullName, email, phone },
      event: {
        date: eventDate,
        time: bookingData.eventTime || 'TBD',
        location,
        guestCount,
        estimatedQuote: quote,
        additionalNotes: bookingData.additionalNotes || '',
      },
      chatSummary,
      status: 'pending_review',
    };
    console.log('🚀 STEP D: ✅ Consultation request created:', JSON.stringify(consultationRequest, null, 2));

    // 1. Send confirmation email to client
    console.log('🚀 STEP E: Sending confirmation email to client...');
    try {
      await sendBookingConfirmation(email, fullName);
      console.log('🚀 STEP E: ✅ Client confirmation email sent successfully');
    } catch (error) {
      console.error('🚀 STEP E: ❌ Failed to send client confirmation email:', error);
      // Continue with other steps even if this fails
    }

    // 2. Notify Chef/Admin
    console.log('🚀 STEP F: Sending admin notification...');
    try {
      await sendAdminNotification(consultationRequest);
      console.log('🚀 STEP F: ✅ Admin notification sent successfully');
    } catch (error) {
      console.error('🚀 STEP F: ❌ Failed to send admin notification:', error);
      // Continue with other steps even if this fails
    }

    // 3. Add to Google Calendar
    console.log('🚀 STEP G: Adding event to Google Calendar...');
    try {
      const startDateTime = new Date(`${eventDate}T${bookingData.eventTime || '18:00'}`);
      const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
      
      console.log('🚀 STEP G: Calendar event details:', {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });

      await createCalendarEvent({
        summary: `Private Event: ${fullName}`,
        description: `Phone: ${phone}\nGuests: ${guestCount}\nLocation: ${location}\nQuote: $${quote}\nNotes: ${bookingData.additionalNotes || ''}`,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      });
      console.log('🚀 STEP G: ✅ Calendar event created successfully');
    } catch (error) {
      console.error('🚀 STEP G: ❌ Failed to create calendar event:', error);
      // Continue with other steps even if this fails
    }

    console.log('🚀 STEP H: Saving to Firebase database...');
    try {
      await db.collection('bookings').doc(consultationRequest.id).set(consultationRequest);
      console.log('🚀 STEP H: ✅ Booking saved to database successfully');
    } catch (error) {
      console.error('🚀 STEP H: ❌ Failed to save booking to database:', error);
      // Continue to return success even if database save fails
    }
    
    console.log('🚀 BOOKING WORKFLOW: ✅ Booking workflow completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Consultation request received successfully',
      bookingId: consultationRequest.id,
    });

  } catch (error) {
    console.error('🚀 BOOKING WORKFLOW: ❌ CRITICAL ERROR - Booking workflow failed');
    console.error('🚀 ERROR DETAILS:', error);
    console.error('🚀 ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🚀 ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('🚀 API RESPONSE ERROR:', (error as any).response?.data || (error as any).response);
    }
    
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    );
  }
}
