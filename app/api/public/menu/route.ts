import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const snapshot = await db.collection('menu').get()
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}
