import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const res = await register({ name, email, password, role, phone, organization });
    setSubmitting(false);

    if (res.success) {
      if (role === 'Organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white text-center p-4 border-0">
              <i className="bi bi-person-plus fs-1 text-warning d-block mb-2"></i>
              <h3 className="fw-bold mb-1">Create an Account</h3>
              <p className="small text-secondary mb-0">Join EventHub to book tickets or manage your events</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {errorMessage && (
                <div className="alert alert-danger rounded-3 small mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small">Select Account Type</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="radio"
                        className="btn-check"
                        name="accountRole"
                        id="roleCustomer"
                        checked={role === 'Customer'}
                        onChange={() => setRole('Customer')}
                      />
                      <label className="btn btn-outline-primary w-100 py-3 rounded-3 text-start" htmlFor="roleCustomer">
                        <i className="bi bi-ticket-perforated fs-4 d-block mb-1"></i>
                        <span className="fw-bold d-block">Customer</span>
                        <span className="small opacity-75">Book tickets & attend</span>
                      </label>
                    </div>

                    <div className="col-6">
                      <input
                        type="radio"
                        className="btn-check"
                        name="accountRole"
                        id="roleOrganizer"
                        checked={role === 'Organizer'}
                        onChange={() => setRole('Organizer')}
                      />
                      <label className="btn btn-outline-warning text-dark w-100 py-3 rounded-3 text-start" htmlFor="roleOrganizer">
                        <i className="bi bi-building fs-4 d-block mb-1 text-warning"></i>
                        <span className="fw-bold d-block">Organizer</span>
                        <span className="small text-muted">Create & host events</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-muted">Phone Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {role === 'Organizer' && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-muted">Organization / Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Innovators Live Ltd."
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required={role === 'Organizer'}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-gradient w-100 py-3 rounded-3 fw-bold mt-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </span>
                  ) : (
                    `Register as ${role}`
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="fw-bold text-primary text-decoration-none small">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
