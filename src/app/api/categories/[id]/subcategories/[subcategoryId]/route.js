import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id, subcategoryId } = params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    category.subcategories = category.subcategories.filter(
      sub => sub._id.toString() !== subcategoryId
    );

    await category.save();
    return NextResponse.json({ message: 'Subcategory deleted successfully', category });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ message: 'Error deleting subcategory' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id, subcategoryId } = params;
    const data = await request.json();
    const { name, messages } = data;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const subcategoryIndex = category.subcategories.findIndex(sub => sub._id.toString() === subcategoryId);
    if (subcategoryIndex === -1) {
      return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
    }

    category.subcategories[subcategoryIndex] = {
      ...category.subcategories[subcategoryIndex],
      name: name || category.subcategories[subcategoryIndex].name,
      messages: messages || category.subcategories[subcategoryIndex].messages
    };

    await category.save();
    return NextResponse.json({ message: 'Subcategory updated successfully', category });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json({ message: 'Error updating subcategory' }, { status: 500 });
  }
}