import React, { useState, useEffect } from 'react';
import API from '../services/api';
import EventCard from '../components/EventCard';

const MOCK_EVENTS = [
  {
    _id: 'evt_1',
    title: 'Global Tech & AI Summit 2026',
    description: 'Explore groundbreaking innovations in Artificial Intelligence, Neural Systems, and Cloud Computing with international industry leaders.',
    category: 'Technology',
    date: '2026-08-15',
    time: '09:00 AM - 05:00 PM',
    location: 'Convention Center, Tech City & Livestream',
    isOnline: false,
    price: 149,
    capacity: 500,
    bookedSeats: 320,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    organizer: { name: 'Tech Global Inc.', organization: 'Innovators Hub' },
    status: 'Published',
  },
  {
    _id: 'evt_2',
    title: 'Indie Music & Arts Festival',
    description: 'A 3-day outdoor celebration featuring live acoustic sets, indie rock bands, artisan food stalls, and digital art galleries.',
    category: 'Music',
    date: '2026-09-02',
    time: '04:00 PM - 11:00 PM',
    location: 'Sunset Amphitheater, Park Bay',
    isOnline: false,
    price: 65,
    capacity: 1200,
    bookedSeats: 890,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
    organizer: { name: 'Sunset Events', organization: 'Live Music Co' },
    status: 'Published',
  },
  {
    _id: 'evt_3',
    title: 'Full-Stack JavaScript & React Workshop',
    description: 'Hands-on live coding masterclass covering Vite, Express microservices, JWT security, and state-of-the-art Web Application design.',
    category: 'Education',
    date: '2026-08-20',
    time: '10:00 AM - 02:00 PM',
    location: 'Online Zoom Webinar',
    isOnline: true,
    price: 0,
    capacity: 250,
    bookedSeats: 180,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    organizer: { name: 'CodeAcademy Live', organization: 'JS Guild' },
    status: 'Published',
  },
  {
    _id: 'evt_4',
    title: 'Startup Pitch Night & Founder Networking',
    description: 'Connect with venture capitalists, angel investors, and high-growth startup teams in an exclusive networking evening.',
    category: 'Business',
    date: '2026-08-28',
    time: '06:00 PM - 09:30 PM',
    location: 'Skyline Lounge, Financial District',
    isOnline: false,
    price: 40,
    capacity: 150,
    bookedSeats: 110,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    organizer: { name: 'Venture Capital Club', organization: 'Founders Alliance' },
    status: 'Published',
  },
];

const DEFAULT_CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Education', 'Health & Fitness'];

const HomePage = () => {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/admin/categories');
      if (data.success && data.data.length > 0) {
        const catNames = ['All', ...new Set([...DEFAULT_CATEGORIES.slice(1), ...data.data.map(c => c.name)])];
        setCategories(catNames);
      }
    } catch (err) {
      console.log('Error fetching categories for homepage');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/events';
      if (selectedCategory !== 'All') {
        url += `?category=${selectedCategory}`;
      }
      const { data } = await API.get(url);
      if (data.success && data.data.length > 0) {
        setEvents(data.data);
      } else {
        // Filter mock events if API returns empty
        filterMockEvents();
      }
    } catch (err) {
      console.log('Using local mock events fallback...');
      filterMockEvents();
    } finally {
      setLoading(false);
    }
  };

  const filterMockEvents = () => {
    let filtered = MOCK_EVENTS;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setEvents(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    filterMockEvents();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5 text-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-white text-indigo rounded-pill px-3 py-2 fw-semibold mb-3">
                ✨ Discover Unforgettable Experiences
              </span>
              <h1 className="display-4 fw-extrabold mb-3">
                Book Tickets & Manage <br />
                <span className="text-warning">World-Class Events</span>
              </h1>
              <p className="lead text-light opacity-90 mb-4 me-lg-4">
                Full-stack Online Event System connecting attendees with top organizers. Multi-role access for Customers, Event Organizers, and Platform Admins.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-4 shadow-lg d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '640px' }}>
                <div className="input-group input-group-lg border-0">
                  <span className="input-group-text bg-transparent border-0 text-muted">
                    <i className="bi bi-search fs-5"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 text-dark"
                    placeholder="Search events, topics, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-gradient rounded-3 px-4 py-3 fw-semibold">
                  Find Events
                </button>
              </form>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80"
                  alt="Events showcase"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ border: '4px solid rgba(255,255,255,0.2)' }}
                />
                <div className="bg-white text-dark p-3 rounded-4 shadow position-absolute bottom-0 start-0 m-3 d-flex align-items-center gap-3">
                  <div className="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                    <i className="bi bi-check-circle-fill fs-5"></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-6">Instant Reservation</div>
                    <div className="small text-muted">Verified tickets & JWT Security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-white border-bottom py-3">
        <div className="container">
          <div className="d-flex align-items-center gap-2 overflow-auto py-1">
            <span className="fw-bold text-dark me-2">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
                  selectedCategory === cat ? 'btn-primary shadow-sm' : 'btn-light text-secondary border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                {selectedCategory === 'All' ? 'Upcoming Featured Events' : `${selectedCategory} Events`}
              </h2>
              <p className="text-muted small mb-0">Browse live events available for instant booking</p>
            </div>
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
              Showing {events.length} Events
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading events...</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <i className="bi bi-calendar-x display-3 text-muted"></i>
              <h4 className="mt-3 fw-bold">No Events Found</h4>
              <p className="text-muted">Try selecting a different category or clearing search filters.</p>
              <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="btn btn-outline-primary rounded-pill">
                Reset Filters
              </button>
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
      </section>
    </div>
  );
};

export default HomePage;
