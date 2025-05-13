import * as XLSX from 'xlsx';
import Category from '../models/Category';
import mongoose from 'mongoose';

export async function importExcelDataToMongoDB(excelBuffer) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const workbook = XLSX.read(excelBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const categoriesMap = new Map();

    data.forEach(item => {
      const categoryName = item.categories;
      const subcategoryName = item.subcategories;
      const message = item.messages || item['messages '];
      const status = item.status || 'Disapproved';

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

    for (const [categoryName, categoryData] of categoriesMap) {
      const subcategories = [];

      for (const [subcategoryName, messages] of categoryData.subcategories) {
        subcategories.push({
          name: subcategoryName,
          messages: messages.map(content => ({ content }))
        });
      }

      await Category.findOneAndUpdate(
        { name: categoryName },
        {
          name: categoryName,
          subcategories: subcategories,
          status: categoryData.status
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