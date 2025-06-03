import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EnglishCategory from '@/models/EnglishCategory';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const category = await EnglishCategory.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'English category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching English category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch English category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const category = await EnglishCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'English category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'English category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting English category:', error);
    return NextResponse.json(
      { error: 'Failed to delete English category' },
      { status: 500 }
    );
  }
}
