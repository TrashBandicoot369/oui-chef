import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { validateAdmin, withErrorHandling } from '@/lib/apiHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function validateFoodShowcaseItem(data: any) {
  if (!data.imageUrl || typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
    throw new Error('Image URL is required and must be a non-empty string');
  }
  
  return {
    imageUrl: data.imageUrl.trim(),
    publicId: data.publicId || null,
    alt: data.alt || '',
    visible: data.visible !== false,
    order: typeof data.order === 'number' ? data.order : 0
  };
}

function validatePartialFoodShowcaseItem(data: any) {
  const result: any = {};
  
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string' || data.imageUrl.trim().length === 0) {
      throw new Error('Image URL must be a non-empty string when provided');
    }
    result.imageUrl = data.imageUrl.trim();
  }
  
  if (data.publicId !== undefined) {
    result.publicId = data.publicId;
  }
  
  if (data.alt !== undefined) {
    result.alt = data.alt;
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

export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log('🚀 GET /api/admin/food-showcase - Fetching all food showcase items');
  
  await validateAdmin(request);
  
  const snapshot = await db.collection('food-showcase').orderBy('order', 'asc').get();
  
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  console.log(`✅ Retrieved ${items.length} food showcase items`);
  
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log('🚀 POST /api/admin/food-showcase - Creating new food showcase item');
  
  await validateAdmin(request);
  
  const data = await request.json();
  console.log('📝 Request data:', data);
  
  const validatedData = validateFoodShowcaseItem(data);
  
  // Check if we're at the 12 item limit
  const existingSnapshot = await db.collection('food-showcase').get();
  if (existingSnapshot.size >= 12) {
    console.log('❌ Maximum of 12 food showcase items allowed');
    throw new Error('Maximum of 12 food showcase items allowed');
  }
  
  // Handle image upload if base64 data provided
  let finalImageUrl = validatedData.imageUrl;
  let finalPublicId = validatedData.publicId;
  
  if (data.image && data.image.startsWith('data:')) {
    console.log('📤 Uploading image to Cloudinary');
    const cloudinaryResult = await uploadToCloudinary(data.image, 'food-showcase');
    finalImageUrl = cloudinaryResult.secure_url;
    finalPublicId = cloudinaryResult.public_id;
    console.log('✅ Image uploaded successfully');
  }
  
  const docData = {
    ...validatedData,
    imageUrl: finalImageUrl,
    publicId: finalPublicId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await db.collection('food-showcase').add(docData);
  
  console.log(`✅ Food showcase item created with ID: ${docRef.id}`);
  
  return new Response(JSON.stringify({ 
    id: docRef.id, 
    ...docData 
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  console.log('🚀 PATCH /api/admin/food-showcase - Updating food showcase item');
  
  await validateAdmin(request);
  
  const data = await request.json();
  console.log('📝 Request data:', data);
  
  if (!data.id) {
    throw new Error('Item ID is required for updates');
  }
  
  const docRef = db.collection('food-showcase').doc(data.id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Food showcase item not found');
  }
  
  const validatedData = validatePartialFoodShowcaseItem(data);
  
  // Handle image upload if base64 data provided
  if (data.image && data.image.startsWith('data:')) {
    console.log('📤 Uploading new image to Cloudinary');
    
    // Delete old image if it exists
    const currentData = doc.data();
    if (currentData?.publicId) {
      try {
        await deleteFromCloudinary(currentData.publicId);
        console.log('🗑️ Old image deleted from Cloudinary');
      } catch (error) {
        console.log('⚠️ Failed to delete old image:', error);
      }
    }
    
    const cloudinaryResult = await uploadToCloudinary(data.image, 'food-showcase');
    validatedData.imageUrl = cloudinaryResult.secure_url;
    validatedData.publicId = cloudinaryResult.public_id;
    console.log('✅ New image uploaded successfully');
  }
  
  const updateData = {
    ...validatedData,
    updatedAt: new Date().toISOString()
  };
  
  await docRef.update(updateData);
  
  console.log(`✅ Food showcase item ${data.id} updated successfully`);
  
  return new Response(JSON.stringify({ 
    id: data.id, 
    ...updateData 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  console.log('🚀 DELETE /api/admin/food-showcase - Deleting food showcase item');
  
  await validateAdmin(request);
  
  const data = await request.json();
  console.log('📝 Request data:', data);
  
  if (!data.id) {
    throw new Error('Item ID is required for deletion');
  }
  
  const docRef = db.collection('food-showcase').doc(data.id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error('Food showcase item not found');
  }
  
  const itemData = doc.data();
  
  // Delete image from Cloudinary if it exists
  if (itemData?.publicId) {
    try {
      await deleteFromCloudinary(itemData.publicId);
      console.log('🗑️ Image deleted from Cloudinary');
    } catch (error) {
      console.log('⚠️ Failed to delete image from Cloudinary:', error);
    }
  }
  
  await docRef.delete();
  
  console.log(`✅ Food showcase item ${data.id} deleted successfully`);
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});