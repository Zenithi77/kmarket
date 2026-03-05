import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadImages, uploadVideo, deleteImage, deleteVideo } from '@/lib/cloudinary';

// Increase body size limit for video uploads
export const maxDuration = 60; // Allow up to 60 seconds for video processing

// POST /api/upload - Upload images/videos to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, video, folder = 'kmarket/products', type = 'image' } = body;

    // Handle video upload
    if (type === 'video' && video) {
      const result = await uploadVideo(video, folder);
      return NextResponse.json(result);
    }

    // Handle image upload
    if (!images || (Array.isArray(images) && images.length === 0)) {
      return NextResponse.json({ error: 'Зураг эсвэл бичлэг шаардлагатай' }, { status: 400 });
    }

    // images should be base64 strings or URLs
    if (Array.isArray(images)) {
      const results = await uploadImages(images, folder);
      return NextResponse.json({ images: results });
    } else {
      const result = await uploadImage(images, folder);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Файл оруулахад алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/upload - Delete image/video from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId, type = 'image' } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID шаардлагатай' }, { status: 400 });
    }

    if (type === 'video') {
      await deleteVideo(publicId);
    } else {
      await deleteImage(publicId);
    }
    return NextResponse.json({ message: 'Устгагдлаа' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Устгахад алдаа гарлаа' }, { status: 500 });
  }
}
