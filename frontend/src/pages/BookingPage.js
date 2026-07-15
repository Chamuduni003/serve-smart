import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const providerId = params.get('providerId');

  const [formData, setFormData] = useState({ date: '', notes: '', phone: '', time: '', paymentMethod: 'Cash after service' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const clientId = Number(localStorage.getItem('userId'));

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

    if (!Number.isInteger(clientId) || clientId <= 0) {
      alert('Please sign in before creating a booking.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clientId,
        providerId: Number(providerId),
        bookingDate: formData.date,
        bookingTime: formData.time,
        paymentMethod: formData.paymentMethod,
        status: 'Pending'
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
      alert(err.response?.data?.error || 'Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueToPayment = () => {
    if (!formData.date || !formData.time || !formData.phone) {
      alert('Please complete the date, time, and phone number before continuing.');
      return;
    }
    setStep(2);
  };

  return (
    <div className="booking-wrapper">
      <div className="card booking-card p-5 shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <button className="btn btn-sm btn-outline-secondary mb-4 w-25" onClick={() => navigate(-1)}>&larr; Back</button>
        
        <div className="text-center mb-4">
          <span className="booking-page-eyebrow">SERVICE BOOKING</span>
          <h2 className="mt-1 mb-2 fw-bold text-dark">{step === 1 ? 'Book Your Service' : 'Select Payment Method'}</h2>
          <p className="text-muted mb-0">Step {step} of 2</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 ? <>
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
            <button type="button" className="btn booking-page-primary btn-lg w-100 fw-bold" onClick={continueToPayment}>Next: Payment Method</button>
          </> : <>
            <div className="booking-page-summary mb-4">
              <span>Date: <strong>{formData.date}</strong></span>
              <span>Time: <strong>{formData.time}</strong></span>
            </div>
            {['Card payment', 'Bank transfer', 'Cash after service'].map((method) => (
              <label className={`booking-page-payment ${formData.paymentMethod === method ? 'selected' : ''}`} key={method}>
                <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                <span><strong>{method}</strong><small>{method === 'Cash after service' ? 'Pay your provider after the service is complete.' : 'Payment preference saved with your booking request.'}</small></span>
              </label>
            ))}
            <p className="booking-page-note">No payment is collected at this step.</p>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary w-50 fw-bold" onClick={() => setStep(1)} disabled={loading}>Back</button>
              <button type="submit" className="btn booking-page-primary w-50 fw-bold" disabled={loading}>{loading ? 'Requesting...' : 'Confirm Booking'}</button>
            </div>
          </>}
        </form>
      </div>
    </div>
  );
};
export default BookingPage;
