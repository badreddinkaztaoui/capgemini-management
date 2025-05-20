import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category rejected and deleted successfully' });
  } catch (error) {
    console.error('Error rejecting category:', error);
    return NextResponse.json(
      { message: 'Failed to reject category' },
      { status: 500 }
    );
  }
}