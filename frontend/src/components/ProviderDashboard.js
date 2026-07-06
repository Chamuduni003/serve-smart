import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBriefcase, FaDollarSign, FaTools, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';
import './ProviderDashboard.css';

function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [providerData, setProviderData] = useState(null); // Database එකෙන් එන විස්තර තියාගන්න
  const [bookings, setBookings] = useState([]); // බුකින්ස් රික්වෙස්ට් ලැයිස්තුව තියාගන්න
  const [loading, setLoading] = useState(true); // දත්ත load වනතුරු පෙන්වීමට

  // ලොගින් වීමේදී localStorage එකේ සේව් කරගත් userId එක මෙතනට ලබාගන්නවා
  // දැනට ටෙස්ට් කිරීමට userId එකක් නැත්නම් default 1 ලෙස ගනී.
  const userId = localStorage.getItem('userId') || 1; 

  useEffect(() => {
    // 1. Provider ගේ Profile දත්ත Backend එකෙන් ලබාගැනීම
    axios.get(`http://localhost:5000/api/provider/profile/${userId}`)
      .then(res => {
        setProviderData(res.data);
        setIsAvailable(res.data.is_available === 1 || res.data.is_available === true);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching provider data:", err);
        setLoading(false);
      });

    // 2. Provider ට අදාළ Booking Requests ලබාගැනීම
    axios.get(`http://localhost:5000/api/provider/bookings/${userId}`)
      .then(res => {
        setBookings(res.data);
      })
      .catch(err => {
        console.error("Error fetching bookings:", err);
      });
  }, [userId]);

  // Availability Status එක toggle කරන සහ DB එකට update කරන function එක
  const handleAvailabilityToggle = async () => {
    try {
      const nextStatus = !isAvailable;
      // Backend එකට status එක update කරන්න යවනවා
      await axios.put(`http://localhost:5000/api/provider/availability`, {
        userId: userId,
        isAvailable: nextStatus
      });
      setIsAvailable(nextStatus);
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  };

  // Booking එකක් Accept කිරීම
  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/status/${bookingId}`, { status: 'Accepted' });
      // UI එකෙන් ඒ බුකින් එකේ status එක update කරනවා හෝ ලිස්ට් එකෙන් අයින් කරනවා
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert("Booking Accepted!");
    } catch (err) {
      console.error("Error accepting booking:", err);
    }
  };

  // Booking එකක් Reject කිරීම
  const handleRejectBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/status/${bookingId}`, { status: 'Rejected' });
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert("Booking Rejected!");
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };

  if (loading) {
    return <div className="loading-text">Loading Dashboard Data...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="profile-card">
          
          {/* Left Side: Profile Details */}
          <div className="profile-details-side">
            <div className="avatar-section">
              <div className="avatar-placeholder">👤</div>
              <h2>Welcome Back!</h2>
              
              <button 
                onClick={handleAvailabilityToggle}
                className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}
              >
                {isAvailable ? "🟢 Available" : "🔴 Not Available"}
              </button>
            </div>

            <div className="info-list">
              <div className="info-item">
                <FaBriefcase className="icon" /> 
                <span><b>Experience:</b> {providerData?.experience_years || '0'} Years of Experience</span>
              </div>
              <div className="info-item">
                <FaDollarSign className="icon" /> 
                <span><b>Hourly Rate:</b> LKR {providerData?.hourly_rate || '0.00'} per hour</span>
              </div>
              <div className="info-item">
                <FaTools className="icon" /> 
                <span><b>Service Category:</b> <span className="badge">{providerData?.category || 'General'}</span></span>
              </div>
              <div className="info-item">
                <FaMapMarkerAlt className="icon" /> 
                <span><b>Service Location:</b> {providerData?.location || 'Not Specified'}</span>
              </div>
            </div>

            <button className="edit-profile-btn">Edit Profile</button>
          </div>

          {/* Right Side: Booking Requests */}
          <div className="booking-requests-side">
            <h3><FaCalendarAlt /> Incoming Bookings</h3>
            
            <div className="bookings-container">
              {bookings.length === 0 ? (
                <p className="no-bookings">No booking requests yet.</p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="booking-item-card">
                    <h4>{booking.client_name || booking.client_email || 'Requested Client'}</h4>
                    <p><strong>Service:</strong> {booking.service_category || providerData?.category || 'Service Request'}</p>
                    <p><strong>Date:</strong> {booking.booking_date || 'N/A'}</p>
                    <p><strong>Time:</strong> {booking.booking_time || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                      {booking.status || 'pending'}
                    </span></p>
                    <div className="action-buttons">
                      <button className="btn-accept" onClick={() => handleAcceptBooking(booking.id)}>
                        <FaCheckCircle /> Accept
                      </button>
                      <button className="btn-reject" onClick={() => handleRejectBooking(booking.id)}>
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;