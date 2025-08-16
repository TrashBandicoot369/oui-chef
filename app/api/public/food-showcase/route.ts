import { db } from '@/lib/firebase-admin';
import { withErrorHandling } from '@/lib/apiHandler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withErrorHandling(async () => {
  console.log('🚀 GET /api/public/food-showcase - Fetching visible food showcase items');
  
  const snapshot = await db
    .collection('food-showcase')
    .where('visible', '==', true)
    .orderBy('order', 'asc')
    .get();
  
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  console.log(`✅ Retrieved ${items.length} visible food showcase items`);
  
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});