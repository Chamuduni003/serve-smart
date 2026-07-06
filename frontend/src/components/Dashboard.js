import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


function Dashboard() {
  const navigate = useNavigate();
  // සේවා සපයන්නන්ගේ දත්ත ගබඩා කිරීමට state එක
  const [providers, setProviders] = useState([
    // මෙය පරීක්ෂා කිරීම සඳහා උදාහරණ දත්ත කිහිපයක්. 
    // පසුව ඔබ backend එකෙන් දත්ත ගත් පසු මෙය හිස් array එකක් [ ] ලෙස තබන්න.
    { id: 1, name: "John Plumbing", category: "Plumbing", location: "Colombo", rating: 4.8 },
    { id: 2, name: "Tech Electrical", category: "Electrical", location: "Colombo", rating: 4.5 }
  ]);

  const Dashboard = () => {
  const navigate = useNavigate();
}
  return (
    <div className="container-fluid p-0 pb-5">
      {/* Search Hero Section */}
      <div className="bg-primary text-white py-5 text-center">
        <h1 className="fw-bold">Search Services Instantly</h1>
        <div className="card shadow p-3 mt-4 mx-auto" style={{ maxWidth: '900px' }}>
          <div className="row g-2">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Service (e.g. Plumbing)" />
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Location" />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-2">
              <button className="btn btn-dark w-100"><FaSearch /> Search</button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mt-5">
        <h3 className="mb-4">Explore Services by Category</h3>
        <div className="row g-4">
          {['Plumbing', 'Electrical', 'Cleaning', 'Automobile', 'Carpentry', 'Painting'].map(cat => (
            <div className="col-md-2 col-sm-4" key={cat}>
              <div className="card text-center p-3 border-0 shadow-sm" style={{ cursor: 'pointer' }}>
                <h6>{cat}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Providers Section (සෙවුම් ප්‍රතිඵල) */}
      <div className="container mt-5">
        <h3 className="mb-4">Available Providers</h3>
        <div className="row g-4">
          {providers.map((p) => (
            <div className="col-md-4" key={p.id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-muted">{p.category} - {p.location}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-warning text-dark">Rating: {p.rating}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/booking')}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;