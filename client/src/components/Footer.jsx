import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto py-5">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-ticket-perforated-fill text-primary"></i> EventHub
            </h5>
            <p className="text-secondary small me-lg-4">
              Production-ready full-stack online event reservation and ticketing system. Connect organizers with attendees seamless experience.
            </p>
            <div className="d-flex gap-3 text-secondary fs-5">
              <a href="#twitter" className="text-secondary hover-primary"><i className="bi bi-twitter-x"></i></a>
              <a href="#facebook" className="text-secondary hover-primary"><i className="bi bi-facebook"></i></a>
              <a href="#instagram" className="text-secondary hover-primary"><i className="bi bi-instagram"></i></a>
              <a href="#linkedin" className="text-secondary hover-primary"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3">Roles & Portals</h6>
            <ul className="list-unstyled text-secondary small d-grid gap-2">
              <li><Link to="/login" className="text-decoration-none text-secondary">Customer Portal</Link></li>
              <li><Link to="/register" className="text-decoration-none text-secondary">Organizer Sign Up</Link></li>
              <li><Link to="/login" className="text-decoration-none text-secondary">Admin Login</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Event Categories</h6>
            <ul className="list-unstyled text-secondary small d-grid gap-2">
              <li><span className="text-secondary">Tech & Developers</span></li>
              <li><span className="text-secondary">Music & Festivals</span></li>
              <li><span className="text-secondary">Business & Networking</span></li>
              <li><span className="text-secondary">Workshops & Training</span></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Stay Updated</h6>
            <p className="text-secondary small">Subscribe to get notifications about upcoming events.</p>
            <div className="input-group">
              <input type="email" className="form-control form-control-sm bg-secondary text-white border-0" placeholder="Enter your email" />
              <button className="btn btn-primary btn-sm px-3" type="button">Join</button>
            </div>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between text-secondary small">
          <div>&copy; {new Date().getFullYear()} EventHub System. Built with React & Node.js.</div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <a href="#privacy" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#terms" className="text-secondary text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
