import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const doc = await db.collection('theme').doc('current').get()
    return NextResponse.json(doc.exists ? doc.data() : {})
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load theme' }, { status: 500 })
  }
}
