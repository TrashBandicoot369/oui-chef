import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const snapshot = await db.collection('siteCopy').get()
    const data = snapshot.docs.reduce((acc: any, doc) => {
      acc[doc.id] = doc.data()
      return acc
    }, {})
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load copy' }, { status: 500 })
  }
}
