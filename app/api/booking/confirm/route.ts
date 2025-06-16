import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';
import { createCalendarEvent } from '@/lib/calendar';

export async function POST(request: NextRequest) {
  console.log('🎉 CONFIRM WORKFLOW: Starting booking confirmation process');
  
  try {
    console.log('🎉 STEP 1: Parsing request data...');
    const { bookingId, selectedTime } = await request.json();
    console.log('🎉 STEP 1: Received data:', { bookingId, selectedTime });
    
    if (!bookingId) {
      console.error('🎉 STEP 1: ❌ Missing booking ID');
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    console.log('🎉 STEP 1: ✅ Booking ID validated');

    try {
      // Get booking data from Firebase
      console.log('🎉 STEP 2: Fetching booking data from database...');
      const bookingDoc = await db.collection('bookings').doc(bookingId).get();
      
      if (!bookingDoc.exists) {
        console.error('🎉 STEP 2: ❌ Booking not found in database');
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      const bookingData = bookingDoc.data();
      
      if (!bookingData) {
        console.error('🎉 STEP 2: ❌ Booking data is empty');
        return NextResponse.json({ error: 'Booking data not found' }, { status: 404 });
      }
      
      console.log('🎉 STEP 2: ✅ Booking data retrieved from database');

      // Update booking in database
      console.log('🎉 STEP 3: Updating booking status to approved...');
      const updateData: any = {
        status: 'approved',
        confirmedAt: new Date().toISOString()
      };
      
      // If a specific time was selected from suggestions, update the event time
      if (selectedTime) {
        const selectedDate = new Date(selectedTime);
        updateData['event.date'] = selectedDate.toISOString().split('T')[0];
        updateData['event.time'] = selectedDate.toTimeString().split(' ')[0].substring(0, 5);
        console.log('🎉 STEP 3: Updated event time to selected time:', selectedTime);
      }
      
      await db.collection('bookings').doc(bookingId).update(updateData);
      console.log('🎉 STEP 3: ✅ Booking status updated to approved');

      // Create updated booking data for emails
      const finalEventDate = selectedTime ? new Date(selectedTime).toISOString().split('T')[0] : bookingData.event.date;
      const finalEventTime = selectedTime ? new Date(selectedTime).toTimeString().split(' ')[0].substring(0, 5) : bookingData.event.time;

      // Send final confirmation email to client
      console.log('🎉 STEP 4: Sending final confirmation email to client...');
      await sendBookingConfirmation({
        email: bookingData.client.email,
        fullName: bookingData.client.name,
        phone: bookingData.client.phone,
        eventDate: finalEventDate,
        eventTime: finalEventTime,
        location: bookingData.event.location,
        guestCount: bookingData.event.guestCount,
        quote: bookingData.event.estimatedQuote,
        additionalNotes: bookingData.event.additionalNotes || ''
      });
      console.log('🎉 STEP 4: ✅ Final confirmation email sent to client');

      // Send confirmation notification to Chef Alex
      console.log('🎉 STEP 5: Sending confirmation notification to Chef Alex...');
      const updatedBookingData = {
        ...bookingData,
        event: {
          ...bookingData.event,
          date: finalEventDate,
          time: finalEventTime
        },
        status: 'approved'
      };
      
      await sendAdminNotification(updatedBookingData);
      console.log('🎉 STEP 5: ✅ Confirmation notification sent to Chef Alex');

      // Add to Google Calendar
      console.log('🎉 STEP 6: Adding confirmed event to Google Calendar...');
      try {
        const eventDateTime = selectedTime 
          ? new Date(selectedTime)
          : new Date(`${bookingData.event.date}T${bookingData.event.time || '18:00'}`);
        const endDateTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000);
        
        await createCalendarEvent({
          summary: `CONFIRMED: Private Event - ${bookingData.client.name}`,
          description: `CONFIRMED BOOKING\n\nPhone: ${bookingData.client.phone}\nEmail: ${bookingData.client.email}\nGuests: ${bookingData.event.guestCount}\nLocation: ${bookingData.event.location}\nQuote: $${bookingData.event.estimatedQuote}\nNotes: ${bookingData.event.additionalNotes || ''}`,
          start: eventDateTime.toISOString(),
          end: endDateTime.toISOString(),
        });
        console.log('🎉 STEP 6: ✅ Confirmed event added to Google Calendar');
      } catch (calendarError) {
        console.error('🎉 STEP 6: ❌ Failed to add to calendar (continuing anyway):', calendarError);
      }

      console.log('🎉 CONFIRM WORKFLOW: ✅ Booking confirmation completed successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Booking confirmed successfully',
        confirmedTime: selectedTime || `${finalEventDate} ${finalEventTime}`
      });
      
    } catch (error) {
      console.error('🎉 STEP 2-6: ❌ Error processing booking confirmation:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('🎉 CONFIRM WORKFLOW: ❌ CRITICAL ERROR - Booking confirmation failed');
    console.error('🎉 ERROR DETAILS:', error);
    console.error('🎉 ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🎉 ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('🎉 API RESPONSE ERROR:', (error as any).response?.data || (error as any).response);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 