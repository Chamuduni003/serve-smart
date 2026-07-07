import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBriefcase, FaDollarSign, FaTools, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaStar, FaCamera } from 'react-icons/fa';
import './ProviderDashboard.css';

function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [providerData, setProviderData] = useState(null); 
  const [bookings, setBookings] = useState([]); 
  const [reviews, setReviews] = useState([]); // Reviews තියාගන්න අලුත් State එකක්
  const [loading, setLoading] = useState(true); 

  const userId = localStorage.getItem('userId') || 1; 

  useEffect(() => {
    // 1. Provider ගේ Profile දත්ත ලබාගැනීම
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

    // 2. Booking Requests ලබාගැනීම
    axios.get(`http://localhost:5000/api/provider/bookings/${userId}`)
      .then(res => {
        setBookings(res.data);
      })
      .catch(err => {
        console.error("Error fetching bookings:", err);
      });

    // 3. Provider ගේ Reviews ලබාගැනීම (අලුතින් එකතු කලා)
    axios.get(`http://localhost:5000/api/provider/reviews/${userId}`)
      .then(res => {
        setReviews(res.data);
      })
      .catch(err => {
        console.error("Error fetching reviews:", err);
      });
  }, [userId]);

  // Availability Status එක Update කිරීම
  const handleAvailabilityToggle = async () => {
    try {
      const nextStatus = !isAvailable;
      await axios.put(`http://localhost:5000/api/provider/availability`, {
        userId: userId,
        isAvailable: nextStatus
      });
      setIsAvailable(nextStatus);
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  };

  // Profile Photo Upload කිරීම (අලුතින් එකතු කලා)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('userId', userId);

    try {
      // Backend එකට Photo එක Upload කරන API එක
      const res = await axios.post(`http://localhost:5000/api/provider/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // DB එකෙන් ලැබෙන අලුත් Image URL එක UI එකට Update කිරීම
      setProviderData({ ...providerData, profile_image: res.data.imageUrl });
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload photo.");
    }
  };

  // Booking එකක් Accept කිරීම
  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/status/${bookingId}`, { status: 'Accepted' });
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
      <div className="dashboard-content">
        <div className="profile-card">
          
          {/* Left Side: Profile Details */}
          <div className="profile-details-side">
            <div className="avatar-section">
              <div className="avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
                {/* 👤 Icon එක වෙනුවට DB එකේ Image එක පෙන්වීම */}
                <img 
                  src={providerData?.profile_image || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  className="profile-img"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}
                />
                {/* Photo එක තෝරන්න කුඩා කැමරා බොත්තම */}
                <label htmlFor="file-input" style={{ position: 'absolute', bottom: '5px', right: '5px', backgroundColor: '#007bff', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaCamera size={14} />
                </label>
                <input id="file-input" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </div>

              <h2>Welcome Back, {providerData?.name || 'Provider'}!</h2>
              
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

          {/* Right Side: Booking Requests & Reviews */}
          <div className="booking-requests-side">
            
            {/* Incoming Bookings Section */}
            <h3><FaCalendarAlt /> Incoming Bookings</h3>
            <div className="bookings-container" style={{ marginBottom: '30px' }}>
              {bookings.length === 0 ? (
                <p className="no-bookings">No booking requests yet.</p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="booking-item-card">
                    <h4>{booking.client_name || booking.client_email || 'Requested Client'}</h4>
                    <p><strong>Service:</strong> {booking.service_category || providerData?.category || 'Service Request'}</p>
                    <p><strong>Date:</strong> {booking.booking_date || 'N/A'} | <strong>Time:</strong> {booking.booking_time || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`booking-status ${booking.status?.toLowerCase()}`}>{booking.status || 'pending'}</span></p>
                    <div className="action-buttons">
                      <button className="btn-accept" onClick={() => handleAcceptBooking(booking.id)}><FaCheckCircle /> Accept</button>
                      <button className="btn-reject" onClick={() => handleRejectBooking(booking.id)}><FaTimesCircle /> Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Reviews Section (අලුතින් එකතු කලා) */}
            <h3><FaStar style={{ color: '#ffc107' }} /> Customer Reviews</h3>
            <div className="reviews-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {reviews.length === 0 ? (
                <p className="no-bookings">No reviews yet.</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="booking-item-card" style={{ borderLeft: '4px solid #ffc107' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4>{review.reviewer_name || 'Anonymous'}</h4>
                      <div>
                        {/* Rating එක අනුව තරු (Stars) ගණන Render කිරීම */}
                        {[...Array(review.rating)].map((_, i) => (
                          <FaStar key={i} style={{ color: '#ffc107', marginRight: '2px' }} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontStyle: 'italic', marginTop: '5px', color: '#555' }}>"{review.comment}"</p>
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