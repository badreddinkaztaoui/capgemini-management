import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
      status: 'Disapproved',
      subcategories: body.subcategories || []
    });

    await category.save();

    await Notification.create({
      type: 'category_approval',
      categoryId: category._id,
      categoryName: category.name
    });

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