import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // අපි ලියපු CSS එකම මෙතනටත් පාවිච්චි කරමු

const normalizeProvider = (provider) => ({
  id: provider?.id ?? provider?.providerId ?? provider?.user_id,
  fullName: provider?.fullName || provider?.name || provider?.fullname || `Provider #${provider?.user_id || 0}`,
  category: provider?.category || provider?.profession || provider?.serviceCategory || 'Service',
  location: provider?.location || provider?.city || provider?.area || 'Not specified',
  experienceYears: provider?.experience_years ?? provider?.experienceYears ?? provider?.yearsOfExperience ?? 0,
  rate: provider?.hourly_rate ?? provider?.rate ?? provider?.hourlyRate ?? 0,
  bio: provider?.bio || provider?.description || provider?.about || 'Professional service provider ready to help.'
});

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const category = searchParams.get('category');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    axios.get('http://localhost:5000/api/providers', {
      params: {
        category,
        // send date/time for UX continuity but backend currently ignores them
        date,
        time
      }
    })
      .then(response => {
        const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
        // Keep only available providers and normalize fields for consistent UI
        const normalized = raw
          .filter(p => p && (p.is_available === 1 || p.is_available === '1' || p.is_available === true))
          .map(normalizeProvider);

        setProviders(normalized);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching providers:', error);
        setLoading(false);
      });
  }, [category, date, time]);

  return (
    <div className="ud-dashboard-container">
      {/* Sidebar - Back to Dashboard Option */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-brand">Smart Service</div>
        <nav className="ud-sidebar-menu">
          <button onClick={() => navigate('/user-dashboard')} className="ud-menu-item ud-active" style={{background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer'}}>
            ← Back to Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="ud-main-content">
        <header className="ud-header">
          <h1>{category} Providers</h1>
          <p>Find the best trusted experts available in your area.</p>
        </header>

        <section className="ud-services-section">
          {loading ? (
            <p>Searching for providers...</p>
          ) : (
            <div className="ud-services-grid">
              {providers.map((provider) => (
                <div className="ud-service-card" key={provider.id} style={{ maxWidth: '320px', textAlign: 'left', alignItems: 'flex-start', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ marginBottom: '0', color: '#1a202c' }}>{provider.fullName}</h3>
                    <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                      {provider.category}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
                    📍 <strong>Location:</strong> {provider.location}
                  </p>

                  <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '6px' }}>
                    💼 <strong>Experience:</strong> {provider.experienceYears} Years
                  </p>

                  <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>
                    💰 <strong>Rate:</strong> LKR {provider.rate}/hr
                  </p>

                  <p style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic', marginBottom: '16px', minHeight: '44px' }}>
                    “{provider.bio}”
                  </p>

                  <button
                    className="ud-view-btn"
                    style={{ width: '100%', maxWidth: 'none', backgroundColor: '#28a745' }}
                    onClick={() => navigate(`/booking?providerId=${provider.id}`)}
                  >
                    Book Now
                  </button>
                </div>
              ))}

              {providers.length === 0 && (
                <p style={{ color: '#718096', fontSize: '16px' }}>
                  Sorry, no available providers found for “{category || 'all services'}” at the moment.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SearchResults;