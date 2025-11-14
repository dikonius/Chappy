import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();       
        navigate('/login');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLogout();
        }
    };

    return (
        <button
            className="logout-button"
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            Logout
        </button>
    );
};

export default LogoutButton;
