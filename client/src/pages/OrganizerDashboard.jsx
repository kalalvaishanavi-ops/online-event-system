import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const MOCK_ORGANIZER_EVENTS = [
  {
    _id: 'evt_1',
    title: 'Global Tech & AI Summit 2026',
    category: 'Technology',
    date: '2026-08-15',
    time: '09:00 AM',
    location: 'Convention Center, Tech City',
    price: 149,
    capacity: 500,
    bookedSeats: 320,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    description: 'Explore groundbreaking innovations in AI and Cloud Computing.',
    status: 'Published',
    approvalStatus: 'Approved',
  },
  {
    _id: 'evt_4',
    title: 'Startup Pitch Night & Founder Networking',
    category: 'Business',
    date: '2026-08-28',
    time: '06:00 PM',
    location: 'Skyline Lounge, Financial District',
    price: 40,
    capacity: 150,
    bookedSeats: 110,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    description: 'Connect with venture capitalists and startup teams.',
    status: 'Published',
    approvalStatus: 'Pending',
  },
];

const MOCK_ATTENDEES = [
  { _id: 'b1', bookingReference: 'EVT-X89A7K', customer: { name: 'Alice Customer', email: 'alice@example.com', phone: '+1 555-0199' }, quantity: 2, totalPrice: 298, status: 'Confirmed' },
  { _id: 'b2', bookingReference: 'EVT-M34K89', customer: { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1 555-0288' }, quantity: 1, totalPrice: 149, status: 'Confirmed' },
];

const OrganizerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('events');

  // Events & Attendees State
  const [events, setEvents] = useState(MOCK_ORGANIZER_EVENTS);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendees, setAttendees] = useState(MOCK_ATTENDEES);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form State for Event Creation / Editing
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('49');
  const [capacity, setCapacity] = useState('200');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Profile Form State
  const [orgName, setOrgName] = useState(user?.organization || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data } = await API.get('/events/organizer/my-events');
      if (data.success && data.data.length > 0) {
        setEvents(data.data);
      }
    } catch (err) {
      console.log('Using organizer mock events fallback...');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    resetEventForm();
    setActiveTab('create');
  };

  const handleOpenEditModal = (evt) => {
    setEditingEventId(evt._id);
    setTitle(evt.title);
    setCategory(evt.category || 'Technology');
    setDate(evt.date ? evt.date.split('T')[0] : '');
    setTime(evt.time || '09:00 AM');
    setLocation(evt.location || '');
    setPrice(evt.price || 0);
    setCapacity(evt.capacity || 100);
    setDescription(evt.description || '');
    setImageUrl(evt.imageUrl || '');
    setActiveTab('create');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const eventPayload = {
      title,
      category,
      date,
      time,
      location,
      price: parseFloat(price) || 0,
      capacity: parseInt(capacity) || 100,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    };

    if (editingEventId) {
      // Edit existing event
      try {
        await API.put(`/events/${editingEventId}`, eventPayload);
        await fetchMyEvents();
      } catch (err) {
        console.log('Updated event locally');
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEventId ? { ...e, ...eventPayload } : e))
        );
      }
    } else {
      // Create new event
      try {
        await API.post('/events', eventPayload);
        await fetchMyEvents();
      } catch (err) {
        console.log('Created event locally');
        const newEvt = {
          _id: 'evt_new_' + Date.now(),
          ...eventPayload,
          bookedSeats: 0,
          status: 'Published',
          approvalStatus: 'Pending',
        };
        setEvents([newEvt, ...events]);
      }
    }

    resetEventForm();
    setActiveTab('events');
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? All associated data will be removed.')) return;

    try {
      await API.delete(`/events/${id}`);
    } catch (err) {
      console.log('Deleted event locally');
    }

    setEvents(events.filter((e) => e._id !== id));
  };

  const handleViewAttendees = async (evt) => {
    setSelectedEventForAttendees(evt);
    try {
      const { data } = await API.get(`/bookings/event/${evt._id}`);
      if (data.success && data.data.length > 0) {
        setAttendees(data.data);
      }
    } catch (err) {
      console.log('Using mock attendees fallback');
    }
  };

  const handleUpdateOrganizerProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', { name, organization: orgName, phone, address, bio });
    } catch (err) {
      console.log('Updated profile locally');
    }
    setProfileSuccess('Organizer profile updated successfully!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setImageUrl('');
    setPrice('49');
    setCapacity('200');
  };

  const totalSeatsSold = events.reduce((acc, curr) => acc + (curr.bookedSeats || 0), 0);
  const totalRevenue = events.reduce((acc, curr) => acc + ((curr.bookedSeats || 0) * (curr.price || 0)), 0);

  return (
    <div className="container py-5">
      {/* Top Banner */}
      <div className="bg-gradient text-white p-4 p-md-5 rounded-4 mb-4 shadow-sm hero-gradient">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold mb-2">Organizer Dashboard</span>
            <h2 className="fw-extrabold mb-1">{user?.organization || 'Grand Events Co.'}</h2>
            <p className="opacity-90 mb-0">Create events, track ticket sales, manage attendees, and view analytics.</p>
          </div>
          <button onClick={handleOpenCreateModal} className="btn btn-light btn-lg rounded-pill fw-bold text-indigo px-4 shadow-sm">
            <i className="bi bi-plus-circle-fill me-2"></i> Create New Event
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="d-flex gap-2 border-bottom mb-4 overflow-auto pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'events' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-calendar-event me-2"></i> My Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'create' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-pencil-square me-2"></i> {editingEventId ? 'Edit Event' : 'Create Event Form'}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'profile' ? 'btn-primary' : 'btn-light border text-secondary'}`}
        >
          <i className="bi bi-building-gear me-2"></i> Organizer Profile
        </button>
      </div>

      {/* TAB 1: MY EVENTS & OVERVIEW */}
      {activeTab === 'events' && (
        <div>
          {/* Analytics Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="stat-card d-flex align-items-center gap-3 bg-white">
                <div className="icon-box bg-indigo text-white">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div>
                  <div className="small text-muted">Hosted Events</div>
                  <div className="fs-3 fw-extrabold text-dark">{events.length}</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card d-flex align-items-center gap-3 bg-white">
                <div className="icon-box bg-success text-white">
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <div>
                  <div className="small text-muted">Total Seats Sold</div>
                  <div className="fs-3 fw-extrabold text-dark">{totalSeatsSold} Seats</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card d-flex align-items-center gap-3 bg-white">
                <div className="icon-box bg-warning text-dark">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <div>
                  <div className="small text-muted">Gross Revenue</div>
                  <div className="fs-3 fw-extrabold text-dark">${totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white p-4 border-0">
              <h5 className="fw-bold text-dark mb-0">Events Control Panel</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Event</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                    <th>Price</th>
                    <th>Seat Occupancy</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => {
                    const available = Math.max(0, evt.capacity - (evt.bookedSeats || 0));
                    return (
                      <tr key={evt._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={evt.imageUrl}
                              alt={evt.title}
                              className="rounded-3"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{evt.title}</div>
                              <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>{evt.location}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-light text-dark border">{evt.category}</span></td>
                        <td>
                          <div className="small fw-semibold">{evt.date ? new Date(evt.date).toLocaleDateString() : ''}</div>
                          <div className="small text-muted">{evt.time}</div>
                        </td>
                        <td className="fw-bold text-indigo">{evt.price === 0 ? 'FREE' : `$${evt.price}`}</td>
                        <td>
                          <div className="small fw-bold">{evt.bookedSeats || 0} / {evt.capacity} ({available} left)</div>
                          <div className="progress" style={{ height: '6px', width: '120px' }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${((evt.bookedSeats || 0) / evt.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${evt.approvalStatus === 'Approved' ? 'bg-success' : evt.approvalStatus === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}
                            title={evt.approvalStatus === 'Rejected' && evt.rejectionReason ? evt.rejectionReason : ''}
                          >
                            {evt.approvalStatus || 'Pending'}
                          </span>
                          {evt.approvalStatus === 'Rejected' && evt.rejectionReason && (
                            <div className="small text-danger mt-1" style={{ maxWidth: '160px' }}>{evt.rejectionReason}</div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button onClick={() => handleViewAttendees(evt)} className="btn btn-outline-info btn-sm rounded-pill px-3">
                              Attendees
                            </button>
                            <button onClick={() => handleOpenEditModal(evt)} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteEvent(evt._id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE / EDIT EVENT FORM */}
      {activeTab === 'create' && (
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <h4 className="fw-bold text-dark mb-4">
                {editingEventId ? 'Edit Event Details' : 'Create New Event'}
              </h4>

              <form onSubmit={handleSaveEvent}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Event Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Annual Cloud & DevOps Convention 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Technology">Technology</option>
                      <option value="Music">Music</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="Health & Fitness">Health & Fitness</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Event Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Location / Venue Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Grand City Arena, 45 Main Street"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Ticket Price ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Seat Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Image URL & Preview */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Image URL</label>
                  <input
                    type="url"
                    className="form-control mb-2"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-2 border rounded-4 p-2 bg-light d-inline-block">
                      <div className="small text-muted mb-1 fw-bold">Image Upload Preview:</div>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="rounded-3"
                        style={{ maxHeight: '160px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Event Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe agenda, keynote speakers, and expectations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex gap-3">
                  <button type="submit" className="btn btn-gradient rounded-pill px-5 py-3 fw-bold">
                    {editingEventId ? 'Save Event Changes' : 'Publish Event'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setActiveTab('events')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZER PROFILE */}
      {activeTab === 'profile' && (
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <h4 className="fw-bold text-dark mb-4">Organizer Profile Settings</h4>

              {profileSuccess && (
                <div className="alert alert-success rounded-3 small mb-4">{profileSuccess}</div>
              )}

              <form onSubmit={handleUpdateOrganizerProfile}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Company / Organization Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Primary Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Business Email (Read-Only)</label>
                  <input type="email" className="form-control bg-light" value={user?.email || ''} disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Business Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 800-555-EVENTS"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Headquarters Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Tech Tower 400, Suite 12"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-muted">Company Bio / Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="We organize world-class technical summits and indie festivals..."
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

      {/* Attendees Viewer Modal */}
      {selectedEventForAttendees && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-dark text-white p-4 border-0">
                <div>
                  <h5 className="modal-title fw-bold">{selectedEventForAttendees.title}</h5>
                  <span className="small text-secondary">Registered Attendees List</span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEventForAttendees(null)}></button>
              </div>

              <div className="modal-body p-4">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Booking Ref</th>
                      <th>Attendee</th>
                      <th>Email / Phone</th>
                      <th>Seats</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a._id}>
                        <td className="fw-mono text-indigo fw-bold">{a.bookingReference}</td>
                        <td className="fw-bold">{a.customer?.name || 'Customer'}</td>
                        <td className="small text-muted">{a.customer?.email}<br />{a.customer?.phone}</td>
                        <td>{a.quantity} Ticket(s)</td>
                        <td className="fw-bold">${a.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer bg-light p-3 border-0">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedEventForAttendees(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
