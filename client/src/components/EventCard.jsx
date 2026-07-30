import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const availableSeats = Math.max(0, event.capacity - (event.bookedSeats || 0));
  const capacityPercentage = Math.min(100, Math.round(((event.bookedSeats || 0) / event.capacity) * 100));

  return (
    <div className="card event-card h-100 border-0 shadow-sm">
      <div className="event-card-img-wrapper">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80'}
          alt={event.title}
          className="event-card-img"
        />
        <span className="category-badge">
          <i className="bi bi-tag-fill me-1"></i>
          {event.category || 'General'}
        </span>
        <span className="price-badge">
          {event.price === 0 ? 'FREE' : `$${event.price}`}
        </span>
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 text-indigo small fw-bold mb-2">
          <i className="bi bi-calendar3"></i>
          <span>{formattedDate} • {event.time}</span>
        </div>

        <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={event.title}>
          {event.title}
        </h5>

        <p className="card-text text-secondary small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>

        <div className="d-flex align-items-center text-muted small mb-3">
          <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
          <span className="text-truncate">{event.location}</span>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mb-3">
          <div className="d-flex justify-content-between text-muted small mb-1">
            <span>Seats: {event.bookedSeats || 0} / {event.capacity}</span>
            <span className={availableSeats < 10 ? 'text-danger fw-bold' : 'text-success'}>
              {availableSeats === 0 ? 'SOLD OUT' : `${availableSeats} left`}
            </span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className={`progress-bar ${capacityPercentage >= 90 ? 'bg-danger' : capacityPercentage >= 60 ? 'bg-warning' : 'bg-indigo'}`}
              role="progressbar"
              style={{ width: `${capacityPercentage}%` }}
            ></div>
          </div>
        </div>

        <Link
          to={`/event/${event._id}`}
          className={`btn ${availableSeats === 0 ? 'btn-outline-secondary disabled' : 'btn-gradient'} w-100 py-2 rounded-3 fw-semibold`}
        >
          {availableSeats === 0 ? 'Sold Out' : 'View & Book Tickets'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
