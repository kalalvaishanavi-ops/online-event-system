import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify an event category'],
      default: 'General',
    },
    date: {
      type: Date,
      required: [true, 'Please specify the event date'],
    },
    time: {
      type: String,
      required: [true, 'Please specify the event start time'],
    },
    location: {
      type: String,
      required: [true, 'Please specify the event location/venue or online URL'],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'Please add a ticket price'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify total seat capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Cancelled', 'Completed'],
      default: 'Published',
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ title: 'text', description: 'text', location: 'text' });

eventSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - this.bookedSeats);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export default mongoose.model('Event', eventSchema);
