import * as XLSX from 'xlsx';
import EnglishCategory from '../models/EnglishCategory';
import mongoose from 'mongoose';

export async function importEnglishExcelDataToMongoDB(excelBuffer) {
  try {
    console.log('Starting Excel import process...');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const workbook = XLSX.read(excelBuffer);
    console.log('Excel file read successfully. Sheet names:', workbook.SheetNames);

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Converted ${data.length} rows to JSON. Sample first row:`, data[0]);

    const categoriesMap = new Map();

    data.forEach(item => {
      // Handle column names with or without trailing spaces
      const categoryName = item.categories || item['categories '];
      const subcategoryName = item.subcategories || item['subcategories '];
      const message = item.messages || item['messages '];
      const status = item.status || 'Approved';

      // Skip rows with missing essential data
      if (!categoryName || !subcategoryName || !message) {
        console.log('Skipping row with missing data:', item);
        return;
      }

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          status: status,
          subcategories: new Map()
        });
      }

      const categoryData = categoriesMap.get(categoryName);
      if (!categoryData.subcategories.has(subcategoryName)) {
        categoryData.subcategories.set(subcategoryName, []);
      }

      categoryData.subcategories.get(subcategoryName).push(message);
    });

    console.log(`Processing ${categoriesMap.size} categories...`);

    for (const [categoryName, categoryData] of categoriesMap) {
      const subcategories = [];
      console.log(`Processing category: ${categoryName} with ${categoryData.subcategories.size} subcategories`);

      for (const [subcategoryName, messages] of categoryData.subcategories) {
        console.log(`  - Subcategory: ${subcategoryName} with ${messages.length} messages`);
        subcategories.push({
          name: subcategoryName,
          messages: messages.map(content => ({ content }))
        });
      }

      try {
        const result = await EnglishCategory.findOneAndUpdate(
          { name: categoryName },
          {
            name: categoryName,
            subcategories: subcategories,
            status: categoryData.status
          },
          { upsert: true, new: true }
        );
        console.log(`Category ${categoryName} saved successfully with ID: ${result._id}`);
      } catch (err) {
        console.error(`Error saving category ${categoryName}:`, err.message);
        throw err;
      }
    }

    return { success: true, message: 'English data imported successfully' };
  } catch (error) {
    console.error('Error importing English data:', error);
    throw error;
  }
}
