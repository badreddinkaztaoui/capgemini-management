import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EnglishCategory from '@/models/EnglishCategory';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const category = await EnglishCategory.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if subcategory already exists
    const subcategoryExists = category.subcategories.some(
      sub => sub.name === body.name
    );

    if (subcategoryExists) {
      return NextResponse.json(
        { error: 'Subcategory already exists' },
        { status: 400 }
      );
    }

    // Add new subcategory
    category.subcategories.push({
      name: body.name,
      messages: body.messages || []
    });

    await category.save();

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add subcategory' },
      { status: 500 }
    );
  }
}
