import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database with timeout
    const connectPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    // Check for existing user
    const existingUser = await User.findOne({ email: body.email }).select('email').lean();
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user with hashed password
    const user = await User.create({
      ...body,
      password: hashedPassword,
      role: body.role || 'user' // Default role if not provided
    });

    // Return user data without sensitive information
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific error types
    if (error.message === 'Database connection timeout') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user. Please try again.' },
      { status: 500 }
    );
  }
}