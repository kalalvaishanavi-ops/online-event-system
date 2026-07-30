import express from 'express';
import {
  getAdminStats,
  getAnalyticsData,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllEventsAdmin,
  updateEventApproval,
  toggleFeatureEvent,
  getAllBookings,
  globalSearch,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route for categories
router.get('/categories', getCategories);

// Protected Admin Routes
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getAdminStats);
router.get('/analytics', getAnalyticsData);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/events', getAllEventsAdmin);
router.put('/events/:id/approval', updateEventApproval);
router.put('/events/:id/feature', toggleFeatureEvent);

router.get('/bookings', getAllBookings);
router.get('/global-search', globalSearch);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
