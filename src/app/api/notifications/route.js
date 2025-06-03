import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await dbConnect();
    
    // First try to get notifications without populate to check if basic query works
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    
    // Then try to populate with error handling for each document
    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        try {
          // Convert to plain object for manipulation
          const notifObj = notification.toObject();
          
          // Only try to populate if categoryId exists
          if (notification.categoryId) {
            const Category = mongoose.models.Category;
            if (Category) {
              const category = await Category.findById(notification.categoryId).select('name status');
              if (category) {
                notifObj.categoryId = category;
              }
            }
          }
          
          return notifObj;
        } catch (err) {
          console.error(`Error populating notification ${notification._id}:`, err);
          return notification.toObject();
        }
      })
    );

    return NextResponse.json({ notifications: populatedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { notificationId } = await request.json();

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}