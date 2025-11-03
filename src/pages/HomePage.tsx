import React from 'react';
import { useNavigate } from 'react-router-dom';
import chappyLogo from '../assets/chappy-logo.png';
import './homePage.css'

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginRegister = () => {
    navigate('/login');
  };

  const handleGuestMode = () => {
    navigate('/guest');
  };

  return (
    <div className="home-page">
      <div className="home-left-panel">
        <img src={chappyLogo} alt="Chappy dog mascot" className="home-dog-image" />
      </div>

      <div className="home-right-panel">
        
        <button
          className="home-button primary"
          onClick={handleLoginRegister}
        >
          Login / Register
        </button>
        
        <button
          className="home-button secondary"
          onClick={handleGuestMode}
        >
          Guest Mode
        </button>
      </div>
    </div>
  );
};

export default HomePage;