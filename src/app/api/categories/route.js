import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ status: 'Approved' });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await Category.deleteMany({});
    return NextResponse.json({ message: 'All categories deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = new Category({
      name: body.name,
      subcategories: body.subcategories || []
    });

    await category.save();

    return NextResponse.json(
      { message: 'Category created successfully', category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}