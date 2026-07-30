import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify the number of tickets'],
      min: [1, 'Must book at least 1 ticket'],
      max: [10, 'Cannot book more than 10 tickets per transaction'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    qrCodeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure bookingReference and qrCodeUrl are atomically generated
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = 'EVT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  if (!this.qrCodeUrl) {
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${this.bookingReference}`;
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
