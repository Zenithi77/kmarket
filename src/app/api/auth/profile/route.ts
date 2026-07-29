import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, phone, address, gender, provider, profile_completed')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        provider: user.provider || 'credentials',
        profileCompleted: user.profile_completed,
      }
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Серверийн алдаа' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, phone, address, gender } = body;

    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: full_name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        gender: gender || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('email', session.user.email)
      .select('id, email, full_name, phone, address, gender, provider, profile_completed')
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Профайл амжилттай шинэчлэгдлээ',
      user: {
        _id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        provider: user.provider || 'credentials',
        profileCompleted: user.profile_completed,
      }
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Серверийн алдаа' },
      { status: 500 }
    );
  }
}
