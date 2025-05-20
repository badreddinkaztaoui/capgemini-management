import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const category = await Category.findById(params.id)
      .populate('createdBy', 'name');

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    const { name, subcategories } = data;

    const category = await Category.findByIdAndUpdate(
      params.id,
      { name, subcategories },
      { new: true }
    ).populate('createdBy', 'name');

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}