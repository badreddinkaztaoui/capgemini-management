import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/mongodb';

export async function PUT(request) {
  try {
    await dbConnect();
    const { categoryId, status } = await request.json();

    if (!categoryId || !status) {
      return NextResponse.json({ message: 'Category ID and status are required' }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { status },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category status updated successfully', category });
  } catch (error) {
    console.error('Error updating category status:', error);
    return NextResponse.json({ message: 'Error updating category status' }, { status: 500 });
  }
}