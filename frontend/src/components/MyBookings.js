import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const statusColor = (status = '') => {
  const value = status.toLowerCase();
  if (value === 'accepted' || value === 'approved') {
    return { backgroundColor: '#d4edda', color: '#155724' };
  }
  if (value === 'rejected' || value === 'cancelled') {
    return { backgroundColor: '#f8d7da', color: '#842029' };
  }
  return { backgroundColor: '#fff3cd', color: '#856404' };
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rawClientId = localStorage.getItem('userId');
  const clientId = rawClientId ? parseInt(rawClientId, 10) : 1;

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/bookings/my-bookings/${clientId}`);
      const rows = response.data?.bookings || response.data || [];
      setBookings(Array.isArray(rows) ? rows : []);
      setError('');
    } catch (fetchError) {
      console.error('Error fetching bookings from server:', fetchError);
      setError('Could not load your bookings. Please check the backend server.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const handleCancelRequest = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status: 'Cancelled' });
      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking
      )));
      alert('Booking request cancelled.');
    } catch (cancelError) {
      console.error('Error cancelling booking:', cancelError);
      alert(cancelError.response?.data?.error || 'Could not cancel booking. Please check the backend server.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif" }}>
      <Navbar />

      <div className="container mt-5" style={{ maxWidth: '700px' }}>
        <div className="text-center mb-5">
          <h3 className="fw-bold text-dark">Current Booking Requests</h3>
          <p className="text-muted">Track your service requests and provider responses.</p>
        </div>

        {error && <div className="alert alert-info">{error}</div>}

        {bookings.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '16px' }}>
            <h5 className="text-secondary fw-bold">No bookings yet</h5>
            <p className="text-muted mb-0">Find a service provider to create your first booking.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const badgeStyle = statusColor(booking.status);
            const canCancel = !['accepted', 'approved', 'rejected', 'cancelled'].includes((booking.status || '').toLowerCase());

            return (
              <div key={booking.id || booking.bookingId} className="card border-0 shadow-sm mx-auto p-4 mb-3" style={{ maxWidth: '520px', borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary text-white d-flex justify-content-center align-items-center flex-shrink-0"
                      style={{ width: '52px', height: '52px', borderRadius: '50%', fontSize: '1.4rem', fontWeight: 'bold' }}
                    >
                      {(booking.providerName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold text-dark">{booking.providerName || 'Service Provider'}</h5>
                      <small className="text-muted">{booking.category || 'General Service'}</small>
                    </div>
                  </div>

                  <span className="badge mt-1" style={{ ...badgeStyle, padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                    {booking.status || 'Pending'}
                  </span>
                </div>

                <div className="bg-light p-3 mb-4" style={{ borderRadius: '12px' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Date</span>
                    <span className="fw-medium text-dark">{booking.bookingDate}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Time</span>
                    <span className="fw-medium text-dark">{booking.bookingTime}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Payment</span>
                    <span className="fw-medium text-dark">{booking.paymentMethod || 'Cash after service'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Booking ID</span>
                    <span className="fw-medium text-dark"># {booking.id}</span>
                  </div>
                </div>

                {canCancel && (
                  <button
                    onClick={() => handleCancelRequest(booking.id)}
                    className="btn btn-outline-danger w-100 py-2 fw-medium"
                    style={{ borderRadius: '10px' }}
                    type="button"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
