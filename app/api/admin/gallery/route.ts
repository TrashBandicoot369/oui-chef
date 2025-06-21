import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

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
    publicId: data.publicId || null,
    featured: data.featured || false,
    visible: data.visible !== false, // default to true
    order: typeof data.order === 'number' ? data.order : 0
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
  if (data.publicId !== undefined) {
    result.publicId = data.publicId;
  }
  if (data.order !== undefined) {
    if (typeof data.order !== 'number') {
      throw new Error('Order must be a number when provided');
    }
    result.order = data.order;
  }
  return result;
}

// GET - List all gallery items
async function handleGet(req: NextRequest) {
  try {
    console.log('🔍 [ADMIN GALLERY] Starting admin gallery fetch...');
    // TEMPORARILY DISABLED: await validateAdmin(req);
    
    const galleryRef = db.collection('gallery');
    console.log('📊 [ADMIN GALLERY] Attempting to fetch with order...');
    
    let snapshot;
    try {
      snapshot = await galleryRef.orderBy('order', 'asc').get();
      console.log(`✅ [ADMIN GALLERY] Ordered query successful: ${snapshot.docs.length} docs`);
    } catch (orderError) {
      console.warn('⚠️ [ADMIN GALLERY] Order query failed, falling back to unordered:', orderError);
      snapshot = await galleryRef.get();
      console.log(`📊 [ADMIN GALLERY] Unordered query: ${snapshot.docs.length} docs`);
    }
    
    // Log all raw documents for debugging
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📄 [ADMIN GALLERY] Doc ${index + 1}:`, {
        id: doc.id,
        fields: Object.keys(data),
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
        featured: data.featured,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        rawData: data
      });
    });
    
    const galleryItems = snapshot.docs.map(doc => {
      const data = doc.data();
      const item = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
      
      console.log(`✨ [ADMIN GALLERY] Processed item:`, {
        id: item.id,
        hasImageField: !!(item as any).image,
        hasImageUrlField: !!(item as any).imageUrl,
        hasUrlField: !!(item as any).url,
        imageValue: (item as any).image || (item as any).imageUrl || (item as any).url,
        title: (item as any).title || (item as any).alt,
        visible: (item as any).visible,
        order: (item as any).order
      });
      
      return item;
    });
    
    console.log(`🎯 [ADMIN GALLERY] Final admin response: ${galleryItems.length} items`);
    
    return new Response(JSON.stringify(galleryItems), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [ADMIN GALLERY] Error:', error);
    throw error;
  }
}

// POST - Create new gallery item
async function handlePost(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const formData = await req.formData();
  const file = formData.get('image') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const featured = formData.get('featured') === 'true';
  const visible = formData.get('visible') !== 'false';
  const order = parseInt(formData.get('order') as string) || 0;
  
  if (!file) {
    throw new Error('Image file is required');
  }
  
  if (!title || !description || !category) {
    throw new Error('Title, description, and category are required');
  }
  
  // Upload image to Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadToCloudinary(buffer, {
    folder: 'gallery',
    tags: ['event-highlight', 'gallery']
  });
  
  const validatedData = validateGalleryItem({
    title,
    description,
    category,
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    featured,
    visible,
    order
  });
  
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
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
  const formData = await req.formData();
  const id = formData.get('id') as string;
  const file = formData.get('image') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const featured = formData.get('featured') === 'true';
  const visible = formData.get('visible') !== 'false';
  const order = parseInt(formData.get('order') as string);
  
  if (!id) {
    throw new Error('Document ID is required for updates');
  }
  
  const docRef = db.collection('gallery').doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Gallery item not found');
  }
  
  const existingData = doc.data();
  let updateData: any = {};
  
  // Handle text fields
  if (title !== undefined && title !== null) updateData.title = title;
  if (description !== undefined && description !== null) updateData.description = description;
  if (category !== undefined && category !== null) updateData.category = category;
  if (!isNaN(order)) updateData.order = order;
  updateData.featured = featured;
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
      folder: 'gallery',
      tags: ['event-highlight', 'gallery']
    });
    
    updateData.imageUrl = uploadResult.secure_url;
    updateData.publicId = uploadResult.public_id;
  }
  
  const validatedData = validatePartialGalleryItem(updateData);
  
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

// DELETE - Delete gallery item
async function handleDelete(req: NextRequest) {
  // TEMPORARILY DISABLED: await validateAdmin(req);
  
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