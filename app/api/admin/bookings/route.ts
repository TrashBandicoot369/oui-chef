import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Admin API: Fetching all bookings...');
    
    // Get all bookings from Firestore
    const bookingsSnapshot = await db.collection('bookings').orderBy('timestamp', 'desc').get();
    
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Admin API: Retrieved ${bookings.length} bookings`);
    
    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('📊 Admin API: Error fetching bookings:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 