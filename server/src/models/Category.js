import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'bi-calendar-event',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Category', categorySchema);
