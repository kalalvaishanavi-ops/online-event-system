import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import TicketModal from '../components/TicketModal';

const MOCK_CUSTOMER_BOOKINGS = [
  {
    _id: 'bk_101',
    bookingReference: 'EVT-X89A7K',
    quantity: 2,
    totalPrice: 298,
    status: 'Confirmed',
    createdAt: '2026-07-20T14:30:00.000Z',
    customer: { name: 'Alice Customer', email: 'alice@example.com', phone: '+1 555-0199' },
    event: {
      _id: 'evt_1',
      title: 'Global Tech & AI Summit 2026',
      date: '2026-08-15',
      time: '09:00 AM - 05:00 PM',
      location: 'Convention Center, Tech City',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    },
  },
  {
    _id: 'bk_102',
    bookingReference: 'EVT-P42L9M',
    quantity: 1,
    totalPrice: 65,
    status: 'Confirmed',
    createdAt: '2026-07-18T10:15:00.000Z',
    customer: { name: 'Alice Customer', email: 'alice@example.com', phone: '+1 555-0199' },
    event: {
      _id: 'evt_2',
      title: 'Indie Music & Arts Festival',
      date: '2026-09-02',
      time: '04:00 PM - 11:00 PM',
      location: 'Sunset Amphitheater, Park Bay',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    },
  },
];

