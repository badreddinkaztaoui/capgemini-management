import { NextResponse } from 'next/server';
import { importExcelDataToMongoDB } from '@/utils/importExcelData';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await importExcelDataToMongoDB(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing categories:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to import categories' },
      { status: 500 }
    );
  }
}