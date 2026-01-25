import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kmarket-secret-key';

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase(), is_active: true });
    if (!user) {
      return NextResponse.json({ error: 'Имэйл эсвэл нууц үг буруу' }, { status: 401 });
    }

    // Check if user has password (OAuth users don't have password)
    if (!user.password) {
      return NextResponse.json({ error: 'Та Google-ээр бүртгүүлсэн байна. Google-ээр нэвтэрнэ үү.' }, { status: 401 });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Имэйл эсвэл нууц үг буруу' }, { status: 401 });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
