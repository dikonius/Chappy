import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import '../App.css';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) return null;
  return <Outlet />;
};

export default ProtectedRoute;