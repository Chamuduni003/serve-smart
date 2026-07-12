import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const normalizeBooking = (booking) => ({
  id: booking.id,
  providerName: booking.providerName || booking.provider_name || 'Service Provider',
  providerId: booking.providerId || booking.provider_id,
  clientName: booking.clientName || booking.client_name || 'Valued Client',
  clientEmail: booking.clientEmail || booking.client_email || '',
  clientLocation: booking.clientLocation || booking.client_location || 'Not specified',
  category: booking.category || booking.service_category || 'Service',
  bookingDate: booking.bookingDate || booking.booking_date,
  bookingTime: booking.bookingTime || booking.booking_time,
  status: booking.status || 'Pending'
});

export default function ProviderDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/bookings/all');
      const rows = Array.isArray(response.data) ? response.data : [];
      setRequests(rows.map(normalizeBooking));
      setMessage('');
    } catch (error) {
      console.error('Error loading provider bookings:', error);
      setMessage('Could not load booking requests. Please check the backend server.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (bookingId, status) => {
    const actionText = status === 'Accepted' ? 'accept' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status });
      setRequests((current) => current.map((request) => (
        request.id === bookingId ? { ...request, status } : request
      )));
      setMessage(`Booking ${status.toLowerCase()} successfully.`);
    } catch (error) {
      console.error(`Error updating booking ${bookingId}:`, error);
      setMessage(error.response?.data?.error || 'Booking status update failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInProvider');
    localStorage.removeItem('active_booking');
    window.location.href = '/login';
  };

  const pendingRequests = requests.filter((request) => request.status?.toLowerCase() === 'pending');

  return (
    <div className="p-dashboard-wrapper">
      <aside className="p-dashboard-sidebar">
        <div className="p-sidebar-brand">
          <h2>Smart Service</h2>
          <span className="p-badge-provider">Provider</span>
        </div>

        <div className="p-sidebar-user">
          <div className="p-user-avatar">SP</div>
          <div className="p-user-info">
            <h4>Booking Manager</h4>
            <p>All providers</p>
          </div>
        </div>

        <nav className="p-sidebar-menu">
          <button className="p-menu-item p-active" type="button">Dashboard</button>
          <button className="p-menu-item" type="button" onClick={fetchRequests}>Refresh Bookings</button>
        </nav>

        <button className="p-logout-btn" type="button" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="p-dashboard-main">
        <nav className="p-top-navbar" aria-label="Dashboard navigation">
          <a className="p-top-brand" href="/provider-dashboard">
            <span className="p-top-brand-mark">SS</span>
            <span>Smart Service</span>
          </a>
          <div className="p-top-nav-links">
            <a className="p-top-nav-link p-top-nav-link-active" href="/provider-dashboard">Dashboard</a>
            <button className="p-top-nav-link" type="button" onClick={fetchRequests}>Refresh</button>
            <a className="p-top-nav-link" href="/">Home</a>
            <button className="p-top-logout" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <header className="p-main-header">
          <h1>Booking Requests</h1>
          <p className="p-current-date">Review each provider's incoming service requests.</p>
        </header>

        <hr className="p-header-divider" />

        <section className="p-summary-grid" aria-label="Booking summary">
          <div className="p-summary-card p-summary-card-primary">
            <span>Pending requests</span>
            <strong>{pendingRequests.length}</strong>
            <small>Waiting for a response</small>
          </div>
          <div className="p-summary-card">
            <span>Total bookings</span>
            <strong>{requests.length}</strong>
            <small>All service requests</small>
          </div>
        </section>

        {message && <div className="alert alert-info py-2">{message}</div>}

        <h5 className="fw-bold mb-3">Incoming Requests</h5>

        {loading ? (
          <p className="text-muted">Loading booking requests...</p>
        ) : pendingRequests.length === 0 ? (
          <div className="p-empty-state">
            <div className="p-empty-icon">--</div>
            <h5>No pending requests</h5>
            <p>New customer bookings will appear here.</p>
          </div>
        ) : (
          <div className="p-booking-grid">
            {pendingRequests.map((request) => (
              <article key={request.id} className="p-booking-card">
                <div className="p-card-header">
                  <span className="p-service-tag">{request.category}</span>
                  <span className="p-status-badge p-pending">{request.status}</span>
                </div>

                <div className="p-card-body">
                  <div className="p-person-row">
                    <span className="p-person-avatar">{request.clientName.charAt(0).toUpperCase()}</span>
                    <div>
                      <h4>{request.clientName}</h4>
                      <p>{request.clientEmail || request.clientLocation}</p>
                    </div>
                  </div>
                  <div className="p-provider-line">Assigned to <strong>{request.providerName}</strong> <span>• ID #{request.providerId}</span></div>
                  <div className="p-request-details">
                    <div><span>Date</span><strong>{request.bookingDate}</strong></div>
                    <div><span>Time</span><strong>{request.bookingTime}</strong></div>
                  </div>
                </div>

                <div className="p-card-actions">
                  <button className="p-btn-action p-accept" type="button" onClick={() => handleAction(request.id, 'Accepted')}>
                    Accept
                  </button>
                  <button className="p-btn-action p-reject" type="button" onClick={() => handleAction(request.id, 'Rejected')}>
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
