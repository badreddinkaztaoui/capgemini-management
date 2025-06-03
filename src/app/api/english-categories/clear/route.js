import { NextResponse } from 'next/server';
import EnglishCategory from '@/models/EnglishCategory';
import dbConnect from '@/lib/mongodb';

export async function DELETE() {
  try {
    await dbConnect();

    const result = await EnglishCategory.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cleared English categories database. Deleted ${result.deletedCount} categories.`
    });
  } catch (error) {
    console.error('Error clearing English categories:', error);
    return NextResponse.json(
      { error: 'Failed to clear English categories database' },
      { status: 500 }
    );
  }
}
