import { NextResponse } from 'next/server';
import { importExcelDataToMongoDB } from '@/utils/importExcelData';

export const maxDuration = 300; // Set maximum duration to 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel file.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();

    // Use the import utility
    await importExcelDataToMongoDB(buffer);

    return NextResponse.json({
      success: true,
      message: 'Data imported successfully'
    });
  } catch (error) {
    console.error('Import error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Invalid data format in Excel file'
      }, { status: 400 });
    }

    if (error.name === 'TimeoutError') {
      return NextResponse.json({
        error: 'Import operation timed out. Please try with a smaller file or contact support.'
      }, { status: 504 });
    }

    return NextResponse.json({
      error: 'Failed to import data. Please check the file format and try again.'
    }, { status: 500 });
  }
}