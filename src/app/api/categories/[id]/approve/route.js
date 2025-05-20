import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Notification from '@/models/Notification';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { status } = await request.json();

    if (!['Approved', 'Disapproved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Mark notification as read
    await Notification.findOneAndUpdate(
      { categoryId: id },
      { isRead: true }
    );

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category status:', error);
    return NextResponse.json(
      { error: 'Failed to update category status' },
      { status: 500 }
    );
  }
}