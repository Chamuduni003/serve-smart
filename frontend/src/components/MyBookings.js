import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; 

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ලොග් වී ඇති User ගේ ID එක ගැනීම
  const rawClientId = localStorage.getItem('userId');
  const clientId = rawClientId ? parseInt(rawClientId) : null;

  useEffect(() => {
    if (clientId) {
      fetchUserBookings();
    } else {
      setLoading(false);
    }
  }, [clientId]);

  // Backend එකෙන් බුකින් දත්ත ලබාගැනීම
  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/bookings/${clientId}`);
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings from server:", error);
    } finally {
      setLoading(false);
    }
  };

  // User විසින් Request එක Cancel කිරීම (සැබෑ ලෙසම database එකෙන් ඉවත් කිරීමට හෝ status වෙනස් කිරීමට හැක)
  const handleCancelRequest = (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking request?");
    if (confirmCancel) {
      // දැනට state එකෙන් ඉවත් කර පෙන්වමු (පසුව delete api එකක් හැදිය හැක)
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert("🚫 Booking Request Cancelled.");
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

      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        
        {/* Page Header */}
        <div className="text-center mb-5">
          <h3 className="fw-bold text-dark">Current Booking Requests</h3>
          <p className="text-muted">You can wait here until the provider accepts your bookings.</p>
        </div>

        {bookings.length === 0 ? (
          /* Empty State */
          <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '16px' }}>
            <i className="bi bi-calendar2-check text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-secondary fw-bold">No pending bookings</h5>
            <p className="text-muted mb-0">You are all caught up! Find a service provider to book.</p>
          </div>
        ) : (
          /* Bookings List mapping */
          bookings.map((booking) => (
            <div key={booking.id || booking.bookingId} className="card border-0 shadow-sm mx-auto p-4 mb-3" style={{ maxWidth: '450px', borderRadius: '16px' }}>
              
              {/* Card Header */}
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="bg-primary text-white d-flex justify-content-center align-items-center flex-shrink-0" 
                    style={{ width: '52px', height: '52px', borderRadius: '50%', fontSize: '1.4rem', fontWeight: 'bold' }}
                  >
                    {booking.providerName ? booking.providerName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold text-dark">{booking.providerName || "Service Provider"}</h5>
                    <small className="text-muted">{booking.category || 'General Service'}</small>
                  </div>
                </div>
                
                {/* Status Badge */}
                <span className="badge mt-1" style={{ 
                  backgroundColor: booking.status === 'Pending' ? '#fff3cd' : '#d4edda', 
                  color: booking.status === 'Pending' ? '#856404' : '#155724', 
                  padding: '6px 12px', borderRadius: '8px', fontWeight: '600' 
                }}>
                  {booking.status}
                </span>
              </div>

              {/* Booking Details Box */}
              <div className="bg-light p-3 mb-4" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted"><i className="bi bi-calendar3 me-2 text-primary"></i>Date</span>
                  <span className="fw-medium text-dark">{booking.bookingDate}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted"><i className="bi bi-clock me-2 text-primary"></i>Time</span>
                  <span className="fw-medium text-dark">{booking.bookingTime}</span>
                </div>

                <div className="d-flex justify-content-between">
                  <span className="text-muted"><i className="bi bi-info-circle me-2 text-primary"></i>Booking ID</span>
                  <span className="fw-medium text-dark"># {booking.id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2">
                <button 
                  onClick={() => handleCancelRequest(booking.id)}
                  className="btn btn-outline-danger w-100 py-2 fw-medium" 
                  style={{ borderRadius: '10px' }}
                >
                  Cancel Request
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}