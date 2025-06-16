import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('❌ REJECT WORKFLOW: Starting booking rejection process');
  
  try {
    console.log('❌ STEP 1: Parsing request data...');
    const { bookingId, reason } = await request.json();
    console.log('❌ STEP 1: Received booking ID:', bookingId);
    
    if (!bookingId) {
      console.error('❌ STEP 1: ❌ Missing booking ID');
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    console.log('❌ STEP 1: ✅ Booking ID validated');

    console.log('❌ STEP 2: Updating booking status in database...');
    const bookingRef = db.collection('bookings').doc(bookingId);
    
    // Check if booking exists
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      console.error('❌ STEP 2: ❌ Booking not found');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status to rejected
    await bookingRef.update({
      status: 'rejected',
      updatedAt: new Date().toISOString(),
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'No reason provided',
      lastUpdatedBy: 'chef_approval'
    });
    
    console.log(`❌ STEP 2: ✅ Booking ${bookingId} status updated to rejected`);

    // TODO: Future enhancements could include:
    // - Send rejection email to client with explanation
    // - Log rejection for analytics
    // - Trigger any post-rejection workflows
    
    console.log('❌ REJECT WORKFLOW: ✅ Booking rejection completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Booking rejected successfully',
      bookingId,
      status: 'rejected'
    });
  } catch (error) {
    console.error('❌ REJECT WORKFLOW: ❌ CRITICAL ERROR - Booking rejection failed');
    console.error('❌ ERROR DETAILS:', error);
    console.error('❌ ERROR MESSAGE:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('❌ API RESPONSE ERROR:', (error as any).response?.data || (error as any).response);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 