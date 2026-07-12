import React, { useState, useEffect } from 'react';

export default function ProviderDashboard() {
  const [provider, setProvider] = useState({ name: 'Service Provider' });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // 1. ලොග් වෙලා ඉන්න කෙනාගේ විස්තර LocalStorage එකෙන් ගන්න
    const providerData = localStorage.getItem('loggedInProvider');
    if (providerData) {
      setProvider(JSON.parse(providerData));
    }

    // 2. LocalStorage එකේ තියෙන active_booking එක ගන්න
    const bookingData = localStorage.getItem('active_booking');
    if (bookingData) {
      const booking = JSON.parse(bookingData);
      
      const loggedProvider = JSON.parse(providerData);
      if (loggedProvider && booking.providerName === loggedProvider.name) {
        setRequests([booking]); 
      }
    }
  }, []);

  const handleLogout = () => {
    // 1. අදාළ දත්ත පමණක් මකන්න
    localStorage.removeItem('loggedInProvider');
    localStorage.removeItem('active_booking');

    // 2. Refresh කරලා Login පේජ් එකට යවන්න
    window.location.href = '/login'; 
  };

  return (
    <div className="d-flex" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav className="bg-dark text-white p-4" style={{ width: '250px' }}>
        <h4 className="mb-5 fw-bold text-primary">Smart Service</h4>
        <ul className="nav flex-column gap-3">
          <li className="nav-item"><a className="nav-link text-white active" href="#"><i className="bi bi-grid-fill me-2"></i>Dashboard</a></li>
          <li className="nav-item"><a className="nav-link text-secondary" href="#"><i className="bi bi-calendar-check me-2"></i>Bookings</a></li>
          <li className="nav-item"><a className="nav-link text-secondary" href="#"><i className="bi bi-person-circle me-2"></i>Profile</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1">
        
        {/* අලුත් Navbar එක */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white px-5 py-3 shadow-sm">
          <div className="container-fluid">
            <span className="navbar-brand fw-bold text-primary">Dashboard</span>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small">Welcome, <strong className="text-dark">{provider.name}</strong></span>
              <button 
  className="btn btn-outline-danger btn-sm" 
  onClick={handleLogout}
>
  Logout
</button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-5">
          <header className="mb-4">
            <h2 className="fw-bold">Welcome back, {provider.name}! 👋</h2>
            <p className="text-muted">Manage your service requests efficiently.</p>
          </header>

          {/* Stats Card */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card p-3 border-0 shadow-sm rounded-4">
                <p className="text-muted small">New Requests</p>
                <h3 className="fw-bold">{requests.length}</h3>
              </div>
            </div>
          </div>

          {/* Dynamic Booking Requests */}
          <h5 className="fw-bold mb-3">Incoming Requests</h5>
          <div className="row">
            {requests.length === 0 ? (
              <p className="text-muted px-3">No new requests found.</p>
            ) : (
              requests.map((req, index) => (
                <div key={index} className="col-md-4">
                  <div className="card border-0 shadow-sm p-3 rounded-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        {req.clientName ? req.clientName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-0 fw-bold">{req.clientName || 'Valued Client'}</h6>
                        <small className="text-muted">{req.category || 'Service'}</small>
                      </div>
                    </div>
                    <div className="small mb-3">
                      <p className="mb-1"><i className="bi bi-calendar-event me-2 text-primary"></i> {req.bookingDate}</p>
                      <p className="mb-1"><i className="bi bi-clock me-2 text-primary"></i> {req.bookingTime}</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-success btn-sm flex-grow-1">Accept</button>
                      <button className="btn btn-outline-danger btn-sm flex-grow-1">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}