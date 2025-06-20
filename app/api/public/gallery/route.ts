import { db } from '@/lib/firebase-admin'

export async function GET() {
  const snapshot = await db.collection('gallery').get()
  const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}
