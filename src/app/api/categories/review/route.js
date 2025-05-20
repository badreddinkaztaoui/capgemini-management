import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ status: 'Disapproved' })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories for review:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories for review' },
      { status: 500 }
    );
  }
}