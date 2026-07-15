import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import { FaHome, FaBriefcase, FaDollarSign, FaTools, FaMapMarkerAlt, FaSignOutAlt, FaUser, FaCalendarCheck } from 'react-icons/fa';
import './UserDashboard.css';
import BookingModal from './BookingModal';

function parseSearchInput(input) {
  if (!input.trim()) return { service: '', location: '' };
  const lowerInput = input.toLowerCase();
  const serviceKeywords = {
    'gardener': 'Gardening', 'gardening': 'Gardening',
    'cleaner': 'Cleaning', 'cleaning': 'Cleaning',
    'plumber': 'Plumbing', 'plumbing': 'Plumbing',
    'electrician': 'Electrical', 'electrical': 'Electrical',
    'carpenter': 'Carpentry', 'carpentry': 'Carpentry',
    'painter': 'Painting', 'painting': 'Painting',
    'mechanic': 'Mechanic', 'auto repair': 'Auto Repair'
  };
  const locationKeywords = ['near', 'at', 'in', 'around', 'near by'];
  let extractedService = '';
  let extractedLocation = '';

  for (const [keyword, category] of Object.entries(serviceKeywords)) {
    if (lowerInput.includes(keyword)) { extractedService = category; break; }
  }
  for (const locKeyword of locationKeywords) {
    const pattern = new RegExp(`\\b${locKeyword}\\s+(.+?)(?:\\s*$|\\s+(?:${locationKeywords.join('|')}))`);
    const match = lowerInput.match(pattern);
    if (match && match[1]) {
      extractedLocation = match[1].replace(/[^a-z0-9\s]/gi, '').trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      break;
    }
  }
  if (!extractedService && !extractedLocation && input.trim()) {
    const parts = input.split(/\s+/);
    if (parts.length >= 2) {
      extractedService = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      extractedLocation = parts.slice(1).join(' ');
    } else { extractedService = input; }
  }
  return { service: extractedService, location: extractedLocation };
}

function UserDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingInputs, setBookingInputs] = useState({});
  const [slotAvailability, setSlotAvailability] = useState({});
  const availabilityRequestIds = useRef({});

  const fetchProviders = async (serviceQuery = '', locationQuery = '') => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/provider/search', {
        params: { service: serviceQuery, location: locationQuery }
      });
      setProviders(res.data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    const { service: parsedService, location: parsedLocation } = parseSearchInput(searchTerm);
    setService(parsedService);
    setLocation(parsedLocation);
    fetchProviders(parsedService, parsedLocation);
  };

  const checkSlotAvailability = async (providerId, date, time) => {
    const requestId = (availabilityRequestIds.current[providerId] || 0) + 1;
    availabilityRequestIds.current[providerId] = requestId;

    if (!date || !time) {
      setSlotAvailability(prev => ({ ...prev, [providerId]: { status: 'idle' } }));
      return;
    }

    setSlotAvailability(prev => ({ ...prev, [providerId]: { status: 'checking' } }));
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/availability', {
        params: { providerId, date, time }
      });
      if (availabilityRequestIds.current[providerId] !== requestId) return;

      setSlotAvailability(prev => ({
        ...prev,
        [providerId]: { status: response.data.available ? 'available' : 'unavailable' }
      }));
    } catch (err) {
      console.error('Error checking provider availability:', err);
      if (availabilityRequestIds.current[providerId] === requestId) {
        setSlotAvailability(prev => ({ ...prev, [providerId]: { status: 'error' } }));
      }
    }
  };

  const handleInputChange = (providerId, field, value) => {
    const nextInputs = { ...bookingInputs[providerId], [field]: value };
    setBookingInputs(prev => ({
      ...prev,
      [providerId]: nextInputs
    }));
    checkSlotAvailability(providerId, nextInputs.date, nextInputs.time);
  };

  const today = new Date().toISOString().split('T')[0];

  // 🚪 Logout Functionality
  const handleLogout = () => {
   
    window.location.href = '/login'; 
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* 🌐 TOP NAVIGATION BAR WITH HOME LINK */}
      <nav className="dashboard-navbar">
        <div className="nav-logo" onClick={() => window.location.href = '/user-dashboard'} style={{cursor: 'pointer'}}>
          Serve<span>Smart</span>
        </div>
        <div className="nav-links">
          {/* 🏠 Home Button */}
          <button className="nav-item" onClick={() => window.location.href = '/'}>
            <FaHome /> Home
          </button>
          
          <button className="nav-item active" onClick={() => window.location.href = '/user-dashboard'}>
            <FaTools /> Find Services
          </button>
          
          <button className="nav-item" onClick={() => window.location.href = '/my-bookings'}>
            <FaCalendarCheck /> My Bookings
          </button>
          
          <button className="nav-item" onClick={() => window.location.href = '/profile'}>
            <FaUser /> Profile
          </button>
          
          <button className="nav-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* 🏢 MAIN CONTENT AREA (PAGE SIZE INCREASED) */}
      <div className="dashboard-main-content">
        <h2 className="main-title">Find Available Service Providers</h2>
        <p className="main-subtitle">
          💡 Tip: Type naturally like "I need a plumber near Kelaniya" or "gardener at Colombo"
        </p>

        {/* SEARCH BAR CONTAINER */}
        <form onSubmit={handleSearch} className="full-search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by service, provider name, or category..."
            className="full-search-input"
          />
          <button type="submit" className="full-search-btn">
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* NLP EXTRACTION INDICATOR */}
        {(service || location) && (
          <div className="extracted-badge-row">
            <strong>🔍 Extracted:</strong>
            {service && <span className="badge service-tag">Service: {service}</span>}
            {location && <span className="badge location-tag">Location: {location}</span>}
          </div>
        )}

        {/* CARDS DISPLAY CONTAINER */}
        {loading ? (
          <p className="status-message">Loading providers...</p>
        ) : providers.length === 0 ? (
          <p className="status-message">No providers found for this search.</p>
        ) : (
          <div className="full-page-providers-grid">
            {providers.map((provider, index) => (
              <div className="provider-vertical-card" key={provider.id || index}>
                
                {/* Profile Avatar & Name */}
                <div className="card-avatar-wrapper">
                  <img
                    src={provider.profile_image || 'https://picsum.photos/150'}
                    alt={provider.name}
                    className="provider-round-avatar"
                  />
                  <h3 className="provider-display-name">{provider.name}</h3>
                </div>

                {/* Info List */}
                <div className="card-info-list">
                  <div className="info-row"><FaBriefcase className="icon-b" /> <span><b>Experience:</b> {provider.experience_years || '2'} Years</span></div>
                  <div className="info-row"><FaDollarSign className="icon-g" /> <span><b>Rate:</b> LKR {provider.hourly_rate || '1000'}/hr</span></div>
                  <div className="info-row"><FaTools className="icon-o" /> <span><b>Category:</b> {provider.category}</span></div>
                  <div className="info-row"><FaMapMarkerAlt className="icon-r" /> <span><b>Location:</b> {provider.location || 'Kelaniya'}</span></div>
                </div>

                {/* Mini Scheduler Inputs */}
                <div className="card-scheduler-box">
                  <div className="mini-input-field">
                    <label>Select Date:</label>
                    <input
                      type="date"
                      className="input-element"
                      min={today}
                      value={bookingInputs[provider.id]?.date || ''}
                      onChange={(e) => handleInputChange(provider.id, 'date', e.target.value)}
                    />
                  </div>
                  <div className="mini-input-field">
                    <label>Select Time:</label>
                    <input
                      type="time"
                      className="input-element"
                      value={bookingInputs[provider.id]?.time || ''}
                      onChange={(e) => handleInputChange(provider.id, 'time', e.target.value)}
                    />
                  </div>
                </div>

                {slotAvailability[provider.id]?.status === 'checking' && (
                  <p className="slot-status checking">Checking availability...</p>
                )}
                {slotAvailability[provider.id]?.status === 'available' && (
                  <p className="slot-status available">Available for this date and time</p>
                )}
                {slotAvailability[provider.id]?.status === 'unavailable' && (
                  <p className="slot-status unavailable">Not available for this date and time</p>
                )}
                {slotAvailability[provider.id]?.status === 'error' && (
                  <p className="slot-status unavailable">Unable to verify availability. Please try again.</p>
                )}

                {/* Booking Button */}
                <div className="card-action-wrapper">
                  <button 
                    className="full-card-book-btn" 
                    disabled={['checking', 'unavailable', 'error'].includes(slotAvailability[provider.id]?.status)}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowModal(true);
                    }}
                  >
                    {slotAvailability[provider.id]?.status === 'unavailable' ? 'Not Available' : 'Book Now'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <BookingModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        provider={selectedProvider} 
        bookingDate={selectedProvider ? bookingInputs[selectedProvider.id]?.date : ''} 
        bookingTime={selectedProvider ? bookingInputs[selectedProvider.id]?.time : ''} 
      />

    </div>
  );
}

export default UserDashboard;
