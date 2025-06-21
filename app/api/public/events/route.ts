import { db } from '@/lib/firebase-admin';
import { withErrorHandling } from '@/lib/apiHandler';

// GET - List all visible events
async function handleGet() {
  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.where('visible', '==', true).orderBy('order', 'asc').get();
  
  const events = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      publicId: data.publicId,
      order: data.order,
    };
  });
  
  return new Response(JSON.stringify(events), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    },
  });
}

export const GET = withErrorHandling(handleGet); 