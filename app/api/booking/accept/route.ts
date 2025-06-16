import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('✅ ACCEPT WORKFLOW: Starting booking acceptance process');
  
  try {
    console.log('✅ STEP 1: Parsing request data...');
    const { bookingId } = await request.json();
    console.log('✅ STEP 1: Received booking ID:', bookingId);
    
    if (!bookingId) {
      console.error('✅ STEP 1: ❌ Missing booking ID');
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    console.log('✅ STEP 1: ✅ Booking ID validated');

    console.log('✅ STEP 2: Updating booking status in database...');
    const bookingRef = db.collection('bookings').doc(bookingId);
    
    // Check if booking exists
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      console.error('✅ STEP 2: ❌ Booking not found');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status to approved
    await bookingRef.update({
      status: 'approved',
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      lastUpdatedBy: 'chef_approval'
    });
    
    console.log(`✅ STEP 2: ✅ Booking ${bookingId} status updated to approved`);

    // TODO: Future enhancements could include:
    // - Send confirmation email to client
    // - Add final details to calendar event
    // - Trigger any post-approval workflows
    
    console.log('✅ ACCEPT WORKFLOW: ✅ Booking acceptance completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Booking accepted successfully',
      bookingId,
      status: 'approved'
    });
  } catch (error) {
    console.error('✅ ACCEPT WORKFLOW: ❌ CRITICAL ERROR - Booking acceptance failed');
    console.error('✅ ERROR DETAILS:', error);
    console.error('✅ ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown error');
    console.error('✅ ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('✅ API RESPONSE ERROR:', (error as any).response?.data || (error as any).response);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 