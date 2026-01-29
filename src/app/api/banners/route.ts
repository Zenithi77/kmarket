import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Banner, User } from '@/lib/models';

// GET - Бүх banner авах
export async function GET() {
  try {
    await connectDB();
    
    const banners = await Banner.find({ is_active: true })
      .sort({ order: 1, created_at: -1 });
    
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// POST - Шинэ banner нэмэх (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    await connectDB();

    // Check admin role
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const body = await req.json();
    const { title, subtitle, description, image, link, bg_color, text_color, order } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Гарчиг болон зураг шаардлагатай' },
        { status: 400 }
      );
    }

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      image,
      link,
      bg_color: bg_color || '#FEE2E2',
      text_color: text_color || '#F97316',
      order: order || 0,
      is_active: true,
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}
