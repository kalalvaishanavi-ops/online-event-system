import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Chart.js & React-Chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MOCK_USERS = [
  { _id: 'u1', name: 'John Admin', email: 'admin@eventhub.com', role: 'Admin', isActive: true, createdAt: '2026-01-01' },
  { _id: 'u2', name: 'Grand Events Co.', email: 'organizer@events.com', role: 'Organizer', isActive: true, phone: '+1 800-555-EVT', createdAt: '2026-02-14' },
  { _id: 'u3', name: 'Alice Customer', email: 'alice@gmail.com', role: 'Customer', isActive: true, phone: '+1 555-0199', createdAt: '2026-03-10' },
  { _id: 'u4', name: 'Tech Guild Organizers', email: 'tech@guild.com', role: 'Organizer', isActive: false, phone: '+1 888-0099', createdAt: '2026-04-05' },
];

const MOCK_ADMIN_EVENTS = [
  { _id: 'evt_1', title: 'Global Tech & AI Summit 2026', category: 'Technology', date: '2026-08-15', organizer: { name: 'Tech Global Inc.', organization: 'Innovators Hub' }, approvalStatus: 'Approved', isFeatured: true, bookedSeats: 320, capacity: 500, price: 149, location: 'Tech City' },
  { _id: 'evt_2', title: 'Indie Music & Arts Festival', category: 'Music', date: '2026-09-02', organizer: { name: 'Grand Events Co.' }, approvalStatus: 'Approved', isFeatured: false, bookedSeats: 890, capacity: 1200, price: 65, location: 'Sunset Amphitheater' },
  { _id: 'evt_3', title: 'Cybersecurity Masterclass', category: 'Technology', date: '2026-09-20', organizer: { name: 'Tech Guild Organizers' }, approvalStatus: 'Pending', isFeatured: false, bookedSeats: 0, capacity: 150, price: 99, location: 'Online Webinar' },
];

