import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE() {
  try {
    await dbConnect();
    await Category.deleteMany({});

    return NextResponse.json(
      { message: 'All categories cleared successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing categories:', error);
    return NextResponse.json(
      { error: 'Failed to clear categories' },
      { status: 500 }
    );
  }
}