import { useNavigate } from 'react-router-dom';
import React from 'react';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    
    const handleLogout = (): void => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };
    
    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent default space/enter behavior
            handleLogout();
        }
    };
    
    return (
        
        <button
            className="Login-button"
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