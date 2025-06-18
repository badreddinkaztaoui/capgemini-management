import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EnglishCategory from '@/models/EnglishCategory';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const paramsObj = await params;
    const { id, subcategoryId } = paramsObj;
    const body = await request.json();

    const category = await EnglishCategory.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'English category not found' },
        { status: 404 }
      );
    }

    const subcategoryIndex = category.subcategories.findIndex(
      (sub) => sub._id.toString() === subcategoryId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    if (body.name) {
      category.subcategories[subcategoryIndex].name = body.name;
    }

    if (body.messages) {
      category.subcategories[subcategoryIndex].messages = body.messages;
    }

    await category.save();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating English subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update English subcategory' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const paramsObj = await params;
    const { id, subcategoryId } = paramsObj;

    const category = await EnglishCategory.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'English category not found' },
        { status: 404 }
      );
    }

    const subcategoryIndex = category.subcategories.findIndex(
      (sub) => sub._id.toString() === subcategoryId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();

    return NextResponse.json(
      { message: 'Subcategory deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting English subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete English subcategory' },
      { status: 500 }
    );
  }
}
