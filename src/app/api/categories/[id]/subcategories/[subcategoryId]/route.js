import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id, subcategoryId } = params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Remove the subcategory
    category.subcategories = category.subcategories.filter(
      sub => sub._id.toString() !== subcategoryId
    );

    await category.save();

    return NextResponse.json(
      { message: 'Subcategory deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id, subcategoryId } = params;
    const body = await request.json();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Find and update the subcategory
    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Update subcategory fields
    if (body.name) subcategory.name = body.name;
    if (body.messages) subcategory.messages = body.messages;

    await category.save();

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}