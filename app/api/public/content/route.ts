import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Query } from 'firebase-admin/firestore';

// Force dynamic rendering since this API uses query parameters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Public Content API: Fetching public content...');
    
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection') || 'content';

    // Validate allowed collections for public access
    const allowedCollections = [
      'eventHighlights',
      'menuItems', 
      'testimonials',
      'gallery',
      'siteCopy',
      'content',
      'theme'
    ];

    if (!allowedCollections.includes(collection)) {
      return NextResponse.json({ error: 'Collection not allowed for public access' }, { status: 403 });
    }

    console.log(`📖 Fetching ${collection} collection...`);
    
    // Fetch data from Firestore using admin SDK
    let query: Query = db.collection(collection);
    
    // Add ordering for collections that have an order field
    if (['eventHighlights', 'menuItems', 'testimonials', 'gallery'].includes(collection)) {
      query = query.orderBy('order');
    }
    
    const snapshot = await query.get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📖 Retrieved ${data.length} documents from ${collection}`);
    
    return NextResponse.json({
      success: true,
      data,
      collection,
      count: data.length
    });

  } catch (error) {
    console.error('📖 Public Content API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 