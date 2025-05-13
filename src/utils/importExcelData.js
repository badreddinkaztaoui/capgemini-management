import * as XLSX from 'xlsx';
import Category from '../models/Category';
import mongoose from 'mongoose';

const CHUNK_SIZE = 50; // Process 50 items at a time

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

    // Process data in chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);

      chunk.forEach(item => {
        if (!item.categories || !item.subcategories || !item.messages) {
          console.warn('Skipping invalid row:', item);
          return;
        }

        const status = item.status || 'active';
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

      // Process each chunk of categories
      const categoryEntries = Array.from(categoriesMap.entries());
      for (let j = 0; j < categoryEntries.length; j += CHUNK_SIZE) {
        const categoryChunk = categoryEntries.slice(j, j + CHUNK_SIZE);

        await Promise.all(categoryChunk.map(async ([categoryName, categoryData]) => {
          try {
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
          } catch (error) {
            console.error(`Error processing category ${categoryName}:`, error);
            throw error;
          }
        }));
      }
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  } finally {
    // Close MongoDB connection if we opened it
    if (mongoose.connection.readyState === 1 && mongoose.connection.host === 'localhost') {
      await mongoose.connection.close();
    }
  }
}