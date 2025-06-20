import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const snapshot = await db.collection('gallery').get()
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 })
  }
}
