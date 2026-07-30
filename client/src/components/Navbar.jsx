import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'badge-admin';
      case 'Organizer':
        return 'badge-organizer';
      default:
        return 'badge-customer';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-glass py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" to="/">
          <i className="bi bi-ticket-perforated-fill fs-3 text-indigo"></i>
          <span>Event<span className="text-dark">Hub</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/">
                Explore Events
              </Link>
            </li>
            {isAuthenticated && user?.role === 'Customer' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3" to="/customer/dashboard">
                  <i className="bi bi-ticket-detailed me-1"></i> My Tickets
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'Organizer' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3" to="/organizer/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i> Organizer Portal
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'Admin' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 text-danger" to="/admin/dashboard">
                  <i className="bi bi-shield-lock-fill me-1"></i> Admin Command Center
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="dropdown">
                  <button
                    className="btn btn-light rounded-pill border px-3 py-2 d-flex align-items-center gap-2 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="fw-semibold text-dark">{user?.name}</span>
                    <span className={`badge rounded-pill ${getRoleBadgeClass(user?.role)}`}>
                      {user?.role}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <div className="small text-muted">Signed in as</div>
                      <div className="fw-bold text-truncate" style={{ maxWidth: '180px' }}>{user?.email}</div>
                    </li>
                    {user?.role === 'Customer' && (
                      <li>
                        <Link className="dropdown-item py-2" to="/customer/dashboard">
                          <i className="bi bi-ticket-perforated me-2"></i> My Bookings
                        </Link>
                      </li>
                    )}
                    {user?.role === 'Organizer' && (
                      <li>
                        <Link className="dropdown-item py-2" to="/organizer/dashboard">
                          <i className="bi bi-plus-circle me-2"></i> Manage Events
                        </Link>
                      </li>
                    )}
                    {user?.role === 'Admin' && (
                      <li>
                        <Link className="dropdown-item py-2 text-danger" to="/admin/dashboard">
                          <i className="bi bi-shield-gear me-2"></i> Admin Panel
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-gradient rounded-pill px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
