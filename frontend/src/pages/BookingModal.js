import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ show, onClose, provider, bookingDate, bookingTime }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (!show || !provider) return null;

  const providerId = provider.user_id || provider.providerId || provider.providerid || provider.id;

  const handleConfirmBooking = async () => {
    const clientId = localStorage.getItem('userId') || 1;

    if (!providerId || !bookingDate || !bookingTime) {
      alert('Please select a date and time before booking.');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('http://localhost:5000/api/bookings', {
        clientId: parseInt(clientId, 10),
        providerId: parseInt(providerId, 10),
        bookingDate,
        bookingTime,
        status: 'Pending'
      });

      if (response.status === 201) {
        alert('Booking successful!');
        onClose();
        navigate('/my-bookings');
      }
    } catch (error) {
      console.error('Booking Error:', error);
      alert(error.response?.data?.error || 'Booking failed. Please check the backend server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '92vw' }}>
        <h4 style={{ textAlign: 'center' }}>Confirm Booking</h4>
        <hr />
        <p><strong>Provider:</strong> {provider.name || provider.fullName || `Provider #${providerId}`}</p>
        <p><strong>Category:</strong> {provider.category || 'Service'}</p>
        <p><strong>Date:</strong> {bookingDate || 'Not selected'}</p>
        <p><strong>Time:</strong> {bookingTime || 'Not selected'}</p>
        <hr />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary w-50" type="button" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-success w-50" type="button" onClick={handleConfirmBooking} disabled={saving}>
            {saving ? 'Booking...' : 'Confirm & Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
