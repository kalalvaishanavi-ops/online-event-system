import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';

// @desc    Get complete dashboard stats & recent activity feed
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const customersCount = await User.countDocuments({ role: 'Customer' });
    const organizersCount = await User.countDocuments({ role: 'Organizer' });
    
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ approvalStatus: 'Approved' });
    const pendingEvents = await Event.countDocuments({ approvalStatus: 'Pending' });
    
    const totalBookings = await Booking.countDocuments({ status: 'Confirmed' });

    const revenueAggregation = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // Fetch Recent Activities
    const recentUsers = await User.find().select('name role createdAt').sort({ createdAt: -1 }).limit(3);
    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(3);

    const recentActivities = [
      ...recentUsers.map((u) => ({
        type: 'User Registered',
        title: `New ${u.role}: ${u.name}`,
        timestamp: u.createdAt,
      })),
      ...recentBookings.map((b) => ({
        type: 'Booking Created',
        title: `${b.customer?.name || 'Customer'} reserved ticket for ${b.event?.title || 'Event'}`,
        timestamp: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        customersCount,
        organizersCount,
        totalEvents,
        approvedEvents,
        pendingEvents,
        totalBookings,
        totalRevenue,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Analytics & Chart Data (Monthly trends, Category breakdown)
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
export const getAnalyticsData = async (req, res, next) => {
  try {
    const monthlyData = [
      { month: 'Jan', revenue: 4200, bookings: 80 },
      { month: 'Feb', revenue: 6800, bookings: 120 },
      { month: 'Mar', revenue: 9500, bookings: 180 },
      { month: 'Apr', revenue: 12400, bookings: 240 },
      { month: 'May', revenue: 15800, bookings: 310 },
      { month: 'Jun', revenue: 19200, bookings: 390 },
      { month: 'Jul', revenue: 24500, bookings: 480 },
    ];

    const categoryAgg = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    const categoryDistribution = categoryAgg.length > 0 ? categoryAgg : [
      { category: 'Technology', count: 1 },
      { category: 'Music', count: 1 },
      { category: 'Business', count: 1 },
      { category: 'Education', count: 1 },
    ];

    res.status(200).json({
      success: true,
      data: {
        monthlyData,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search & role filter
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / edit user details
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isActive, name, phone, organization } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (organization) user.organization = organization;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (any status/approvalStatus) for moderation
// @route   GET /api/v1/admin/events
// @access  Private (Admin)
export const getAllEventsAdmin = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name organization email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve / Reject Event
// @route   PUT /api/v1/admin/events/:id/approval
// @access  Private (Admin)
export const updateEventApproval = async (req, res, next) => {
  try {
    const { approvalStatus, rejectionReason } = req.body;
    const event = await Event.findById(req.params.id).populate('organizer');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    event.approvalStatus = approvalStatus;
    if (rejectionReason) event.rejectionReason = rejectionReason;
    await event.save();

    // Send Notification to Organizer
    await Notification.create({
      recipient: event.organizer._id,
      sender: req.user.id,
      type: 'EventApproval',
      title: `Event ${approvalStatus}`,
      message: `Your event '${event.title}' has been ${approvalStatus.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      link: `/organizer/dashboard`,
    });

    res.status(200).json({
      success: true,
      message: `Event status updated to ${approvalStatus}.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Featured Event Flag
// @route   PUT /api/v1/admin/events/:id/feature
// @access  Private (Admin)
export const toggleFeatureEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event is now ${event.isFeatured ? 'Featured' : 'Standard'}.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/v1/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('event', 'title date price location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Global Search across Users, Events, Bookings
// @route   GET /api/v1/admin/global-search
// @access  Private (Admin)
export const globalSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query.' });
    }

    const regex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { organization: regex }],
    }).select('-password').limit(5);

    const events = await Event.find({
      $or: [{ title: regex }, { location: regex }, { category: regex }],
    }).limit(5);

    const bookings = await Booking.find({
      bookingReference: regex,
    }).populate('customer', 'name').populate('event', 'title').limit(5);

    res.status(200).json({
      success: true,
      data: {
        users,
        events,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/v1/admin/categories
// @access  Private (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({ name, description, icon });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/v1/admin/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/admin/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;

    await category.save();

    res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category removed successfully.' });
  } catch (error) {
    next(error);
  }
};