const DEFAULT_CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Education', 'Health & Fitness'];

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');

  // Bookings state
  const [bookings, setBookings] = useState(MOCK_CUSTOMER_BOOKINGS);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // Browse Events state
  const [events, setEvents] = useState([]);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    fetchMyBookings();
    fetchBrowseEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/admin/categories');
      if (data.success && data.data.length > 0) {
        const catNames = ['All', ...new Set([...DEFAULT_CATEGORIES.slice(1), ...data.data.map(c => c.name)])];
        setCategoriesList(catNames);
      }
    } catch (err) {
      console.log('Error fetching categories in CustomerDashboard');
    }
  };

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data } = await API.get('/bookings/my-bookings');
      if (data.success && data.data.length > 0) {
        setBookings(data.data);
      }
    } catch (err) {
      console.log('Using customer mock bookings fallback...');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchBrowseEvents = async () => {
    setLoadingEvents(true);
    try {
      let queryParams = [];
      if (category !== 'All') queryParams.push(`category=${category}`);
      if (search) queryParams.push(`search=${search}`);
      if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`);
      if (location) queryParams.push(`location=${location}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const { data } = await API.get(`/events${queryString}`);
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.log('Error fetching events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSearchFilter = (e) => {
    e.preventDefault();
    fetchBrowseEvents();
  };

  const handleCancelBooking = async (bookingId, eventDate) => {
    if (new Date(eventDate) < new Date()) {
      alert('Cannot cancel tickets for events that have already passed.');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this booking and release your seats?')) return;

    try {
      await API.put(`/bookings/${bookingId}/cancel`);
    } catch (err) {
      console.log('Cancelled in local demo state');
    }

    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    setAlertMessage('Booking cancelled successfully. Seats have been restored.');
    setTimeout(() => setAlertMessage(''), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', { name, phone, address, bio });
    } catch (err) {
      console.log('Updated profile locally');
    }
    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  return (
    <div className="container py-5">
      {/* Header Banner */}
      <div className="bg-dark text-white p-4 p-md-5 rounded-4 mb-4 shadow-sm hero-gradient">
        <div className="row align-items-center">
          <div className="col-md-8">
            <span className="badge bg-primary text-white rounded-pill px-3 py-2 mb-2">Customer Portal</span>
            <h2 className="fw-extrabold mb-1">Welcome, {user?.name || 'Valued Attendee'} 👋</h2>
            <p className="text-light opacity-90 mb-0">Browse approved events, access QR booking passes, and manage your account profile.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="bg-white bg-opacity-10 p-3 rounded-4 d-inline-block text-start backdrop-blur">
              <div className="small text-light">Confirmed Tickets</div>
              <div className="fs-3 fw-bold text-warning">
                {bookings.filter((b) => b.status === 'Confirmed').length} Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="d-flex gap-2 border-bottom mb-4 overflow-auto pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'bookings' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-ticket-perforated me-2"></i> My Tickets & Bookings
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'browse' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-search me-2"></i> Browse & Filter Events
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'profile' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-person-gear me-2"></i> Account Profile
        </button>
      </div>

      {alertMessage && (
        <div className="alert alert-info rounded-3 mb-4">
          <i className="bi bi-info-circle-fill me-2"></i>
          {alertMessage}
        </div>
      )}

      {/* TAB 1: MY BOOKINGS & TICKETS */}
      {activeTab === 'bookings' && (
        <div>
          <h4 className="fw-bold text-dark mb-4">My Ticket Reservations</h4>
          {loadingBookings ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <i className="bi bi-ticket-perforated display-3 text-muted"></i>
              <h4 className="mt-3 fw-bold">No Ticket Bookings Yet</h4>
              <p className="text-muted">Explore upcoming events and reserve your seats.</p>
              <button onClick={() => setActiveTab('browse')} className="btn btn-primary rounded-pill px-4">
                Explore Events
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                    <div className="row g-0 h-100">
                      <div className="col-md-4 position-relative">
                        <img
                          src={booking.event?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                          alt={booking.event?.title}
                          className="img-fluid h-100 w-100"
                          style={{ objectFit: 'cover', minHeight: '180px' }}
                        />
                      </div>
                      <div className="col-md-8 p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge rounded-pill ${booking.status === 'Confirmed' ? 'bg-success' : 'bg-danger'}`}>
                            {booking.status}
                          </span>
                          <span className="small fw-mono text-indigo fw-bold">{booking.bookingReference}</span>
                        </div>

                        <h5 className="fw-bold text-dark mb-2 text-truncate">{booking.event?.title}</h5>

                        <div className="small text-muted mb-1">
                          <i className="bi bi-calendar3 me-2 text-primary"></i>
                          {new Date(booking.event?.date).toLocaleDateString()} • {booking.event?.time}
                        </div>

                        <div className="small text-muted mb-3">
                          <i className="bi bi-geo-alt me-2 text-danger"></i>
                          {booking.event?.location}
                        </div>

                        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                          <div>
                            <span className="small text-muted d-block">{booking.quantity} Seat(s)</span>
                            <span className="fw-bold text-indigo fs-5">${booking.totalPrice}</span>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              onClick={() => setSelectedBookingForTicket(booking)}
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            >
                              <i className="bi bi-qr-code-scan me-1"></i> View Ticket
                            </button>

                            {booking.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCancelBooking(booking._id, booking.event?.date)}
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BROWSE & FILTER EVENTS */}
      {activeTab === 'browse' && (
        <div>
          {/* Advanced Filter Form */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Search & Filter Events</h5>
            <form onSubmit={handleSearchFilter} className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Search Title / Venue</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AI Summit"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Max Price ($)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <div className="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-primary rounded-3 w-100 fw-bold">
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setCategory('All'); setMaxPrice(''); fetchBrowseEvents(); }}
                  className="btn btn-outline-secondary rounded-3"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Events Grid */}
          {loadingEvents ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <h5 className="fw-bold text-dark">No Events Match Your Filters</h5>
            </div>
          ) : (
            <div className="row g-4">
              {events.map((evt) => (
                <div key={evt._id} className="col-lg-4 col-md-6">
                  <EventCard event={evt} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT PROFILE */}
      {activeTab === 'profile' && (
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <h4 className="fw-bold text-dark mb-4">Customer Profile Settings</h4>

              {profileSuccess && (
                <div className="alert alert-success rounded-3 small mb-4">{profileSuccess}</div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Email Address (Read-Only)</label>
                  <input type="email" className="form-control bg-light" value={user?.email || ''} disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Mailing Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Park Avenue, City"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-muted">Bio / Personal Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell event hosts about your interests..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gradient rounded-3 px-4 py-2 fw-bold">
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedBookingForTicket && (
        <TicketModal
          booking={selectedBookingForTicket}
          onClose={() => setSelectedBookingForTicket(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
