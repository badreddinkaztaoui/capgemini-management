import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = status ? { status } : { status: 'Approved' };
    const categories = await Category.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { name, subcategories, userId } = data;

    if (!name || !userId) {
      return NextResponse.json({ message: 'Name and user ID are required' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      subcategories,
      createdBy: userId,
      status: 'Pending'
    });

    return NextResponse.json({ message: 'Category created successfully', category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Error creating category' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    await Category.deleteMany({});
    return NextResponse.json({ message: 'All categories deleted successfully' });
  } catch (error) {
    console.error('Error deleting categories:', error);
    return NextResponse.json({ message: 'Error deleting categories' }, { status: 500 });
  }
}