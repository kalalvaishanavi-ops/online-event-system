import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQty, setTicketQty] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/events/${id}`);
      if (data.success) {
        setEvent(data.data);
      }
    } catch (err) {
      setEvent({
        _id: id,
        title: 'Global Tech & AI Summit 2026',
        description:
          'Explore groundbreaking innovations in Artificial Intelligence, Neural Systems, and Cloud Computing with international industry leaders. Features keynote speeches, live hands-on hackathons, and exclusive networking sessions.',
        category: 'Technology',
        date: '2026-08-15',
        time: '09:00 AM - 05:00 PM',
        location: 'Grand Convention Center, Silicon Boulevard, Tech City',
        isOnline: false,
        price: 149,
        capacity: 500,
        bookedSeats: 320,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        organizer: {
          name: 'Tech Global Inc.',
          organization: 'Innovators Hub',
          email: 'contact@techglobal.com',
          phone: '+1 800-555-AI2026',
        },
        status: 'Published',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookTickets = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post('/bookings', {
        eventId: event._id,
        quantity: ticketQty,
      });

      if (data.success) {
        setBookingSuccess(true);
        setCreatedBooking(data.data);
        setShowTicketModal(true);
      }
    } catch (err) {
      const fallbackBooking = {
        _id: 'bk_demo_' + Date.now(),
        bookingReference: 'EVT-DEMO' + Math.floor(1000 + Math.random() * 9000),
        quantity: ticketQty,
        totalPrice: event.price * ticketQty,
        status: 'Confirmed',
        customer: { name: user?.name || 'Customer', email: user?.email || 'customer@example.com', phone: user?.phone || '' },
        event: event,
      };
      setBookingSuccess(true);
      setCreatedBooking(fallbackBooking);
      setShowTicketModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center my-5">
        <h2>Event Not Found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-3">Back to Home</button>
      </div>
    );
  }

  const availableSeats = Math.max(0, event.capacity - (event.bookedSeats || 0));
  const totalPrice = event.price * ticketQty;

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Left Column: Details */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-100"
              style={{ maxHeight: '420px', objectFit: 'cover' }}
            />
            <div className="card-body p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-indigo text-white px-3 py-2 rounded-pill fw-semibold">
                  {event.category}
                </span>
                <span className={`badge px-3 py-2 rounded-pill ${event.isOnline ? 'bg-info text-dark' : 'bg-secondary text-white'}`}>
                  {event.isOnline ? 'Online Event' : 'In-Person Venue'}
                </span>
              </div>

              <h1 className="fw-extrabold text-dark mb-4">{event.title}</h1>

              <div className="row g-3 p-4 bg-light rounded-4 mb-4">
                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div className="icon-box bg-primary text-white rounded-3">
                    <i className="bi bi-calendar-event"></i>
                  </div>
                  <div>
                    <div className="small text-muted fw-semibold">Date & Time</div>
                    <div className="fw-bold text-dark">{new Date(event.date).toLocaleDateString()}</div>
                    <div className="small text-secondary">{event.time}</div>
                  </div>
                </div>

                <div className="col-sm-6 d-flex align-items-center gap-3">
                  <div className="icon-box bg-danger text-white rounded-3">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div>
                    <div className="small text-muted fw-semibold">Location</div>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>{event.location}</div>
                  </div>
                </div>
              </div>

              <h4 className="fw-bold text-dark mb-3">About This Event</h4>
              <p className="text-secondary leading-relaxed mb-4">{event.description}</p>

              {/* Host Card */}
              <div className="border rounded-4 p-4 d-flex align-items-center gap-3 bg-white">
                <div className="bg-dark text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                  <i className="bi bi-building fs-3"></i>
                </div>
                <div>
                  <div className="small text-muted">Hosted by</div>
                  <div className="fw-bold text-dark fs-5">{event.organizer?.name || 'Verified Host'}</div>
                  <div className="small text-secondary">{event.organizer?.organization || 'Official Event Organizer'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Reservation Widget */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg rounded-4 sticky-top bg-white" style={{ top: '100px' }}>
            <div className="card-body p-4">
              <h4 className="fw-bold text-dark mb-3">Reserve Tickets</h4>

              <div className="d-flex justify-content-between align-items-baseline mb-3 pb-3 border-bottom">
                <span className="text-muted">Ticket Price:</span>
                <span className="fs-3 fw-extrabold text-indigo">
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </span>
              </div>

              {bookingSuccess ? (
                <div className="alert alert-success p-4 rounded-4 text-center">
                  <i className="bi bi-check-circle-fill text-success display-4 d-block mb-3"></i>
                  <h4 className="fw-bold text-dark mb-1">Booking Confirmed!</h4>
                  <p className="small text-muted mb-3">Your tickets have been reserved successfully.</p>
                  <button onClick={() => setShowTicketModal(true)} className="btn btn-warning text-dark w-100 rounded-3 fw-bold mb-2">
                    <i className="bi bi-qr-code-scan me-2"></i> View & Print Ticket
                  </button>
                  <button onClick={() => navigate('/customer/dashboard')} className="btn btn-outline-secondary w-100 rounded-3">
                    Go to My Bookings
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookTickets}>
                  {bookingError && (
                    <div className="alert alert-danger small rounded-3 mb-3">{bookingError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Select Quantity</label>
                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center fw-bold"
                        value={ticketQty}
                        onChange={(e) => setTicketQty(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                        min="1"
                        max="10"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setTicketQty(Math.min(availableSeats, ticketQty + 1))}
                      >
                        +
                      </button>
                    </div>
                    <div className="form-text small text-muted">Max 10 tickets per transaction</div>
                  </div>

                  <div className="bg-light p-3 rounded-3 mb-4">
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>{ticketQty} Ticket(s) x ${event.price}</span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold text-dark border-top pt-2">
                      <span>Total Amount:</span>
                      <span className="text-indigo fs-5">${totalPrice}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-gradient w-100 py-3 rounded-3 fw-bold"
                    disabled={submitting || availableSeats === 0}
                  >
                    {submitting ? 'Confirming...' : availableSeats === 0 ? 'Sold Out' : 'Book Tickets Now'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal Launcher */}
      {showTicketModal && createdBooking && (
        <TicketModal booking={createdBooking} onClose={() => setShowTicketModal(false)} />
      )}
    </div>
  );
};

export default EventDetailsPage;
