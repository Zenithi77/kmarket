import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';

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

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        provider: user.provider || 'credentials',
        profileCompleted: user.profileCompleted,
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

    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        full_name: full_name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        gender: gender || undefined,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Хэрэглэгч олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Профайл амжилттай шинэчлэгдлээ',
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        provider: user.provider || 'credentials',
        profileCompleted: user.profileCompleted,
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
