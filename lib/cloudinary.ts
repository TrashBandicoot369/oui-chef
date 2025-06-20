/**
 * Cloudinary utilities for server-side use only
 * DO NOT import this file in client components
 * Use in API routes and server-side functions only
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Upload a file buffer to Cloudinary
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    tags?: string[];
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'media',
        public_id: options.public_id,
        resource_type: options.resource_type || 'auto',
        tags: options.tags,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed - no result'));
        }
      }
    ).end(buffer);
  });
}

// Replace an existing asset by uploading to the same public_id
export async function replaceCloudinaryAsset(
  buffer: Buffer,
  publicId: string,
  options: {
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    tags?: string[];
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
}> {
  return uploadToCloudinary(buffer, {
    public_id: publicId,
    resource_type: options.resource_type,
    tags: options.tags,
  });
}

// Delete an asset from Cloudinary
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

// Note: For client-side thumbnail URL generation, use /lib/cloudinary-client.ts 