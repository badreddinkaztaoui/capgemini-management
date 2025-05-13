import { NextResponse } from 'next/server';
import { importExcelDataToMongoDB } from '@/utils/importExcelData';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();

    // Use the import utility
    await importExcelDataToMongoDB(buffer);

    return NextResponse.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}