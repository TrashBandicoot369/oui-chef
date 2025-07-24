import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Query } from 'firebase-admin/firestore';

// Force dynamic rendering since this API uses query parameters
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Public Content API: Fetching public content...');
    
    const url = new URL(request.url);
    const collection = url.searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

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
    
    // Get all documents first, then filter in JavaScript to handle missing fields
    const snapshot = await query.get();
    
    let data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply visibility/approval filtering for specific collections
    if (collection === 'menuItems') {
      data = data.filter((item: any) => item.visible !== false); // Show if visible is true or undefined
    } else if (collection === 'testimonials') {
      data = data.filter((item: any) => item.approved === true); // Only show explicitly approved
    } else if (collection === 'gallery' || collection === 'eventHighlights') {
      data = data.filter((item: any) => item.visible !== false); // Show if visible is true or undefined
    }
    
    // Sort by order field if available
    if (['eventHighlights', 'menuItems', 'testimonials', 'gallery'].includes(collection)) {
      data = data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }

    console.log(`📖 Retrieved ${data.length} documents from ${collection}`);
    
    return NextResponse.json({
      success: true,
      data,
      collection,
      count: data.length
    }, {
      headers: { 'Cache-Control': 'no-store, must-revalidate' }
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