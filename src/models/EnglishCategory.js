import mongoose from 'mongoose';

const englishCategorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    default: 'Disapproved'
  },
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

const EnglishCategory = mongoose.models.EnglishCategory || mongoose.model('EnglishCategory', englishCategorySchema);

export default EnglishCategory;
