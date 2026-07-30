import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, demoLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleDemoLogin = (role) => {
    const user = demoLogin(role);
    redirectByRole(user.role);
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      case 'Organizer':
        navigate('/organizer/dashboard');
        break;
      default:
        navigate('/customer/dashboard');
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white text-center p-4 border-0">
              <i className="bi bi-shield-lock fs-1 text-primary d-block mb-2"></i>
              <h3 className="fw-bold mb-1">Welcome Back</h3>
              <p className="small text-secondary mb-0">Sign in to manage your bookings and events</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {errorMessage && (
                <div className="alert alert-danger rounded-3 small mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small text-muted mb-0">Password</label>
                    <Link to="/forgot-password" className="small text-primary text-decoration-none fw-semibold">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-gradient w-100 py-3 rounded-3 fw-bold mb-4"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In to Account'
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials Switcher */}
              <div className="border-top pt-4 text-center">
                <div className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  ⚡ Quick Demo One-Click Access
                </div>
                <div className="d-grid gap-2">
                  <button
                    onClick={() => handleDemoLogin('Customer')}
                    className="btn btn-outline-primary btn-sm rounded-pill fw-semibold"
                  >
                    <i className="bi bi-person-fill me-1"></i> Demo Customer View
                  </button>
                  <button
                    onClick={() => handleDemoLogin('Organizer')}
                    className="btn btn-outline-warning text-dark btn-sm rounded-pill fw-semibold"
                  >
                    <i className="bi bi-building me-1"></i> Demo Organizer View
                  </button>
                  <button
                    onClick={() => handleDemoLogin('Admin')}
                    className="btn btn-outline-danger btn-sm rounded-pill fw-semibold"
                  >
                    <i className="bi bi-shield-check me-1"></i> Demo Admin View
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <span className="text-muted small">Don't have an account? </span>
                <Link to="/register" className="fw-bold text-primary text-decoration-none small">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
