import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple validation functions for media items
function validateMediaItem(data: any) {
  if (!data.filename || typeof data.filename !== 'string' || data.filename.trim().length === 0) {
    throw new Error('Filename is required and must be a non-empty string');
  }
  if (!data.url || typeof data.url !== 'string' || data.url.trim().length === 0) {
    throw new Error('URL is required and must be a non-empty string');
  }
  if (!data.type || typeof data.type !== 'string' || data.type.trim().length === 0) {
    throw new Error('Type is required and must be a non-empty string');
  }
  if (data.size !== undefined && (isNaN(Number(data.size)) || Number(data.size) < 0)) {
    throw new Error('Size must be a positive number');
  }
  
  return {
    filename: data.filename.trim(),
    url: data.url.trim(),
    type: data.type.trim(),
    size: data.size ? Number(data.size) : 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    alt: data.alt || ''
  };
}

function validatePartialMediaItem(data: any) {
  const result: any = {};
  if (data.filename !== undefined) {
    if (typeof data.filename !== 'string' || data.filename.trim().length === 0) {
      throw new Error('Filename must be a non-empty string when provided');
    }
    result.filename = data.filename.trim();
  }
  if (data.url !== undefined) {
    if (typeof data.url !== 'string' || data.url.trim().length === 0) {
      throw new Error('URL must be a non-empty string when provided');
    }
    result.url = data.url.trim();
  }
  if (data.type !== undefined) {
    if (typeof data.type !== 'string' || data.type.trim().length === 0) {
      throw new Error('Type must be a non-empty string when provided');
    }
    result.type = data.type.trim();
  }
  if (data.size !== undefined) {
    if (isNaN(Number(data.size)) || Number(data.size) < 0) {
      throw new Error('Size must be a positive number when provided');
    }
    result.size = Number(data.size);
  }
  if (data.tags !== undefined) {
    result.tags = Array.isArray(data.tags) ? data.tags : [];
  }
  if (data.alt !== undefined) {
    result.alt = data.alt || '';
  }
  return result;
}

// GET - List all media items
async function handleGet(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const mediaRef = db.collection('media');
  const snapshot = await mediaRef.get();
  
  const mediaItems = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));
  
  return new Response(JSON.stringify(mediaItems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new media item
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const validatedData = validateMediaItem(body);
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('media').add(docData);
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

// PATCH - Update existing media item
async function handlePatch(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const validatedData = validatePartialMediaItem(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
  
  const docRef = db.collection('media').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Media item not found');
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

// DELETE - Delete media item
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('media').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Media item not found');
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Media item deleted successfully',
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
