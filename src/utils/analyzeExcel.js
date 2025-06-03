import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Function to analyze the Excel file structure
async function analyzeExcelFile(filePath) {
  try {
    // Read the Excel file
    const excelBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(excelBuffer);
    
    // Get the first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
    
    // Print the headers and first few rows
    console.log('Sheet Names:', workbook.SheetNames);
    console.log('Headers:', data[0]);
    console.log('First row:', data[1]);
    console.log('Second row:', data[2]);
    
    // Check for expected column names
    const headerRow = data[0];
    const expectedColumns = ['categories', 'subcategories', 'messages', 'messages ', 'status'];
    const foundColumns = [];
    
    // Check if the expected columns exist in any form
    Object.keys(headerRow).forEach(key => {
      const value = headerRow[key];
      if (expectedColumns.includes(value)) {
        foundColumns.push(value);
      } else {
        console.log(`Unexpected column: ${key} = ${value}`);
      }
    });
    
    console.log('Found expected columns:', foundColumns);
    console.log('Missing columns:', expectedColumns.filter(col => !foundColumns.includes(col)));
    
    // Check the data structure
    console.log('\nAnalyzing data structure:');
    const sampleRows = data.slice(1, 6); // Get a few sample rows
    sampleRows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    return {
      success: true,
      sheetNames: workbook.SheetNames,
      headers: data[0],
      sampleData: data.slice(1, 6),
      foundColumns,
      missingColumns: expectedColumns.filter(col => !foundColumns.includes(col))
    };
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    return { success: false, error: error.message };
  }
}

// Path to the Excel file
const filePath = path.join(process.cwd(), 'public', 'data.xlsx');
console.log('Analyzing file:', filePath);

analyzeExcelFile(filePath)
  .then(result => {
    console.log('Analysis complete');
  })
  .catch(error => {
    console.error('Analysis failed:', error);
  });
