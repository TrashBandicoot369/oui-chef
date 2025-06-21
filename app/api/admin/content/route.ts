import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

// Simple validation functions (replace with Zod after installation)
function validateContent(data: any) {
  if (!data.section || typeof data.section !== 'string' || data.section.trim().length === 0) {
    throw new Error('Section is required and must be a non-empty string');
  }
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    throw new Error('Content is required and must be a non-empty string');
  }
  return {
    section: data.section.trim(),
    content: data.content.trim(),
  };
}

function validatePartialContent(data: any) {
  const result: any = {};
  if (data.section !== undefined) {
    if (typeof data.section !== 'string' || data.section.trim().length === 0) {
      throw new Error('Section must be a non-empty string when provided');
    }
    result.section = data.section.trim();
  }
  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      throw new Error('Content must be a non-empty string when provided');
    }
    result.content = data.content.trim();
  }
  return result;
}

// GET - List all content
async function handleGet(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const contentRef = db.collection('content');
  const snapshot = await contentRef.get();
  
  const content = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));
  
  return new Response(JSON.stringify(content), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new content
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const validatedData = validateContent(body);
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('content').add(docData);
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

// PATCH - Update existing content
async function handlePatch(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const validatedData = validatePartialContent(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
  
  const docRef = db.collection('content').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Content not found');
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

// DELETE - Delete content
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('content').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Content not found');
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Content deleted successfully',
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