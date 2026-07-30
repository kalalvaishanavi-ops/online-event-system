import React, { useState, useEffect } from 'react';
import API from '../services/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
    } catch (err) {
      console.log('Marked locally');
    }
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
    } catch (err) {
      console.log('Marked all locally');
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-light rounded-circle p-2 border position-relative d-flex align-items-center justify-content-center"
        type="button"
        data-bs-toggle="dropdown"
        style={{ width: '40px', height: '40px' }}
      >
        <i className="bi bi-bell-fill text-secondary fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-0 rounded-4" style={{ width: '320px', maxHeight: '420px', overflowY: 'auto' }}>
        <li className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark small">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-link btn-sm text-decoration-none p-0 small">
              Mark all as read
            </button>
          )}
        </li>

        {notifications.length === 0 ? (
          <li className="p-4 text-center text-muted small">No notifications</li>
        ) : (
          notifications.map((n) => (
            <li key={n._id} className={`p-3 border-bottom ${!n.isRead ? 'bg-indigo-light' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="fw-bold text-dark small">{n.title}</span>
                {!n.isRead && (
                  <button onClick={() => handleMarkAsRead(n._id)} className="btn btn-sm text-primary p-0">
                    <i className="bi bi-check2-all"></i>
                  </button>
                )}
              </div>
              <p className="small text-secondary mb-1">{n.message}</p>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
