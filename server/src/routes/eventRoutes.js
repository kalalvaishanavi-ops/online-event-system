import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/organizer/my-events', protect, authorize('Organizer', 'Admin'), getMyEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('Organizer', 'Admin'), createEvent);
router.put('/:id', protect, authorize('Organizer', 'Admin'), updateEvent);
router.delete('/:id', protect, authorize('Organizer', 'Admin'), deleteEvent);

export default router;
