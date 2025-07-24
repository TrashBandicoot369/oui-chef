import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const snap = await db.collection('testimonials')
    .where('approved', '==', true)
    .get()
  const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  // Sort by order in JavaScript since compound queries require indexes
  const sortedData = data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  return NextResponse.json(sortedData, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' }
  })
} 