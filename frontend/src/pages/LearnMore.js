import React from 'react';
import { useNavigate } from 'react-router-dom';

function LearnMore() {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      {/* 1. Header Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">How Smart Service Works</h1>
        <p className="lead text-muted">Connecting you with the best professionals in minutes.</p>
      </div>

      {/* 2. Steps Section */}
      <div className="row text-center mb-5">
        <div className="col-md-4">
          <div className="p-4">
            <h2 className="text-primary">🔍 01</h2>
            <h4>Search</h4>
            <p>Find the exact service you need from our wide range of categories.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4">
            <h2 className="text-primary">📅 02</h2>
            <h4>Book</h4>
            <p>Select a trusted professional and book a time that suits you.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4">
            <h2 className="text-primary">✅ 03</h2>
            <h4>Done</h4>
            <p>Get your services done by verified experts with 100% satisfaction.</p>
          </div>
        </div>
      </div>

      {/* 3. Why Choose Us Section */}
      <section className="container my-5">
        <h2 className="text-center mb-4">Why Choose Smart Service?</h2>
        <div className="row text-center">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h5>Verified Pros</h5>
              <p>All our professionals are background checked.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h5>Fair Pricing</h5>
              <p>Transparent pricing with no hidden costs.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h5>24/7 Support</h5>
              <p>We are here to help you anytime you need.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h5>Safe & Secure</h5>
              <p>Your data and bookings are 100% secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <div className="text-center bg-light p-5 rounded">
        <h3>Ready to get started?</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/register')}>
          Join Now
        </button>
      </div>
    </div>
  );
}

export default LearnMore;