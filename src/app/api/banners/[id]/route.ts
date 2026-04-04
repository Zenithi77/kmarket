import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Banner, User } from '@/lib/models';

// GET - Нэг banner авах
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const banner = await Banner.findById(id);
    
    if (!banner) {
      return NextResponse.json({ error: 'Banner олдсонгүй' }, { status: 404 });
    }
    
    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Banner fetch error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// PUT - Banner засах (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { title, subtitle, description, image, link, bg_color, text_color, order, is_active } = body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      {
        title,
        subtitle,
        description,
        image,
        link,
        bg_color,
        text_color,
        order,
        is_active,
      },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json({ error: 'Banner олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Banner update error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}

// DELETE - Banner устгах (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json({ error: 'Banner олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Banner устгагдлаа' });
  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}
