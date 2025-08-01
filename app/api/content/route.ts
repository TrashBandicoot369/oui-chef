import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const snap = await db.collection('content').get()
  const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  // Sort by section name for consistent ordering (with null safety)
  const sortedData = data.sort((a: any, b: any) => {
    const sectionA = a.section || a.id || ''
    const sectionB = b.section || b.id || ''
    return sectionA.localeCompare(sectionB)
  })
  return NextResponse.json(sortedData, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' }
  })
} 