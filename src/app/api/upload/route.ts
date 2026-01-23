import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadImages, deleteImage } from '@/lib/cloudinary';

// POST /api/upload - Upload images to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, folder = 'kmarket/products' } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'Зураг шаардлагатай' }, { status: 400 });
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
    return NextResponse.json({ error: 'Зураг оруулахад алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/upload - Delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID шаардлагатай' }, { status: 400 });
    }

    await deleteImage(publicId);
    return NextResponse.json({ message: 'Зураг устгагдлаа' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Зураг устгахад алдаа гарлаа' }, { status: 500 });
  }
}
