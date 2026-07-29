import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

async function requireAdmin(email: string) {
  const supabase = getSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .maybeSingle();
  return user?.role === 'admin';
}

// GET - Нэг banner авах
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;

    const { data: banner } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!banner) {
      return NextResponse.json({ error: 'Banner олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ banner: withMongoShape(banner) });
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

    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const supabase = getSupabase();
    const body = await req.json();
    const { title, subtitle, description, image, link, bg_color, text_color, order, is_active } = body;

    const { data: banner, error } = await supabase
      .from('banners')
      .update({
        title,
        subtitle,
        description,
        image,
        link,
        bg_color,
        text_color,
        order,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error || !banner) {
      return NextResponse.json({ error: 'Banner олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ banner: withMongoShape(banner) });
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

    if (!(await requireAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { data: banner } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

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
