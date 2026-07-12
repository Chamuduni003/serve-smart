
import React from 'react';
import Register from '../pages/Register'; 
import '../pages/LandingPage.css'; 
import { useNavigate } from 'react-router-dom';



const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <div className="landing-shell">
        <section className="landing-form-column" aria-label="Create an account">
          <div className="landing-eyebrow">SMART SERVICE</div>
          <h2>Join our platform</h2>
          <p>Create an account to find trusted local professionals.</p>
          <div id="register-section">
              <Register />
          </div>
        </section>

        <section className="landing-hero-column">
          <div className="landing-hero-content">
            <span className="landing-hero-label">ON-DEMAND SERVICES</span>
            <h1>Find trusted service providers, without the hassle.</h1>
            <p>
              Connect with skilled professionals for the jobs that matter. Quick booking,
              clear updates, and dependable service in one place.
            </p>
            <div className="landing-actions">
              <button onClick={() => navigate('/provider-register')} className="landing-primary-action">
                Join as a provider
              </button>
              <button className="landing-secondary-action" onClick={() => navigate('/learn-more')}>
                Learn more
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800" 
              alt="Professional Service" 
              className="landing-hero-image"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