const MOCK_ADMIN_BOOKINGS = [
  { _id: 'b1', bookingReference: 'EVT-X89A7K', customer: { name: 'Alice Customer', email: 'alice@gmail.com' }, event: { title: 'Global Tech & AI Summit 2026', price: 149 }, quantity: 2, totalPrice: 298, status: 'Confirmed', refundStatus: 'None' },
  { _id: 'b2', bookingReference: 'EVT-P42L9M', customer: { name: 'Bob Johnson', email: 'bob@gmail.com' }, event: { title: 'Indie Music & Arts Festival', price: 65 }, quantity: 1, totalPrice: 65, status: 'Confirmed', refundStatus: 'None' },
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data States
  const [users, setUsers] = useState(MOCK_USERS);
  const [events, setEvents] = useState(MOCK_ADMIN_EVENTS);
  const [bookings, setBookings] = useState(MOCK_ADMIN_BOOKINGS);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Modals / Forms
  const [rejectionModalEvent, setRejectionModalEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editUserModal, setEditUserModal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching categories');
    }
  };

  const fetchAdminData = async () => {
    try {
      const usersRes = await API.get('/admin/users');
      if (usersRes.data.success) setUsers(usersRes.data.data);
      const eventsRes = await API.get('/admin/events');
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
      const bookingsRes = await API.get('/admin/bookings');
      if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
    } catch (err) {
      console.log('Using admin mock data fallback...');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategorySuccess('');
    setCategoryError('');
    try {
      if (editingCat) {
        const { data } = await API.put(`/admin/categories/${editingCat._id}`, {
          name: newCatName,
          description: newCatDesc,
        });
        if (data.success) {
          setCategorySuccess(`Category '${newCatName}' updated successfully!`);
          setEditingCat(null);
        }
      } else {
        const { data } = await API.post('/admin/categories', {
          name: newCatName,
          description: newCatDesc,
        });
        if (data.success) {
          setCategorySuccess(`Category '${newCatName}' created successfully!`);
        }
      }
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCat(cat);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/admin/categories/${catId}`);
      setCategorySuccess('Category deleted successfully.');
      fetchCategories();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // User Actions
  const handleToggleUserStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}`, { isActive: !users.find((u) => u._id === userId)?.isActive });
    } catch (err) {
      console.log('Toggled locally');
    }
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
    } catch (err) {
      console.log('Deleted locally');
    }
    setUsers(users.filter((u) => u._id !== userId));
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      await API.put(`/admin/users/${editUserModal._id}`, editUserModal);
    } catch (err) {
      console.log('Saved user edit locally');
    }
    setUsers((prev) =>
      prev.map((u) => (u._id === editUserModal._id ? editUserModal : u))
    );
    setEditUserModal(null);
  };

  // Event Approval Actions
  const handleApproveEvent = async (eventId) => {
    try {
      await API.put(`/admin/events/${eventId}/approval`, { approvalStatus: 'Approved' });
    } catch (err) {
      console.log('Approved locally');
    }
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, approvalStatus: 'Approved' } : e))
    );
  };

  const handleConfirmRejectEvent = async () => {
    if (!rejectionModalEvent) return;
    try {
      await API.put(`/admin/events/${rejectionModalEvent._id}/approval`, {
        approvalStatus: 'Rejected',
        rejectionReason,
      });
    } catch (err) {
      console.log('Rejected locally');
    }
    setEvents((prev) =>
      prev.map((e) =>
        e._id === rejectionModalEvent._id ? { ...e, approvalStatus: 'Rejected', rejectionReason } : e
      )
    );
    setRejectionModalEvent(null);
    setRejectionReason('');
  };

  const handleToggleFeatured = async (eventId) => {
    try {
      await API.put(`/admin/events/${eventId}/feature`);
    } catch (err) {
      console.log('Featured toggled locally');
    }
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, isFeatured: !e.isFeatured } : e))
    );
  };

  // Booking & Refund Simulation
  const handleSimulateRefund = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: 'Cancelled', refundStatus: 'Processed ($' + b.totalPrice + ')' } : b
      )
    );
  };

  // Global Search
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalQuery) {
      setSearchResults(null);
      return;
    }
    const q = globalQuery.toLowerCase();
    const matchedUsers = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    const matchedEvents = events.filter(
      (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    );
    const matchedBookings = bookings.filter((b) => b.bookingReference.toLowerCase().includes(q));

    setSearchResults({ users: matchedUsers, events: matchedEvents, bookings: matchedBookings });
  };

  // Chart Data Configuration
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Gross Revenue ($)',
        data: [4200, 6800, 9500, 12400, 15800, 19200, 24500],
        backgroundColor: 'rgba(79, 70, 229, 0.75)',
        borderColor: '#4f46e5',
        borderRadius: 8,
      },
    ],
  };

  const categoryChartData = {
    labels: ['Technology', 'Music', 'Business', 'Education'],
    datasets: [
      {
        label: 'Events Share',
        data: [18, 12, 8, 4],
        backgroundColor: ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`py-4 min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      <div className="container-fluid px-4">
        {/* Top Header Navigation Bar */}
        <div className={`p-4 rounded-4 shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
              <i className="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <div>
              <span className="badge bg-danger text-white rounded-pill px-3 py-1 mb-1">System Command Center</span>
              <h3 className="fw-extrabold mb-0">Platform Admin Portal</h3>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Dark / Light Theme Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark/light mode"
              className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${isDarkMode ? 'btn-warning' : 'btn-dark'}`}
            >
              <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="d-flex gap-2 border-bottom mb-4 overflow-auto pb-2">
          <button onClick={() => setActiveTab('overview')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'overview' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-speedometer2 me-2"></i> Overview & Analytics
          </button>
          <button onClick={() => setActiveTab('users')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'users' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-people me-2"></i> Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('organizers')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'organizers' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-building me-2"></i> Organizers
          </button>
          <button onClick={() => setActiveTab('events')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'events' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-calendar-event me-2"></i> Event Moderation
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'bookings' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-ticket-perforated me-2"></i> Bookings & Refunds
          </button>
          <button onClick={() => setActiveTab('search')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'search' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-search me-2"></i> Global Search
          </button>
          <button onClick={() => setActiveTab('settings')} className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'settings' ? 'btn-primary' : 'btn-light border'}`}>
            <i className="bi bi-gear me-2"></i> Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CHART.JS ANALYTICS */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div className="row g-4 mb-4">
              <div className="col-lg-3 col-sm-6">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <div className="small text-muted mb-1">Total Users</div>
                  <div className="fs-2 fw-extrabold text-primary">{users.length}</div>
                  <div className="small text-muted">
                    {users.filter(u => u.role === 'Customer').length} Customers • {users.filter(u => u.role === 'Organizer').length} Organizers
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <div className="small text-muted mb-1">Active Events</div>
                  <div className="fs-2 fw-extrabold text-indigo">{events.length}</div>
                  <div className="small text-muted">
                    {events.filter(e => e.approvalStatus === 'Approved').length} Approved • {events.filter(e => e.approvalStatus === 'Pending').length} Pending
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <div className="small text-muted mb-1">Confirmed Bookings</div>
                  <div className="fs-2 fw-extrabold text-success">{bookings.length}</div>
                  <div className="small text-muted">Verified QR Tickets</div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <div className="small text-muted mb-1">System Gross Revenue</div>
                  <div className="fs-2 fw-extrabold text-warning">$52,080</div>
                  <div className="small text-muted">Across all events</div>
                </div>
              </div>
            </div>

            {/* Chart.js Analytics Graphs */}
            <div className="row g-4 mb-4">
              <div className="col-lg-8">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <h5 className="fw-bold mb-3">Monthly Revenue Growth ($)</h5>
                  <div style={{ height: '280px' }}>
                    <Bar data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                  <h5 className="fw-bold mb-3">Category Distribution</h5>
                  <div style={{ height: '280px' }} className="d-flex align-items-center justify-content-center">
                    <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h5 className="fw-bold mb-0">User Account Manager</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <select className="form-select form-select-sm" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                  <option value="All">All Roles</option>
                  <option value="Customer">Customer</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className={`table align-middle ${isDarkMode ? 'table-dark' : 'table-hover'}`}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-bold">{u.name}</div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      <td><span className={`badge rounded-pill ${u.role === 'Admin' ? 'badge-admin' : u.role === 'Organizer' ? 'badge-organizer' : 'badge-customer'}`}>{u.role}</span></td>
                      <td className="small text-muted">{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => setEditUserModal(u)} className="btn btn-outline-primary btn-sm rounded-pill px-3">Edit</button>
                          <button onClick={() => handleToggleUserStatus(u._id)} className={`btn btn-sm rounded-pill px-3 ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}>
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteUser(u._id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORGANIZER MANAGEMENT */}
        {activeTab === 'organizers' && (
          <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
            <h5 className="fw-bold mb-4">Organizer Accounts & Verifications</h5>
            <div className="table-responsive">
              <table className={`table align-middle ${isDarkMode ? 'table-dark' : 'table-hover'}`}>
                <thead>
                  <tr>
                    <th>Organizer / Company</th>
                    <th>Contact Email</th>
                    <th>Phone</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'Organizer').map((org) => (
                    <tr key={org._id}>
                      <td className="fw-bold">{org.organization || org.name}</td>
                      <td className="small text-muted">{org.email}</td>
                      <td className="small text-muted">{org.phone || '+1 800-555-0199'}</td>
                      <td>
                        <span className={`badge ${org.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {org.isActive ? 'Approved & Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleToggleUserStatus(org._id)} className={`btn btn-sm rounded-pill px-4 ${org.isActive ? 'btn-outline-danger' : 'btn-success'}`}>
                          {org.isActive ? 'Suspend Account' : 'Approve Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EVENT MODERATION & APPROVAL */}
        {activeTab === 'events' && (
          <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
            <h5 className="fw-bold mb-4">Event Moderation & Approvals</h5>
            <div className="table-responsive">
              <table className={`table align-middle ${isDarkMode ? 'table-dark' : 'table-hover'}`}>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Organizer</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Approval Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt._id}>
                      <td className="fw-bold">{evt.title}</td>
                      <td className="small text-muted">{evt.organizer?.organization || evt.organizer?.name || 'N/A'}</td>
                      <td><span className="badge bg-light text-dark border">{evt.category}</span></td>
                      <td className="small">{evt.date ? new Date(evt.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="fw-bold text-indigo">{evt.price === 0 ? 'FREE' : `$${evt.price}`}</td>
                      <td>
                        <span className={`badge ${evt.approvalStatus === 'Approved' ? 'bg-success' : evt.approvalStatus === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {evt.approvalStatus || 'Approved'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleToggleFeatured(evt._id)} className={`btn btn-sm rounded-pill ${evt.isFeatured ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}>
                          {evt.isFeatured ? '★ Featured' : 'Standard'}
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {evt.approvalStatus !== 'Approved' && (
                            <button onClick={() => handleApproveEvent(evt._id)} className="btn btn-success btn-sm rounded-pill px-3">Approve</button>
                          )}
                          {evt.approvalStatus !== 'Rejected' && (
                            <button onClick={() => setRejectionModalEvent(evt)} className="btn btn-outline-danger btn-sm rounded-pill px-3">Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BOOKINGS & REFUNDS */}
        {activeTab === 'bookings' && (
          <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
            <h5 className="fw-bold mb-4">System Booking Records & Refund Controls</h5>
            <div className="table-responsive">
              <table className={`table align-middle ${isDarkMode ? 'table-dark' : 'table-hover'}`}>
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Refund Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-mono text-indigo fw-bold">{b.bookingReference}</td>
                      <td>{b.customer?.name}</td>
                      <td className="small">{b.event?.title}</td>
                      <td className="fw-bold">${b.totalPrice}</td>
                      <td><span className={`badge ${b.status === 'Confirmed' ? 'bg-success' : 'bg-danger'}`}>{b.status}</span></td>
                      <td><span className="small text-muted">{b.refundStatus || 'None'}</span></td>
                      <td>
                        {b.status === 'Confirmed' && (
                          <button onClick={() => handleSimulateRefund(b._id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                            Simulate Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: GLOBAL CROSS-SYSTEM SEARCH */}
        {activeTab === 'search' && (
          <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
            <h5 className="fw-bold mb-3">Global Cross-System Search</h5>
            <form onSubmit={handleGlobalSearch} className="d-flex gap-2 mb-4" style={{ maxWidth: '600px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search across Users, Events, and Bookings..."
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary rounded-3 px-4 fw-bold">Search</button>
            </form>

            {searchResults && (
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="border rounded-4 p-3 bg-light text-dark">
                    <h6 className="fw-bold text-primary">Matched Users ({searchResults.users.length})</h6>
                    <ul className="list-unstyled small mb-0">
                      {searchResults.users.map(u => <li key={u._id} className="py-1 border-bottom">{u.name} ({u.role})</li>)}
                    </ul>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded-4 p-3 bg-light text-dark">
                    <h6 className="fw-bold text-indigo">Matched Events ({searchResults.events.length})</h6>
                    <ul className="list-unstyled small mb-0">
                      {searchResults.events.map(e => <li key={e._id} className="py-1 border-bottom">{e.title}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded-4 p-3 bg-light text-dark">
                    <h6 className="fw-bold text-success">Matched Bookings ({searchResults.bookings.length})</h6>
                    <ul className="list-unstyled small mb-0">
                      {searchResults.bookings.map(b => <li key={b._id} className="py-1 border-bottom">{b.bookingReference}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: ADMIN SETTINGS & CATEGORIES */}
        {activeTab === 'settings' && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Category Management ({categories.length})</h5>
                  {editingCat && (
                    <button
                      onClick={() => { setEditingCat(null); setNewCatName(''); setNewCatDesc(''); }}
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {categorySuccess && <div className="alert alert-success small rounded-3">{categorySuccess}</div>}
                {categoryError && <div className="alert alert-danger small rounded-3">{categoryError}</div>}

                <form onSubmit={handleSaveCategory} className="mb-4 bg-light p-3 rounded-4 border">
                  <div className="fw-bold small text-secondary mb-2">{editingCat ? 'Edit Category' : 'Create New Category'}</div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Category name (e.g. Technology)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Description (optional)"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-3 fw-bold btn-sm px-4">
                    {editingCat ? 'Update Category' : 'Create Category'}
                  </button>
                </form>

                <div className="table-responsive">
                  <table className={`table align-middle ${isDarkMode ? 'table-dark' : 'table-hover'}`}>
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center text-muted small py-3">No categories found in MongoDB.</td>
                        </tr>
                      ) : (
                        categories.map((cat) => (
                          <tr key={cat._id}>
                            <td className="fw-bold">{cat.name}</td>
                            <td className="small text-muted">{cat.description || '—'}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => handleEditCategoryClick(cat)}
                                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat._id)}
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className={`p-4 rounded-4 shadow-sm border-0 ${isDarkMode ? 'bg-secondary bg-opacity-20' : 'bg-white'}`}>
                <h5 className="fw-bold mb-3">Admin Password Settings</h5>
                {passwordSuccess && <div className="alert alert-success small rounded-3">{passwordSuccess}</div>}
                <form onSubmit={(e) => { e.preventDefault(); setPasswordSuccess('Password updated successfully!'); setOldPassword(''); setNewPassword(''); }}>
                  <div className="mb-2">
                    <input type="password" className="form-control" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <input type="password" className="form-control" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-warning text-dark rounded-3 fw-bold">Update Password</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Event Modal */}
      {rejectionModalEvent && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg text-dark">
              <div className="modal-header bg-danger text-white p-4 border-0">
                <h5 className="modal-title fw-bold">Reject Event</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setRejectionModalEvent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p>Provide a reason for rejecting <strong>{rejectionModalEvent.title}</strong>:</p>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Inappropriate content or venue mismatch"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer bg-light p-3 border-0">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setRejectionModalEvent(null)}>Cancel</button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={handleConfirmRejectEvent}>Reject Event</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg text-dark">
              <div className="modal-header bg-dark text-white p-4 border-0">
                <h5 className="modal-title fw-bold">Edit User Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditUserModal(null)}></button>
              </div>
              <form onSubmit={handleSaveEditUser}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input type="text" className="form-control" value={editUserModal.name} onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role</label>
                    <select className="form-select" value={editUserModal.role} onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value })}>
                      <option value="Customer">Customer</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light p-3 border-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setEditUserModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">Save User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
