import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const category = await Category.findByIdAndUpdate(
      params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error approving category:', error);
    return NextResponse.json(
      { message: 'Failed to approve category' },
      { status: 500 }
    );
  }
}