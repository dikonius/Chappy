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
      {/* Left panel: Logo and dog image */}
      <div className="home-left-panel">
        <img src={chappyLogo} alt="Chappy dog mascot" className="home-dog-image" />
        {/* <h1 className="home-logo">CHAPPY</h1> */}
      </div>

      {/* Right panel: Welcome text and buttons */}
      <div className="home-right-panel">
        {/* <h2 className="home-welcome">Welcome to Chappy!</h2>
        <p className="home-subtitle">Connect with friends in fun channels or send private messages.</p> */}
        
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