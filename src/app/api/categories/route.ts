import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Category, User } from '@/lib/models';

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parentSlug = searchParams.get('parent');
    const flat = searchParams.get('flat') === 'true';

    const categories = await Category.find({ is_active: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // If requesting flat list (for dropdowns)
    if (flat) {
      return NextResponse.json(categories);
    }

    // If requesting subcategories of a specific parent
    if (parentSlug) {
      const parent = categories.find(c => c.slug === parentSlug && !c.parent_id);
      if (!parent) {
        return NextResponse.json([]);
      }
      const subs = categories.filter(c => c.parent_id?.toString() === parent._id.toString());
      return NextResponse.json(subs);
    }

    // Default: organize into parent/child structure
    const parents = categories.filter(c => !c.parent_id);
    const result = parents.map(parent => ({
      ...parent,
      subcategories: categories.filter(c => 
        c.parent_id?.toString() === parent._id.toString()
      ),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// POST /api/categories (Admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    await connectDB();

    // Check admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const body = await request.json();

    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'Энэ slug аль хэдийн байна' }, { status: 400 });
    }

    const category = await Category.create({ 
      name: body.name,
      slug,
      icon: body.icon,
      image: body.image,
      parent_id: body.parent_id || undefined,
      filters: body.filters || [],
      order: body.order || 0,
      is_active: true,
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// PUT /api/categories (Admin) - Update category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    const category = await Category.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Категори олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// DELETE /api/categories (Admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Зөвхөн админ' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);
    // Also delete subcategories
    await Category.deleteMany({ parent_id: id });

    return NextResponse.json({ message: 'Устгагдлаа' });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
