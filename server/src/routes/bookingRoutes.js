import express from 'express';
import {
  createBooking,
  getMyBookings,
  getEventBookings,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Customer', 'Admin'), createBooking);
router.get('/my-bookings', protect, authorize('Customer', 'Admin'), getMyBookings);
router.get('/event/:eventId', protect, authorize('Organizer', 'Admin'), getEventBookings);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
