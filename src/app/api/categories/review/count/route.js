import { NextResponse } from 'next/server';
import Category from '@/models/Category';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    const count = await Category.countDocuments({ status: 'Disapproved' });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting pending categories:', error);
    return NextResponse.json(
      { message: 'Failed to count pending categories' },
      { status: 500 }
    );
  }
}