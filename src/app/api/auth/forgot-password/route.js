import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email/sendEmail';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'If your email exists in our system, you will receive a password reset link' },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    const resetTokenHashed = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name
      });

    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    return NextResponse.json(
      { message: 'If your email exists in our system, you will receive a password reset link' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
