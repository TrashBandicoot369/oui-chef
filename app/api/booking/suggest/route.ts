import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { sendSuggestedTimesToClient } from '@/lib/email';

export async function POST(request: NextRequest) {
  console.log('💡 SUGGEST WORKFLOW: Starting booking suggestion process');
  
  try {
    console.log('💡 STEP 1: Parsing request data...');
    const { bookingId, options } = await request.json();
    console.log('💡 STEP 1: Received data:', { bookingId, options });
    
    if (!bookingId) {
      console.error('💡 STEP 1: ❌ Missing booking ID');
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    console.log('💡 STEP 1: ✅ Booking ID validated');

    // If options are provided, this is a suggestion submission
    if (options && options.length > 0) {
      console.log('💡 STEP 2: Processing suggestion submission...');
      console.log('💡 STEP 2: Suggested times received:', options);
      
      try {
        // Get booking data from Firebase
        console.log('💡 STEP 3: Fetching booking data from database...');
        const bookingDoc = await db.collection('bookings').doc(bookingId).get();
        
        if (!bookingDoc.exists) {
          console.error('💡 STEP 3: ❌ Booking not found in database');
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        
        const bookingData = bookingDoc.data();
        
        if (!bookingData) {
          console.error('💡 STEP 3: ❌ Booking data is empty');
          return NextResponse.json({ error: 'Booking data not found' }, { status: 404 });
        }
        
        console.log('💡 STEP 3: ✅ Booking data retrieved from database');
        
        // Save suggested times to database
        console.log('💡 STEP 4: Saving suggested times to database...');
        await db.collection('bookings').doc(bookingId).update({
          suggestedTimes: options,
          status: 'suggested_alternative',
          suggestedAt: new Date().toISOString()
        });
        console.log('💡 STEP 4: ✅ Suggested times saved to database');
        
        // Send email to client with suggested times
        console.log('💡 STEP 5: Sending suggested times email to client...');
        await sendSuggestedTimesToClient({
          bookingId,
          clientEmail: bookingData.client.email,
          clientName: bookingData.client.name,
          suggestedTimes: options,
          originalEventDate: bookingData.event.date,
          location: bookingData.event.location,
          guestCount: bookingData.event.guestCount
        });
        console.log('💡 STEP 5: ✅ Suggested times email sent to client');
        
        console.log('💡 SUGGEST WORKFLOW: ✅ Suggestion submission completed successfully');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Suggestions sent to client',
          suggestedTimes: options,
          clientEmail: bookingData.client.email
        });
        
      } catch (error) {
        console.error('💡 STEP 2-5: ❌ Error processing suggestion submission:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    }

    // If no options, this is the initial suggestion preparation
    console.log('💡 STEP 2: Initial suggestion preparation...');
    console.log(`💡 STEP 2: Booking ${bookingId} marked for suggestions (placeholder logic)`);
    console.log('💡 SUGGEST WORKFLOW: ✅ Suggestion preparation completed successfully');
    
    return NextResponse.json({ success: true, message: 'Ready for suggestions' });
  } catch (error) {
    console.error('💡 SUGGEST WORKFLOW: ❌ CRITICAL ERROR - Booking suggestion failed');
    console.error('💡 ERROR DETAILS:', error);
    console.error('💡 ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💡 ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('💡 API RESPONSE ERROR:', (error as any).response?.data || (error as any).response);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 