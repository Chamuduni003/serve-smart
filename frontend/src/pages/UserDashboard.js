import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // newcss

function UserDashboard() {
  const navigate = useNavigate();
  const [searchCategory, setSearchCategory] = useState('Plumber');
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/providers')
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const normalized = raw
          .filter(p => p && (p.is_available === 1 || p.is_available === '1' || p.is_available === true))
          .map(p => ({
            id: p.id ?? p.user_id,
            user_id: p.user_id,
            name: p.name || p.fullName || p.name,
            email: p.email,
            category: p.category,
            location: p.location,
            experience_years: p.experience_years ?? p.experience ?? 0,
            hourly_rate: p.hourly_rate ?? p.rate ?? 0,
            bio: p.bio || p.description || ''
          }));

        setProviders(normalized || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading providers:', err);
        setError('Unable to load registered providers right now.');
        setLoading(false);
      });
  }, []);

  const handleViewCategory = (categoryName) => {
    navigate(`/search-results?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSearchProviders = () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (searchCategory) params.set('category', searchCategory);
    if (searchDate) params.set('date', searchDate);
    if (searchTime) params.set('time', searchTime);

    axios.get(`http://localhost:5000/api/providers?${params.toString()}`)
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const normalized = raw
          .filter(p => p && (p.is_available === 1 || p.is_available === '1' || p.is_available === true))
          .map(p => ({
            id: p.id ?? p.user_id,
            user_id: p.user_id,
            name: p.name || p.fullName || p.name,
            email: p.email,
            category: p.category,
            location: p.location,
            experience_years: p.experience_years ?? p.experience ?? 0,
            hourly_rate: p.hourly_rate ?? p.rate ?? 0,
            bio: p.bio || p.description || ''
          }));

        setFilteredProviders(normalized || []);
        setSearchActive(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error searching providers:', err);
        setError('Unable to search providers right now.');
        setLoading(false);
      });
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    setFilteredProviders([]);
    setSearchDate('');
    setSearchTime('');
    setError('');
  };

  return (
    <div className="ud-dashboard-container">
      {/* 1. Left Side: Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-brand">Smart Service</div>
        <nav className="ud-sidebar-menu">
          <a href="#" className="ud-menu-item ud-active">Dashboard</a>
          <a href="#" className="ud-menu-item">My Bookings</a>
          <a href="#" className="ud-menu-item">Profile</a>
          <div className="ud-sidebar-footer">
            <a href="#" className="ud-menu-item ud-logout">Logout</a>
          </div>
        </nav>
      </aside>

      {/* 2. Right Side: Main Content Panel */}
      <main className="ud-main-content">
        <header className="ud-header">
          <h1>Welcome back, User!</h1>
          <p>Manage your services and bookings efficiently.</p>
        </header>

        <div className="search-panel card shadow-sm rounded-4 p-4 mb-5">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-end">
            <div className="flex-fill">
              <label className="form-label small text-secondary">Service Category</label>
              <select
                className="form-select rounded-4"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Mechanic">Mechanic</option>
              </select>
            </div>

            <div className="flex-fill">
              <label className="form-label small text-secondary">Date</label>
              <input
                type="date"
                className="form-control rounded-4"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div className="flex-fill">
              <label className="form-label small text-secondary">Time</label>
              <input
                type="time"
                className="form-control rounded-4"
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
              />
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-4 px-4"
                onClick={handleSearchProviders}
              >
                Search Providers
              </button>
            </div>
          </div>
        </div>

        {searchActive ? (
          <section className="ud-services-section">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2>Search Results</h2>
                <p className="text-secondary mb-0">Displaying providers available for your chosen date, time, and category.</p>
              </div>
              <button type="button" className="btn btn-outline-secondary rounded-4" onClick={handleClearSearch}>
                Clear Search
              </button>
            </div>

            {loading ? (
              <div className="text-secondary">Searching providers…</div>
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : filteredProviders.length === 0 ? (
              <div className="ud-no-results card p-4 text-center">
                No available providers match the selected filters. Try a different time or category.
              </div>
            ) : (
              <div className="ud-services-grid">
                {filteredProviders.map((provider) => (
                  <div key={provider.user_id || provider.id} className="ud-provider-card">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <h3 className="mb-1">{provider.name || 'Service Provider'}</h3>
                        <p className="text-secondary mb-0">{provider.category || 'Service'}</p>
                      </div>
                      <span className="badge bg-primary align-self-start">{provider.location || 'Unknown'}</span>
                    </div>

                    <p className="text-muted mb-2"><strong>Email:</strong> {provider.email || 'Not available'}</p>
                    <p className="text-muted mb-2"><strong>Experience:</strong> {provider.experience_years ?? provider.experience ?? 'N/A'} years</p>
                    <p className="text-muted mb-2"><strong>Rate:</strong> LKR {provider.hourly_rate ?? 'N/A'}/hr</p>
                    <p className="text-muted mb-2"><strong>Rating:</strong> {provider.rating ?? '4.6'}</p>
                    <p className="text-muted mb-3 small">{provider.bio || 'Professional and trusted service provider.'}</p>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/booking?providerId=${provider.user_id || provider.id}`)}
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="ud-services-section">
            <h2>Available Services</h2>
            <div className="ud-services-grid">
              <div className="ud-service-card">
                <h3>Electrician</h3>
                <button className="ud-view-btn" onClick={() => handleViewCategory('Electrician')}>
                  View
                </button>
              </div>

              <div className="ud-service-card">
                <h3>Plumber</h3>
                <button className="ud-view-btn" onClick={() => handleViewCategory('Plumber')}>
                  View
                </button>
              </div>

              <div className="ud-service-card">
                <h3>Cleaner</h3>
                <button className="ud-view-btn" onClick={() => handleViewCategory('Cleaner')}>
                  View
                </button>
              </div>

              <div className="ud-service-card">
                <h3>Mechanic</h3>
                <button className="ud-view-btn" onClick={() => handleViewCategory('Mechanic')}>
                  View
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default UserDashboard;
