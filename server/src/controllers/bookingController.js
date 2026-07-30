import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';

// @desc    Book tickets for an event (Seat protection & Overbooking prevention)
// @route   POST /api/v1/bookings
// @access  Private (Customer, Admin)
export const createBooking = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const ticketQty = parseInt(quantity, 10) || 1;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an event ID.',
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'Published' || event.approvalStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This event is not currently active for bookings.',
      });
    }

    // Atomic seat validation: prevent overbooking
    const availableSeats = event.capacity - event.bookedSeats;
    if (availableSeats < ticketQty) {
      return res.status(400).json({
        success: false,
        message: `Overbooking prevented. Only ${availableSeats} ticket(s) remaining for this event.`,
      });
    }

    const totalPrice = event.price * ticketQty;

    // Create booking record
    const booking = await Booking.create({
      customer: req.user.id,
      event: eventId,
      quantity: ticketQty,
      unitPrice: event.price,
      totalPrice,
      status: 'Confirmed',
    });

    // Update booked seats count in Event
    event.bookedSeats += ticketQty;
    await event.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title date time location price imageUrl organizer isOnline')
      .populate('customer', 'name email phone');

    // Create notifications for customer and organizer
    await Notification.create({
      recipient: req.user.id,
      sender: req.user.id,
      type: 'Booking',
      title: 'Booking Confirmed',
      message: `You have successfully booked ${ticketQty} ticket(s) for '${event.title}'.`,
      link: '/customer/dashboard',
    });

    if (event.organizer) {
      await Notification.create({
        recipient: event.organizer,
        sender: req.user.id,
        type: 'Booking',
        title: 'New Booking Received',
        message: `A customer reserved ${ticketQty} ticket(s) for your event '${event.title}'.`,
        link: '/organizer/dashboard',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Tickets reserved successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private (Customer, Admin)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('event', 'title date time location price imageUrl status isOnline')
      .populate('customer', 'name email phone')
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

// @desc    Get attendees/bookings for a specific event
// @route   GET /api/v1/bookings/event/:eventId
// @access  Private (Organizer owner, Admin)
export const getEventBookings = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this event.',
      });
    }

    const bookings = await Booking.find({ event: req.params.eventId })
      .populate('customer', 'name email phone')
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

// @desc    Cancel booking (Restores seats if event is in the future)
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private (Customer owner, Admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    if (
      booking.customer.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ticket booking.',
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Check event date
    const event = await Event.findById(booking.event);
    if (event) {
      const eventDate = new Date(event.date);
      const now = new Date();

      if (eventDate < now && req.user.role !== 'Admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel tickets for events that have already passed.',
        });
      }

      // Restore seats back to available capacity
      event.bookedSeats = Math.max(0, event.bookedSeats - booking.quantity);
      await event.save();
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Create notifications for customer and organizer
    await Notification.create({
      recipient: booking.customer,
      sender: req.user.id,
      type: 'Booking',
      title: 'Booking Cancelled',
      message: `Your booking for '${event ? event.title : 'the event'}' has been cancelled successfully.`,
      link: '/customer/dashboard',
    });

    if (event && event.organizer) {
      await Notification.create({
        recipient: event.organizer,
        sender: req.user.id,
        type: 'Booking',
        title: 'Booking Cancelled',
        message: `A booking of ${booking.quantity} ticket(s) for '${event.title}' was cancelled.`,
        link: '/organizer/dashboard',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and seats restored.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
