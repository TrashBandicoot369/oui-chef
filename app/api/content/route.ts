import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const snap = await db.collection('siteCopy').get()
  const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  // Sort by section name for consistent ordering
  const sortedData = data.sort((a: any, b: any) => a.section.localeCompare(b.section))
  return NextResponse.json(sortedData)
} 