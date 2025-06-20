/**
 * Client-safe Cloudinary utilities
 * These functions can be used in client components
 */

// Get optimized thumbnail URL without importing Cloudinary SDK
export function getCloudinaryThumbnailUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    cloudName?: string;
  } = {}
): string {
  const cloudName = options.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not found');
    return '';
  }

  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  // Add default optimizations
  if (!options.quality) transformations.push('q_auto');
  if (!options.format) transformations.push('f_auto');
  
  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

// Get full-size image URL
export function getCloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    cloudName?: string;
  } = {}
): string {
  return getCloudinaryThumbnailUrl(publicId, options);
} 