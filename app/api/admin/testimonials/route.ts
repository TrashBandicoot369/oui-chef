import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

// Simple validation functions for testimonials
function validateTestimonial(data: any) {
  if (!data.clientName || typeof data.clientName !== 'string' || data.clientName.trim().length === 0) {
    throw new Error('Client name is required and must be a non-empty string');
  }
  if (!data.quote || typeof data.quote !== 'string' || data.quote.trim().length === 0) {
    throw new Error('Quote is required and must be a non-empty string');
  }
  if (data.rating !== undefined && (isNaN(Number(data.rating)) || Number(data.rating) < 1 || Number(data.rating) > 5)) {
    throw new Error('Rating must be a number between 1 and 5');
  }
  
  return {
    clientName: data.clientName.trim(),
    quote: data.quote.trim(),
    rating: data.rating ? Number(data.rating) : 5,
    approved: data.approved !== undefined ? Boolean(data.approved) : false,
    order: data.order !== undefined ? Number(data.order) : 0
  };
}

function validatePartialTestimonial(data: any) {
  const result: any = {};
  if (data.clientName !== undefined) {
    if (typeof data.clientName !== 'string' || data.clientName.trim().length === 0) {
      throw new Error('Client name must be a non-empty string when provided');
    }
    result.clientName = data.clientName.trim();
  }
  if (data.quote !== undefined) {
    if (typeof data.quote !== 'string' || data.quote.trim().length === 0) {
      throw new Error('Quote must be a non-empty string when provided');
    }
    result.quote = data.quote.trim();
  }
  if (data.rating !== undefined) {
    if (isNaN(Number(data.rating)) || Number(data.rating) < 1 || Number(data.rating) > 5) {
      throw new Error('Rating must be a number between 1 and 5 when provided');
    }
    result.rating = Number(data.rating);
  }
  if (data.approved !== undefined) {
    result.approved = Boolean(data.approved);
  }
  if (data.order !== undefined) {
    result.order = Number(data.order);
  }
  return result;
}

// GET - List all testimonials
async function handleGet(req: NextRequest) {
  console.log('🔍 [API] /api/admin/testimonials GET request received');
  console.log('🔍 [API] Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    await validateAdmin(req);
    
    const testimonialsRef = db.collection('testimonials');
    console.log('🔍 [API] Firestore collection reference created');
    
    const snapshot = await testimonialsRef.get();
    console.log('🔍 [API] Firestore query executed, docs count:', snapshot.docs.length);
    
    const testimonials = snapshot.docs.map(doc => {
      const data = doc.data();
      const { createdAt, updatedAt, ...cleanData } = data;
      return {
        id: doc.id,
        ...cleanData,
        createdAt: createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
    
    console.log('🔍 [API] Testimonials mapped:', testimonials.length, 'items');
    console.log('🔍 [API] First testimonial sample:', testimonials[0] ? {
      id: testimonials[0].id,
      clientName: (testimonials[0] as any).clientName,
      hasQuote: !!(testimonials[0] as any).quote,
      approved: (testimonials[0] as any).approved,
      order: (testimonials[0] as any).order
    } : 'No testimonials found');
    
    return new Response(JSON.stringify(testimonials), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [API] Error in GET /api/admin/testimonials:', error);
    console.error('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    throw error; // Re-throw to be handled by withErrorHandling
  }
}

// POST - Create new testimonial
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const validatedData = validateTestimonial(body);
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('testimonials').add(docData);
  const doc = await docRef.get();
  
  const postDocData = doc.data();
  const { createdAt: postCreatedAt, updatedAt: postUpdatedAt, ...postCleanData } = postDocData || {};
  const responseData = {
    id: doc.id,
    ...postCleanData,
    createdAt: postCreatedAt?.toDate?.()?.toISOString() || null,
    updatedAt: postUpdatedAt?.toDate?.()?.toISOString() || null,
  };
  
  return new Response(JSON.stringify(responseData), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

// PATCH - Update existing testimonial
async function handlePatch(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const validatedData = validatePartialTestimonial(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
  
  const docRef = db.collection('testimonials').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Testimonial not found');
  }
  
  const updatePayload = {
    ...validatedData,
    updatedAt: new Date(),
  };
  
  await docRef.update(updatePayload);
  const updatedDoc = await docRef.get();
  
  const patchDocData = updatedDoc.data();
  const { createdAt: patchCreatedAt, updatedAt: patchUpdatedAt, ...patchCleanData } = patchDocData || {};
  const responseData = {
    id: updatedDoc.id,
    ...patchCleanData,
    createdAt: patchCreatedAt?.toDate?.()?.toISOString() || null,
    updatedAt: patchUpdatedAt?.toDate?.()?.toISOString() || null,
  };
  
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// DELETE - Delete testimonial
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('testimonials').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Testimonial not found');
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Testimonial deleted successfully',
    id 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Route handlers with error handling
export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
export const PATCH = withErrorHandling(handlePatch);
export const DELETE = withErrorHandling(handleDelete); 
