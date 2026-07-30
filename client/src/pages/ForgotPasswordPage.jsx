import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    setSubmitting(true);

    const res = await forgotPassword(email);
    setSubmitting(false);

    if (res.success) {
      setMessage('Password reset token generated successfully!');
      if (res.resetToken) {
        setGeneratedToken(res.resetToken);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white text-center p-4 border-0">
              <i className="bi bi-key fs-1 text-warning d-block mb-2"></i>
              <h3 className="fw-bold mb-1">Forgot Password</h3>
              <p className="small text-secondary mb-0">Enter your registered email to receive a password reset link</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {message && (
                <div className="alert alert-success rounded-3 small mb-4">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {message}
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger rounded-3 small mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMessage}
                </div>
              )}

              {generatedToken ? (
                <div className="bg-light p-4 rounded-4 text-center border mb-4">
                  <div className="small text-muted mb-2">Password Reset Token Generated:</div>
                  <code className="d-block bg-white p-3 rounded border text-indigo fw-bold mb-3 fs-6">
                    {generatedToken}
                  </code>
                  <p className="small text-muted mb-3">Click below to test resetting your password with this token:</p>
                  <button
                    onClick={() => navigate(`/reset-password/${generatedToken}`)}
                    className="btn btn-warning text-dark fw-bold rounded-pill w-100 py-2"
                  >
                    Proceed to Reset Password Page
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
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

                  <button
                    type="submit"
                    className="btn btn-gradient w-100 py-3 rounded-3 fw-bold mb-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Generating Token...
                      </span>
                    ) : (
                      'Request Password Reset Link'
                    )}
                  </button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="fw-bold text-primary text-decoration-none small">
                  <i className="bi bi-arrow-left me-1"></i> Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
