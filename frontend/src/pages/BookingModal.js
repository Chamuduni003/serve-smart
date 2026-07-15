import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BookingModal.css';

const paymentOptions = [
  { value: 'Card payment', title: 'Card payment', description: 'Pay securely after your booking is accepted.', icon: '▣' },
  { value: 'Bank transfer', title: 'Bank transfer', description: 'Transfer details will be shared after confirmation.', icon: '⌁' },
  { value: 'Cash after service', title: 'Cash after service', description: 'Pay the provider once the service is completed.', icon: '◉' }
];

const BookingModal = ({ show, onClose, provider, bookingDate, bookingTime }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash after service');
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (show) {
      setStep(1);
      setPaymentMethod('Cash after service');
      setBookingId(null);
    }
  }, [show]);

  if (!show || !provider) return null;

  const providerId = provider.user_id || provider.providerId || provider.providerid || provider.id;
  const providerName = provider.name || provider.fullName || `Provider #${providerId}`;

  const handleNext = () => {
    if (!bookingDate || !bookingTime) {
      alert('Please select a date and time before continuing.');
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    const clientId = Number(localStorage.getItem('userId'));

    if (!Number.isInteger(clientId) || clientId <= 0) {
      alert('Please sign in before creating a booking.');
      navigate('/login');
      return;
    }

    if (!providerId || !bookingDate || !bookingTime) {
      alert('Please select a date and time before booking.');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('http://localhost:5000/api/bookings', {
        clientId,
        providerId: parseInt(providerId, 10),
        bookingDate,
        bookingTime,
        paymentMethod,
        status: 'Pending'
      });

      if (response.status === 201) {
        setBookingId(response.data.bookingId);
      }
    } catch (error) {
      console.error('Booking Error:', error);
      alert(error.response?.data?.error || 'Booking failed. Please check the backend server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booking-modal-backdrop" role="presentation">
      <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
        <button className="booking-modal-close" type="button" onClick={onClose} disabled={saving} aria-label="Close booking">×</button>

        {bookingId ? (
          <div className="booking-success-panel">
            <div className="booking-success-icon">✓</div>
            <span className="booking-modal-eyebrow">BOOKING CONFIRMED</span>
            <h4 id="booking-modal-title">Your booking is successful!</h4>
            <p>Your request has been sent to {providerName}. You can track its status from My Bookings.</p>

            <div className="booking-summary booking-success-summary">
              <div><span>Booking ID</span><strong>#{bookingId}</strong></div>
              <div><span>Payment</span><strong>{paymentMethod}</strong></div>
              <div><span>Date</span><strong>{bookingDate}</strong></div>
              <div><span>Time</span><strong>{bookingTime}</strong></div>
            </div>

            <div className="booking-modal-actions">
              <button className="booking-secondary-button" type="button" onClick={onClose}>Done</button>
              <button className="booking-primary-button" type="button" onClick={() => { onClose(); navigate('/my-bookings'); }}>View My Bookings</button>
            </div>
          </div>
        ) : <>
        <div className="booking-modal-header">
          <span className="booking-modal-eyebrow">SERVICE BOOKING</span>
          <h4 id="booking-modal-title">{step === 1 ? 'Review your booking' : 'Choose payment method'}</h4>
          <p>{step === 1 ? 'Confirm your appointment details before continuing.' : 'Your payment preference will be saved with this request.'}</p>
        </div>

        <div className="booking-steps" aria-label={`Step ${step} of 2`}>
          <div className={`booking-step ${step >= 1 ? 'active' : ''}`}><span>1</span><small>Booking details</small></div>
          <div className="booking-step-line"></div>
          <div className={`booking-step ${step >= 2 ? 'active' : ''}`}><span>2</span><small>Payment</small></div>
        </div>

        <div className="booking-summary">
          <div><span>Provider</span><strong>{providerName}</strong></div>
          <div><span>Service</span><strong>{provider.category || 'General service'}</strong></div>
          <div><span>Date</span><strong>{bookingDate || 'Not selected'}</strong></div>
          <div><span>Time</span><strong>{bookingTime || 'Not selected'}</strong></div>
        </div>

        {step === 2 && (
          <div className="payment-options">
            {paymentOptions.map((option) => (
              <label className={`payment-option ${paymentMethod === option.value ? 'selected' : ''}`} key={option.value}>
                <input type="radio" name="payment-method" value={option.value} checked={paymentMethod === option.value} onChange={(event) => setPaymentMethod(event.target.value)} />
                <span className="payment-option-icon">{option.icon}</span>
                <span><strong>{option.title}</strong><small>{option.description}</small></span>
              </label>
            ))}
            <p className="payment-note">No payment is collected in this step. Your chosen method is saved with the booking request.</p>
          </div>
        )}

        <div className="booking-modal-actions">
          {step === 1 ? (
            <button className="booking-secondary-button" type="button" onClick={onClose}>Cancel</button>
          ) : (
            <button className="booking-secondary-button" type="button" onClick={() => setStep(1)} disabled={saving}>Back</button>
          )}
          {step === 1 ? (
            <button className="booking-primary-button" type="button" onClick={handleNext}>Next: Payment</button>
          ) : (
            <button className="booking-primary-button" type="button" onClick={handleConfirmBooking} disabled={saving}>{saving ? 'Creating booking...' : 'Confirm booking'}</button>
          )}
        </div>
        </>}
      </div>
    </div>
  );
};

export default BookingModal;
