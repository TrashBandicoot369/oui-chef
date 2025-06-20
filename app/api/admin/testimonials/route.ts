import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

// Simple validation functions for testimonials
function validateTestimonial(data: any) {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new Error('Name is required and must be a non-empty string');
  }
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    throw new Error('Content is required and must be a non-empty string');
  }
  if (data.rating !== undefined && (isNaN(Number(data.rating)) || Number(data.rating) < 1 || Number(data.rating) > 5)) {
    throw new Error('Rating must be a number between 1 and 5');
  }
  
  return {
    name: data.name.trim(),
    content: data.content.trim(),
    rating: data.rating ? Number(data.rating) : 5,
    date: data.date || new Date().toISOString().split('T')[0],
    featured: data.featured || false
  };
}

function validatePartialTestimonial(data: any) {
  const result: any = {};
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Name must be a non-empty string when provided');
    }
    result.name = data.name.trim();
  }
  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      throw new Error('Content must be a non-empty string when provided');
    }
    result.content = data.content.trim();
  }
  if (data.rating !== undefined) {
    if (isNaN(Number(data.rating)) || Number(data.rating) < 1 || Number(data.rating) > 5) {
      throw new Error('Rating must be a number between 1 and 5 when provided');
    }
    result.rating = Number(data.rating);
  }
  if (data.date !== undefined) {
    result.date = data.date;
  }
  if (data.featured !== undefined) {
    result.featured = Boolean(data.featured);
  }
  return result;
}

// GET - List all testimonials
async function handleGet(req: NextRequest) {
  await validateAdmin(req);
  
  const testimonialsRef = db.collection('testimonials');
  const snapshot = await testimonialsRef.get();
  
  const testimonials = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));
  
  return new Response(JSON.stringify(testimonials), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new testimonial
async function handlePost(req: NextRequest) {
  await validateAdmin(req);
  
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
  
  const responseData = {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
  };
  
  return new Response(JSON.stringify(responseData), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

// PATCH - Update existing testimonial
async function handlePatch(req: NextRequest) {
  await validateAdmin(req);
  
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
  
  const responseData = {
    id: updatedDoc.id,
    ...updatedDoc.data(),
    createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
  };
  
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// DELETE - Delete testimonial
async function handleDelete(req: NextRequest) {
  await validateAdmin(req);
  
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