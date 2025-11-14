import React, { useLayoutEffect, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const { token, isGuest } = useAuthStore();

  // Apply colors BEFORE first render
  useLayoutEffect(() => {
    if (token && !isGuest) {
      const saved = localStorage.getItem('profileColors');
      if (saved) {
        const { bg, text } = JSON.parse(saved);
        document.documentElement.style.setProperty('--profile-bg', bg);
        document.documentElement.style.setProperty('--profile-text', text);
        return;
      }
    }

    // Default guest / fallback theme
    document.documentElement.style.setProperty('--profile-bg', '#9ab5c1');
    document.documentElement.style.setProperty('--profile-text', 'black');
  }, [token, isGuest]);

  // Add/remove guest mode class
  useEffect(() => {
    if (isGuest) document.body.classList.add('guest-mode');
    else document.body.classList.remove('guest-mode');
  }, [isGuest]);

  return (
    <div className="app">
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
