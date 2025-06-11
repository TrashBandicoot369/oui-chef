import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('id');

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
  }

  if (!kv) {
    console.error('[API BOOKING DETAILS ERROR] Upstash KV is not configured');
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const bookingData = await kv.hgetall(`booking:${bookingId}`);

    if (!bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure all expected fields are present, providing defaults or specific error handling if necessary
    // For now, we assume hgetall returns an object or null
    const typedBookingData = bookingData as {
        name: string;
        email: string;
        phone: string;
        time: string;
        quote: string;
        status: string;
        createdAt: string;
        tattooDetails?: string;
        // Add other fields if they exist in your KV store
    };

    return NextResponse.json({ booking: typedBookingData });

  } catch (error) {
    console.error(`[API BOOKING DETAILS ERROR] Error fetching booking ${bookingId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve booking details. Please try again.' }, { status: 500 });
  }
} 