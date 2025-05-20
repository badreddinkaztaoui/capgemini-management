import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  messages: [messageSchema]
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Disapproved'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subcategories: [subcategorySchema]
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;