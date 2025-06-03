import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EnglishCategory from '@/models/EnglishCategory';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    const categories = await EnglishCategory.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching English categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch English categories' },
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

    const category = new EnglishCategory({
      name: body.name,
      status: 'Disapproved',
      subcategories: body.subcategories || []
    });

    await category.save();

    await Notification.create({
      type: 'category_approval',
      categoryId: category._id,
      categoryName: category.name,
      isEnglish: true
    });

    return NextResponse.json(
      { message: 'English category created successfully', category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating English category:', error);
    return NextResponse.json(
      { error: 'Failed to create English category' },
      { status: 500 }
    );
  }
}
