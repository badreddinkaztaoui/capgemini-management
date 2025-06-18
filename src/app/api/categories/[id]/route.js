import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const paramsObj = await params;
    const id = paramsObj.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    try {
      const existingCategory = await Category.findById(id);

      if (!existingCategory) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      const deletedCategory = await Category.findByIdAndDelete(id);

      if (!deletedCategory) {
        return NextResponse.json(
          { error: 'Category found but could not be deleted' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Category deleted successfully', category: deletedCategory },
        { status: 200 }
      );
    } catch (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete category: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const paramsObject = await params;
    const { id } = paramsObject;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get category' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}