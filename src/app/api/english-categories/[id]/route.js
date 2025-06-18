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
    const paramsObj = await params;
    const id = paramsObj.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid English category ID format' },
        { status: 400 }
      );
    }

    try {
      const existingCategory = await EnglishCategory.findById(id);

      if (!existingCategory) {
        return NextResponse.json(
          { error: 'English category not found' },
          { status: 404 }
        );
      }

      const deletedCategory = await EnglishCategory.findByIdAndDelete(id);

      if (!deletedCategory) {
        return NextResponse.json(
          { error: 'English category found but could not be deleted' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'English category deleted successfully', category: deletedCategory },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error when deleting English category:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: `Failed to delete English category: ${error.message}` },
      { status: 500 }
    );
  }
}
