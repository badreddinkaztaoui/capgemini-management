import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().delete('token');

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}