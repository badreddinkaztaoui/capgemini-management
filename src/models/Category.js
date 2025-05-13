import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subcategories: [{
    name: {
      type: String,
      required: true
    },
    messages: [{
      content: {
        type: String,
        required: true
      }
    }]
  }]
}, {
  timestamps: true
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;