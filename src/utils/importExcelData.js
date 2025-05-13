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
      const categoryName = item.Categories;
      const subcategoryName = item["Sous-categories"];
      const message = item["Messages à envoyer "];

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, new Map());
      }

      const subcategoriesMap = categoriesMap.get(categoryName);
      if (!subcategoriesMap.has(subcategoryName)) {
        subcategoriesMap.set(subcategoryName, []);
      }

      subcategoriesMap.get(subcategoryName).push(message);
    });

    // Convert to MongoDB documents and save
    for (const [categoryName, subcategoriesMap] of categoriesMap) {
      const subcategories = [];

      for (const [subcategoryName, messages] of subcategoriesMap) {
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