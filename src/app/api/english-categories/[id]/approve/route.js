import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EnglishCategory from '@/models/EnglishCategory';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const category = await EnglishCategory.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'English category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating English category status:', error);
    return NextResponse.json(
      { error: 'Failed to update English category status' },
      { status: 500 }
    );
  }
}
