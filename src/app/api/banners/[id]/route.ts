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
    const { title, subtitle, description, image, mobile_image, link, bg_color, text_color, order, is_active } = body;

    const payload: Record<string, unknown> = {
      title,
      subtitle,
      description,
      image,
      mobile_image: mobile_image || null,
      link,
      bg_color,
      text_color,
      order,
      is_active,
      updated_at: new Date().toISOString(),
    };

    let { data: banner, error } = await supabase
      .from('banners')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    // The `mobile_image` column may not exist yet if the schema migration hasn't been
    // applied — fall back to updating without it rather than hard-failing the edit.
    // PGRST204 = PostgREST's "column not in schema cache" (missing column); 42703 is the
    // raw Postgres "undefined column" code — checking both covers either error shape.
    if (error?.code === 'PGRST204' || error?.code === '42703') {
      delete payload.mobile_image;
      ({ data: banner, error } = await supabase.from('banners').update(payload).eq('id', id).select().maybeSingle());
    }

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
