import Event from '../models/Event.js';
import Notification from '../models/Notification.js';

// @desc    Get all events with search, filtering & pagination
// @route   GET /api/v1/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const {
      category,
      search,
      isOnline,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    let query = {
      status: 'Published',
      approvalStatus: 'Approved',
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isOnline) {
      query.isOnline = isOnline === 'true';
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email organization phone')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/v1/events/:id
// @access  Public
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email organization phone address bio'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer, Admin)
export const createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    req.body.approvalStatus = 'Pending';

    const event = await Event.create(req.body);

    // Create Notification for Event Creation
    await Notification.create({
      recipient: req.user.id,
      sender: req.user.id,
      type: 'EventApproval',
      title: 'Event Created Successfully',
      message: `Your event '${event.title}' has been created and published successfully.`,
      link: `/event/${event._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer owner, Admin)
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ID ${req.params.id}`,
      });
    }

    // Ownership check
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer owner, Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ID ${req.params.id}`,
      });
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event removed successfully!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's own events
// @route   GET /api/v1/events/organizer/my-events
// @access  Private (Organizer, Admin)
export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
