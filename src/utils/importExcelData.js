import * as XLSX from 'xlsx';
import Category from '../models/Category';
import mongoose from 'mongoose';

export async function importExcelDataToMongoDB(excelBuffer) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Read Excel file
    const workbook = XLSX.read(excelBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Group data by categories and subcategories
    const categoriesMap = new Map();

    data.forEach(item => {
      const status = item.status || 'active'; // Default to 'active' if not provided
      const categoryName = item.categories;
      const subcategoryName = item.subcategories;
      const message = item.messages;

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          status,
          subcategories: new Map()
        });
      }

      const categoryData = categoriesMap.get(categoryName);
      if (!categoryData.subcategories.has(subcategoryName)) {
        categoryData.subcategories.set(subcategoryName, []);
      }

      categoryData.subcategories.get(subcategoryName).push(message);
    });

    // Convert to MongoDB documents and save
    for (const [categoryName, categoryData] of categoriesMap) {
      const subcategories = [];

      for (const [subcategoryName, messages] of categoryData.subcategories) {
        subcategories.push({
          name: subcategoryName,
          messages: messages.map(content => ({ content }))
        });
      }

      // Update or create category
      await Category.findOneAndUpdate(
        { name: categoryName },
        {
          name: categoryName,
          status: categoryData.status,
          subcategories: subcategories
        },
        { upsert: true, new: true }
      );
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}