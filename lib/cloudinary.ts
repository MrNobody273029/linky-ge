// lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

export { cloudinary };

export function cloudinaryReady() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads a browser File (from formData) to Cloudinary and returns secure_url.
 * Works in Next.js Route Handlers (Node runtime).
 */
export async function uploadToCloudinary(
  file: File,
  opts?: { folder?: string }
): Promise<string> {
  if (!cloudinaryReady()) {
    throw new Error('Cloudinary env vars are missing');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const folder = opts?.folder || 'linky/offers';

  return await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: true
      },
      (err, result) => {
        if (err || !result?.secure_url) return reject(err || new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}
