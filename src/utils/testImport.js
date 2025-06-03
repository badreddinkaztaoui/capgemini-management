import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importEnglishExcelDataToMongoDB } from './importEnglishExcelData.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImport() {
  try {
    console.log('Starting test import...');
    
    // Path to the Excel file
    const filePath = path.join(process.cwd(), 'public', 'data.xlsx');
    console.log('Reading file from:', filePath);
    
    // Read the Excel file
    const excelBuffer = fs.readFileSync(filePath);
    console.log('File read successfully, size:', excelBuffer.length, 'bytes');
    
    // Import the data
    const result = await importEnglishExcelDataToMongoDB(excelBuffer);
    console.log('Import result:', result);
    
    console.log('Test import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during test import:', error);
    process.exit(1);
  }
}

testImport();
