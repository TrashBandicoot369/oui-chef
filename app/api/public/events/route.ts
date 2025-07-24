import { db } from '@/lib/firebase-admin';
import { withErrorHandling } from '@/lib/apiHandler';

// GET - List all visible events
async function handleGet() {
  const eventsRef = db.collection('eventHighlights');
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
      'Cache-Control': 'no-store, must-revalidate'
    },
  });
}

export const GET = withErrorHandling(handleGet); 