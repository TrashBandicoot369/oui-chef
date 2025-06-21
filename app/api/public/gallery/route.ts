import { db } from '@/lib/firebase-admin';
import { withErrorHandling } from '@/lib/apiHandler';

// GET - List all visible gallery items
async function handleGet() {
  try {
    console.log('🔍 [PUBLIC GALLERY] Starting gallery fetch...');
    
    const galleryRef = db.collection('gallery');
    const snapshot = await galleryRef.get();
    
    console.log(`📊 [PUBLIC GALLERY] Found ${snapshot.docs.length} total documents`);
    
    // Log all raw documents for debugging
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📄 [PUBLIC GALLERY] Doc ${index + 1}:`, {
        id: doc.id,
        hasTitle: !!data.title,
        hasAlt: !!data.alt,
        hasDescription: !!data.description,
        hasImageUrl: !!data.imageUrl,
        hasUrl: !!data.url,
        hasImage: !!data.image,
        hasPublicId: !!data.publicId,
        visible: data.visible,
        order: data.order,
        category: data.category,
        rawData: data
      });
    });
    
    // Filter and sort in JavaScript to avoid index requirements
    const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`🔄 [PUBLIC GALLERY] All docs mapped: ${allDocs.length}`);
    
    const visibleDocs = allDocs.filter((doc: any) => {
      const isVisible = doc.visible === true;
      console.log(`👁️ [PUBLIC GALLERY] Doc ${doc.id} visible check: ${isVisible} (visible field: ${doc.visible})`);
      return isVisible;
    });
    console.log(`✅ [PUBLIC GALLERY] Visible docs: ${visibleDocs.length}`);
    
    const sortedDocs = visibleDocs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    console.log(`🔢 [PUBLIC GALLERY] Sorted docs: ${sortedDocs.length}`);
    
    const galleryItems = sortedDocs.map((doc: any) => {
      const imageUrl = doc.imageUrl || doc.url || doc.image;
      const title = doc.title || doc.alt || 'Untitled Event';
      
      console.log(`🖼️ [PUBLIC GALLERY] Processing doc ${doc.id}:`, {
        originalImageUrl: doc.imageUrl,
        originalUrl: doc.url,
        originalImage: doc.image,
        finalImageUrl: imageUrl,
        originalTitle: doc.title,
        originalAlt: doc.alt,
        finalTitle: title,
        publicId: doc.publicId
      });
      
      const item = {
        id: doc.id,
        title: title,
        description: doc.description || 'Event description',
        imageUrl: imageUrl,
        publicId: doc.publicId,
        category: doc.category || 'event',
        featured: doc.featured || false,
        order: doc.order || 0,
      };
      
      console.log(`✨ [PUBLIC GALLERY] Final item:`, item);
      return item;
    });
    
    console.log(`🎯 [PUBLIC GALLERY] Final response: ${galleryItems.length} items`);
    console.log('📤 [PUBLIC GALLERY] Complete response:', galleryItems);
    
    return new Response(JSON.stringify(galleryItems), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error) {
    console.error('❌ [PUBLIC GALLERY] Error:', error);
    throw error;
  }
}

export const GET = withErrorHandling(handleGet); 