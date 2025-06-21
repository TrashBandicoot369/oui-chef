import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const snap = await db.collection('menuItems')
    .where('visible', '==', true)
    .get()
  const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  // Sort by group, then by name
  const sortedData = data.sort((a: any, b: any) => {
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group)
    }
    return a.name.localeCompare(b.name)
  })
  return NextResponse.json(sortedData, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' }
  })
} 