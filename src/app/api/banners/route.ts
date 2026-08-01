import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

function withMongoShape(row: any) {
  return { ...row, _id: row.id };
}

// GET - Бүх banner авах
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ banners: (data || []).map(withMongoShape) });
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

    const supabase = getSupabase();

    // Check admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .maybeSingle();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const body = await req.json();
    const { title, subtitle, description, image, mobile_image, link, bg_color, text_color, order } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Гарчиг болон зураг шаардлагатай' },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      title,
      subtitle,
      description,
      image,
      mobile_image: mobile_image || null,
      link,
      bg_color: bg_color || '#FEE2E2',
      text_color: text_color || '#F97316',
      order: order || 0,
      is_active: true,
    };

    let { data: banner, error } = await supabase.from('banners').insert(payload).select().single();

    // The `mobile_image` column may not exist yet if the schema migration hasn't been
    // applied — fall back to inserting without it rather than hard-failing banner creation.
    if (error?.code === '42703') {
      delete payload.mobile_image;
      ({ data: banner, error } = await supabase.from('banners').insert(payload).select().single());
    }

    if (error) throw error;

    return NextResponse.json({ banner: withMongoShape(banner) }, { status: 201 });
  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { error: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}
