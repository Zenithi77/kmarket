import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/lib/models';

// GET /api/categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ is_active: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // Organize into parent/child structure
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
    await connectDB();
    const body = await request.json();

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({ ...body, slug });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
