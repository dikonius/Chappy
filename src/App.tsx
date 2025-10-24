import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css'
import LoadingSpinner from './components/LoadingSpinner';

// Auth hook
const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);

  useEffect(() => {
    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') setToken(e.newValue);
      if (e.key === 'user') setUser(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return { token, user, setToken, setUser, logout, isAuthenticated: !!token };
};

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(!isAuthenticated); // Toggle for guest (from Figma)

  // Loading state while checking auth
  if (!user && isAuthenticated) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="app">
        <div className="content-area">
          <Outlet context={{ user, isGuestMode, setIsGuestMode }} /> {/* Pass props to child routes */}
        </div>
    </div>
  );
};

export default App;