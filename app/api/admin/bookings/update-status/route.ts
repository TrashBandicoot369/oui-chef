import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Admin API: Updating booking status...');
    
    const { bookingId, status } = await request.json();
    
    // Validate input
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId and status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_review', 'approved', 'rejected', 'suggested_alternative'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update the booking in Firestore
    const bookingRef = db.collection('bookings').doc(bookingId);
    
    // Check if booking exists
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update the status and add timestamp
    await bookingRef.update({
      status,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'admin' // Could be extended to include actual admin user info
    });

    console.log(`📊 Admin API: Updated booking ${bookingId} to status: ${status}`);
    
    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      bookingId,
      status
    });

  } catch (error) {
    console.error('📊 Admin API: Error updating booking status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update booking status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 