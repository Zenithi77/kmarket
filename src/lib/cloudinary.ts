import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export async function uploadImage(file: string, folder: string = 'kmarket') {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload алдаа:', error);
    throw error;
  }
}

// Upload video to Cloudinary
export async function uploadVideo(file: string, folder: string = 'kmarket/videos') {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'video',
      eager: [
        { width: 720, crop: 'limit', quality: 'auto', format: 'mp4' },
      ],
      eager_async: true,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      resourceType: 'video' as const,
    };
  } catch (error) {
    console.error('Cloudinary video upload алдаа:', error);
    throw error;
  }
}

// Upload multiple images
export async function uploadImages(files: string[], folder: string = 'kmarket/products') {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

// Upload multiple media files (images and videos)
export async function uploadMedia(files: { data: string; type: 'image' | 'video' }[], folder: string = 'kmarket/products') {
  const uploadPromises = files.map((file) => {
    if (file.type === 'video') {
      return uploadVideo(file.data, folder);
    }
    return uploadImage(file.data, folder);
  });
  return Promise.all(uploadPromises);
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete алдаа:', error);
    throw error;
  }
}

// Delete video from Cloudinary
export async function deleteVideo(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    return true;
  } catch (error) {
    console.error('Cloudinary video delete алдаа:', error);
    throw error;
  }
}
