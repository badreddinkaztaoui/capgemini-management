import { NextResponse } from 'next/server';
import { importEnglishExcelDataToMongoDB } from '@/utils/importEnglishExcelData';
import dbConnect from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await dbConnect();
    const result = await importEnglishExcelDataToMongoDB(buffer);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to import English Excel data' }, { status: 500 });
  }
}
