import { NextResponse } from 'next/server';
import { importExcelDataToMongoDB } from '@/utils/importExcelData';
import dbConnect from '@/lib/mongodb';

export const runtime = 'nodejs'; // Required for file uploads in Next.js API routes

export async function POST(request) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await dbConnect();
    const result = await importExcelDataToMongoDB(buffer);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to import Excel data' }, { status: 500 });
  }
}