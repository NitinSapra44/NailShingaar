import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function uploadBufferToCloudinary(buffer: Buffer, folder: string): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `nail-shingaar/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });
}
