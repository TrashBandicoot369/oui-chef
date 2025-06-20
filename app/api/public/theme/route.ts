import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  const doc = await db.collection('theme').doc('current').get();
  return NextResponse.json(doc.data() || {});
}
