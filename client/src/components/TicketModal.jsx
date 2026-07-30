import React from 'react';

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const event = booking.event || {};
  const customer = booking.customer || {};

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Upcoming Date';

  const qrUrl =
    booking.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.bookingReference || 'EVT-TICKET'}`;

  return (
    <div className="modal d-block bg-dark bg-opacity-75 overflow-auto" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header bg-dark text-white p-4 border-0 no-print">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-ticket-perforated-fill text-warning"></i>
              Official Digital Event Ticket
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Printable Ticket Body */}
          <div className="modal-body p-4 p-md-5 bg-light" id="printableTicketArea">
            <div className="card border-0 shadow rounded-4 overflow-hidden bg-white">
              {/* Ticket Top Banner */}
              <div className="hero-gradient p-4 text-white position-relative">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-warning text-dark fw-bold rounded-pill px-3 py-1 mb-2">
                      {booking.status === 'Confirmed' ? 'VALID TICKET PASSPORT' : 'CANCELLED'}
                    </span>
                    <h3 className="fw-extrabold text-white mb-1">{event.title || 'Official Event'}</h3>
                    <p className="small text-light opacity-90 mb-0">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {event.location || 'Venue details'}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="small text-light opacity-75">BOOKING REFERENCE</div>
                    <div className="fw-mono fs-4 fw-extrabold text-warning">
                      {booking.bookingReference || 'EVT-000000'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Content Grid */}
              <div className="card-body p-4 p-md-5">
                <div className="row g-4 align-items-center">
                  {/* Left Column: Details */}
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="small text-muted fw-semibold">ATTENDEE NAME</div>
                        <div className="fw-bold text-dark fs-6">{customer.name || 'Valued Attendee'}</div>
                        <div className="small text-secondary">{customer.email}</div>
                      </div>

                      <div className="col-6">
                        <div className="small text-muted fw-semibold">DATE & TIME</div>
                        <div className="fw-bold text-dark">{formattedDate}</div>
                        <div className="small text-secondary">{event.time || '10:00 AM'}</div>
                      </div>

                      <div className="col-6">
                        <div className="small text-muted fw-semibold">TICKET QUANTITY</div>
                        <div className="fw-bold text-dark fs-5">{booking.quantity} Seat(s)</div>
                      </div>

                      <div className="col-6">
                        <div className="small text-muted fw-semibold">TOTAL AMOUNT PAID</div>
                        <div className="fw-bold text-indigo fs-5">${booking.totalPrice}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: QR Barcode */}
                  <div className="col-md-4 text-center border-start-md ps-md-4">
                    <div className="bg-light p-3 rounded-4 d-inline-block border mb-2">
                      <img
                        src={qrUrl}
                        alt="Ticket QR Code"
                        className="img-fluid rounded-3"
                        style={{ width: '150px', height: '150px' }}
                      />
                    </div>
                    <div className="small text-muted fw-semibold">Scan at Venue Entrance</div>
                  </div>
                </div>
              </div>

              {/* Ticket Footer Security Stripe */}
              <div className="bg-dark text-white p-3 px-4 d-flex justify-content-between align-items-center small">
                <span>EventHub Verified System Ticket</span>
                <span>Security Hash: {booking._id}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="modal-footer bg-white p-4 border-0 no-print d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-gradient rounded-pill px-4" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i> Print / Download PDF Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
