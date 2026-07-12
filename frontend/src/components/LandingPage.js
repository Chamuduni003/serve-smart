
import React from 'react';
import Register from '../pages/Register'; 
import '../pages/LandingPage.css'; 
import { useNavigate } from 'react-router-dom';



const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <div className="container py-5">
        <div className="row align-items-center min-vh-100">
          
          
          <div className="col-md-5">
            <h2 className="mb-4 fw-bold text-primary">Join Our Platform</h2>
            <div id="register-section">
              <Register />
            </div>
          </div>

         
          <div className="col-md-7 text-center text-md-start ps-md-5">
            <h1 className="display-3 fw-bold mb-4">Find the Best Service Providers in Minutes</h1>
            <p className="lead mb-4 text-secondary">
              Our AI-powered recommendation system helps you connect with top-rated 
              professionals for all your daily needs. Fast, secure, and reliable.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              
<div className="provider-link">

  <button onClick={() => navigate('/provider-register')} className="btn-secondary">
    Register as a Provider
  </button>
</div>
              
              
              <button className="btn btn-outline-primary" onClick={() => navigate('/learn-more')}>
                   Learn More
               </button>
            </div>
            
            
            <img 
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800" 
              alt="Professional Service" 
              className="img-fluid mt-5 rounded-4 shadow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;