import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const providerId = params.get('providerId');

  const [formData, setFormData] = useState({ date: '', notes: '', phone: '', time: '' });
  const [loading, setLoading] = useState(false);

  const clientId = localStorage.getItem('userId') || 1;

  useEffect(() => {
    if (!providerId) {
      // No provider specified, redirect back
      navigate('/');
    }
  }, [providerId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      alert('Please select date and time.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_id: clientId,
        provider_id: providerId,
        booking_date: formData.date,
        booking_time: formData.time
      };

      const res = await axios.post('http://localhost:5000/api/bookings/add', payload);
      if (res.status === 201) {
        alert('Booking requested successfully!');
        navigate('/');
      } else {
        alert('Failed to create booking.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Error creating booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-wrapper">
      <div className="card booking-card p-5 shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <button className="btn btn-sm btn-outline-secondary mb-4 w-25" onClick={() => navigate(-1)}>&larr; Back</button>
        
        <h2 className="mb-4 text-center fw-bold text-dark">Book Your Service</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Select Date</label>
            <input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Phone Number</label>
            <input type="tel" className="form-control" placeholder="07xxxxxxxx" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Preferred Time</label>
            <input type="time" className="form-control" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Additional Notes</label>
            <textarea className="form-control" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>{loading ? 'Requesting...' : 'Confirm Booking'}</button>
        </form>
      </div>
    </div>
  );
};
export default BookingPage;