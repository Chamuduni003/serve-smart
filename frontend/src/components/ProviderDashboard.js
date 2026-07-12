import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const getStoredProvider = () => {
  try {
    const stored = localStorage.getItem('loggedInProvider');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const getProviderId = (provider) => (
  provider?.user_id ||
  provider?.userId ||
  provider?.id ||
  localStorage.getItem('userId') ||
  2
);

const normalizeBooking = (booking) => ({
  id: booking.id,
  clientName: booking.clientName || booking.client_name || 'Valued Client',
  clientEmail: booking.clientEmail || booking.client_email || '',
  clientLocation: booking.clientLocation || booking.client_location || 'Not specified',
  category: booking.category || booking.service_category || 'Service',
  bookingDate: booking.bookingDate || booking.booking_date,
  bookingTime: booking.bookingTime || booking.booking_time,
  status: booking.status || 'Pending'
});

export default function ProviderDashboard() {
  const [provider, setProvider] = useState(getStoredProvider() || { name: 'Service Provider' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const providerId = useMemo(() => getProviderId(provider), [provider]);

  const fetchRequests = useCallback(async () => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/bookings/provider/${providerId}`);
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
  }, [providerId]);

  useEffect(() => {
    const storedProvider = getStoredProvider();
    if (storedProvider) {
      setProvider(storedProvider);
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
            <h4>{provider.name || 'Service Provider'}</h4>
            <p>ID #{providerId}</p>
          </div>
        </div>

        <nav className="p-sidebar-menu">
          <button className="p-menu-item p-active" type="button">Dashboard</button>
          <button className="p-menu-item" type="button" onClick={fetchRequests}>Refresh Bookings</button>
        </nav>

        <button className="p-logout-btn" type="button" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="p-dashboard-main">
        <header className="p-main-header">
          <h1>Welcome back, {provider.name || 'Service Provider'}</h1>
          <p className="p-current-date">Manage incoming service booking requests.</p>
        </header>

        <hr className="p-header-divider" />

        <section className="row mb-4">
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm">
              <p className="text-muted small mb-1">Pending Requests</p>
              <h3 className="fw-bold mb-0">{pendingRequests.length}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-0 shadow-sm">
              <p className="text-muted small mb-1">Total Bookings</p>
              <h3 className="fw-bold mb-0">{requests.length}</h3>
            </div>
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
                  <h4>{request.clientName}</h4>
                  <p>{request.clientEmail || request.clientLocation}</p>
                  <p><strong>Date:</strong> {request.bookingDate}</p>
                  <p><strong>Time:</strong> {request.bookingTime}</p>
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
