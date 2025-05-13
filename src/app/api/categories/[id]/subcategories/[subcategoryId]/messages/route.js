import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id, subcategoryId } = params;
    const body = await request.json();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Add new message
    subcategory.messages.push({
      content: body.content
    });

    await category.save();

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}