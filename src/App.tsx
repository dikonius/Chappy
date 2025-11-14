import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const { token, isGuest } = useAuthStore();

  // Load profile colors globally on app load + auth state change
  useEffect(() => {
    if (token && !isGuest) {
      const saved = localStorage.getItem('profileColors');
      if (saved) {
        const { bg, text } = JSON.parse(saved);
        document.documentElement.style.setProperty('--profile-bg', bg);
        document.documentElement.style.setProperty('--profile-text', text);
        return;
      }
    }

    // Default colors
    document.documentElement.style.setProperty('--profile-bg', 'rgba(153, 217, 249, 1)');
    document.documentElement.style.setProperty('--profile-text', '#000000');
  }, [token, isGuest]);

  return (
    <div className="app">
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
