import { useEffect } from 'react';
import { useNavigate, Outlet, type NavigateFunction,  } from 'react-router-dom';
import '../App.css';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const token: string | null = localStorage.getItem('token'); // Explicitly typed as string | null

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate, token]);

  if (!token) {
    return <LoadingSpinner size="medium" color="#your-app-blue" />;
  }

  return <Outlet />; // Renders the child route elements
};

export default ProtectedRoute;