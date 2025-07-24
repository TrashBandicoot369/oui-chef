import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple validation functions for menu items
function validateMenuItem(data: any) {
  if (!data.group || typeof data.group !== 'string' || data.group.trim().length === 0) {
    throw new Error('Group is required and must be a non-empty string');
  }
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new Error('Name is required and must be a non-empty string');
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }
  if (data.price === undefined || isNaN(Number(data.price)) || Number(data.price) < 0) {
    throw new Error('Price is required and must be a positive number');
  }
  
  return {
    group: data.group.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    price: Number(data.price),
    tags: Array.isArray(data.tags) ? data.tags : [],
    visible: data.visible !== false // default to true
  };
}

function validatePartialMenuItem(data: any) {
  const result: any = {};
  if (data.group !== undefined) {
    if (typeof data.group !== 'string' || data.group.trim().length === 0) {
      throw new Error('Group must be a non-empty string when provided');
    }
    result.group = data.group.trim();
  }
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Name must be a non-empty string when provided');
    }
    result.name = data.name.trim();
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new Error('Description must be a non-empty string when provided');
    }
    result.description = data.description.trim();
  }
  if (data.price !== undefined) {
    if (isNaN(Number(data.price)) || Number(data.price) < 0) {
      throw new Error('Price must be a positive number when provided');
    }
    result.price = Number(data.price);
  }
  if (data.tags !== undefined) {
    result.tags = Array.isArray(data.tags) ? data.tags : [];
  }
  if (data.visible !== undefined) {
    result.visible = Boolean(data.visible);
  }
  return result;
}

// GET - List all menu items
async function handleGet(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const menuRef = db.collection('menuItems');
  const snapshot = await menuRef.get();
  
      const menuItems = snapshot.docs.map(doc => {
      const data = doc.data();
      const { createdAt, updatedAt, ...cleanData } = data;
      return {
        id: doc.id,
        ...cleanData,
        createdAt: createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedAt?.toDate?.()?.toISOString() || null,
      };
    });
  
  return new Response(JSON.stringify(menuItems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST - Create new menu item
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const validatedData = validateMenuItem(body);
  
  const timestamp = new Date();
  const docData = {
    ...validatedData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await db.collection('menuItems').add(docData);
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

// PATCH - Update existing menu item
async function handlePatch(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id, ...updateData } = body;
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const validatedData = validatePartialMenuItem(updateData);
  
  if (Object.keys(validatedData).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
  
  const docRef = db.collection('menuItems').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Menu item not found');
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

// DELETE - Delete menu item
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const body = await req.json();
  const { id } = body;
  
  if (!id) {
    throw new Error('Document ID is required for deletion');
  }
  
  const docRef = db.collection('menuItems').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Menu item not found');
  }
  
  await docRef.delete();
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Menu item deleted successfully',
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