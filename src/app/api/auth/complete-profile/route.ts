import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      );
    }

    const { full_name, phone, address, gender } = await request.json();

    // Validate required fields
    if (!full_name?.trim()) {
      return NextResponse.json(
        { error: 'Нэр оруулна уу' },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Утасны дугаар оруулна уу' },
        { status: 400 }
      );
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { error: 'Хаяг оруулна уу' },
        { status: 400 }
      );
    }

    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json(
        { error: 'Хүйс сонгоно уу' },
        { status: 400 }
      );
    }

    // Validate phone format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^[89]\d{7}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Утасны дугаар буруу байна' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Find and update the user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: full_name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        gender,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('email', session.user.email)
      .select()
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Бүртгэл амжилттай шинэчлэгдлээ',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        profileCompleted: user.profile_completed,
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { error: 'Серверийн алдаа' },
      { status: 500 }
    );
  }
}
