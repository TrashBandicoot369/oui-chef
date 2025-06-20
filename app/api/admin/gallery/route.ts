import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

// Simple validation functions for gallery items
function validateGalleryItem(data: any) {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (!data.imageUrl || typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
    throw new Error('Image URL is required and must be a non-empty string');
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    throw new Error('Category is required and must be a non-empty string');
  }
  
  return {
    title: data.title.trim(),
    imageUrl: data.imageUrl.trim(),
    description: data.description.trim(),
    category: data.category.trim(),
    featured: data.featured || false,
    visible: data.visible !== false // default to true
  };
}

function validatePartialGalleryItem(data: any) {
  const result: any = {};
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Title must be a non-empty string when provided');
    }
    result.title = data.title.trim();
  }
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
      throw new Error('Image URL must be a non-empty string when provided');
    }
    result.imageUrl = data.imageUrl.trim();
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new Error('Description must be a non-empty string when provided');
    }
    result.description = data.description.trim();
  }
  if (data.category !== undefined) {
    if (typeof data.category !== 'string' || data.category.trim().length === 0) {
      throw new Error('Category must be a non-empty string when provided');
    }
    result.category = data.category.trim();
  }
  if (data.featured !== undefined) {
    result.featured = Boolean(data.featured);
  }
  if (data.visible !== undefined) {
    result.visible = Boolean(data.visible);
  }
  return result;
}

// GET - List all gallery items
async function handleGet(req: NextRequest) {
  await validateAdmin(req);
  
  const galleryRef = db.collection('gallery');
  const snapshot = await galleryRef.get();
  
  const galleryItems = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));
  
  return new Response(JSON.stringify(galleryItems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new gallery item
async function handlePost(req: NextRequest) {
  await validateAdmin(req);
  
  const body = await req.json();
  const validatedData = validateGalleryItem(body);
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('gallery').add(docData);
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

// PATCH - Update existing gallery item
async function handlePatch(req: NextRequest) {
  await validateAdmin(req);
  
  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const validatedData = validatePartialGalleryItem(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
  
  const docRef = db.collection('gallery').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Gallery item not found');
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

// DELETE - Delete gallery item
async function handleDelete(req: NextRequest) {
  await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('gallery').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Gallery item not found');
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Gallery item deleted successfully',
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