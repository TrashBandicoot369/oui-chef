import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple validation functions for event items
function validateEventItem(data: any) {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }
  if (!data.imageUrl || typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
    throw new Error('Image URL is required and must be a non-empty string');
  }
  
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    publicId: data.publicId || null,
    visible: data.visible !== false, // default to true
    order: typeof data.order === 'number' ? data.order : 0
  };
}

function validatePartialEventItem(data: any) {
  const result: any = {};
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Title must be a non-empty string when provided');
    }
    result.title = data.title.trim();
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new Error('Description must be a non-empty string when provided');
    }
    result.description = data.description.trim();
  }
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
      throw new Error('Image URL must be a non-empty string when provided');
    }
    result.imageUrl = data.imageUrl.trim();
  }
  if (data.publicId !== undefined) {
    result.publicId = data.publicId;
  }
  if (data.visible !== undefined) {
    result.visible = Boolean(data.visible);
  }
  if (data.order !== undefined) {
    if (typeof data.order !== 'number') {
      throw new Error('Order must be a number when provided');
    }
    result.order = data.order;
  }
  return result;
}

// GET - List all event items
async function handleGet(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const eventsRef = db.collection('eventHighlights');
  const snapshot = await eventsRef.orderBy('order', 'asc').get();
  
  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));
  
  return new Response(JSON.stringify(events), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new event item
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const formData = await req.formData();
  const file = formData.get('image') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const visible = formData.get('visible') === 'true';
  const order = parseInt(formData.get('order') as string) || 0;
  
  if (!file) {
    throw new Error('Image file is required');
  }
  
  if (!title || !description) {
    throw new Error('Title and description are required');
  }
  
  // Upload image to Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadToCloudinary(buffer, {
    folder: 'events',
    tags: ['event-highlight']
  });
  
  const validatedData = validateEventItem({
    title,
    description,
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    visible,
    order
  });
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('eventHighlights').add(docData);
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

// PATCH - Update existing event item
async function handlePatch(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const formData = await req.formData();
  const id = formData.get('id') as string;
  const file = formData.get('image') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const visible = formData.get('visible') === 'true';
  const order = parseInt(formData.get('order') as string);
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const docRef = db.collection('eventHighlights').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Event item not found');
  }
  
  const existingData = doc.data();
  let updateData: any = {};
  
  // Handle text fields
  if (title !== undefined && title !== null) updateData.title = title;
  if (description !== undefined && description !== null) updateData.description = description;
  if (!isNaN(order)) updateData.order = order;
  updateData.visible = visible;
  
  // Handle image upload if provided
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // If there's an existing image, delete it first
    if (existingData?.publicId) {
      try {
        await deleteFromCloudinary(existingData.publicId);
      } catch (error) {
        console.warn('Failed to delete old image:', error);
      }
    }
    
    // Upload new image
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'events',
      tags: ['event-highlight']
    });
    
    updateData.imageUrl = uploadResult.secure_url;
    updateData.publicId = uploadResult.public_id;
  }
  
  const validatedData = validatePartialEventItem(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
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

// DELETE - Delete event item
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('eventHighlights').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Event item not found');
  }
  
  const data = doc.data();
  
  // Delete image from Cloudinary if it exists
  if (data?.publicId) {
    try {
      await deleteFromCloudinary(data.publicId);
    } catch (error) {
      console.warn('Failed to delete image from Cloudinary:', error);
    }
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Event item deleted successfully',
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
