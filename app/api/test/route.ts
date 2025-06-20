import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Test basic API response
    console.log('🧪 Test API: Basic check...');
    
    // Test Firebase connection
    console.log('🔥 Test API: Testing Firebase connection...');
    const testRef = db.collection('test');
    const snapshot = await testRef.limit(1).get();
    console.log('✅ Test API: Firebase connection successful');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'API is working',
      firebase: 'connected',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Test API Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 