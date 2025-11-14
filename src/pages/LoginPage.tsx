import React, { useState } from 'react';
import '../App.css';
import './homePage.css';
import { useNavigate } from 'react-router-dom';
import chappyLogo from '../assets/chappy-logo.png';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import type { FormData, ValidationErrors } from '../../srcServer/data/types.ts';
import { useAuthStore } from '../store/useAuthStore';  
import LoadingSpinner from '../components/LoadingSpinner.tsx';

const LS_KEY = 'token';  

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', password: '' });
  const [nameError, setNameError] = useState<string>('');  
  const [passwordError, setPasswordError] = useState<string>('');  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const authStore = useAuthStore();  

  const handleGuestMode = () => {
    authStore.setGuest();  
    navigate('/guest');
  };

  const validateForm = (data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (data.name.trim().length < 1) {
      errors.name = 'Name must be at least 1 character';
    }
    if (data.name.trim().length > 50) {
      errors.name = "Name can't be longer than 50 characters";
    }
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (data.password.length > 50) {
      errors.password = "Password can't be longer than 50 characters";
    }
    return errors;
  };

  // Shared success handler
  const handleSuccess = (data: { token: string; user: { id: string; name: string } }) => {
    authStore.setAuth(data.token, data.user);  
    setFormData({ name: '', password: '' });  
    console.log('Operation successful'); 
    navigate('/dashboard');  
  };

  const handleSubmit = async (endpoint: '/api/login' | '/api/register', operation: string) => {
    const errors = validateForm(formData);
    setNameError(errors.name || '');
    setPasswordError(errors.password || '');
    if (errors.name || errors.password) {
      return;  
    }

    setNameError('');
    setPasswordError('');
    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name, password: formData.password }),
      });

      if (!response.ok) {
        let errorMsg = `${operation} failed`;
        try {
          const errorData = await response.json();
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle backend errors by field
            errorData.errors.forEach((err: { path: string[]; message: string }) => {
              const field = err.path[0];
              if (field === 'name') setNameError(err.message);
              if (field === 'password') setPasswordError(err.message);
            });
          } else {
            errorMsg = errorData.message || errorMsg;
            setNameError(errorMsg);
            setPasswordError(errorMsg);  // Show unified if not field-specific
          }
        } catch {
          // Fallback
          setNameError(errorMsg);
          setPasswordError(errorMsg);
        }
        if (endpoint === '/api/login') localStorage.removeItem(LS_KEY);
        return;
      }

      const data = await response.json();
      if (data.success) {
        handleSuccess(data);
      } else {
        setNameError(data.message || `${operation} failed`);
        setPasswordError(data.message || `${operation} failed`);
        if (endpoint === '/api/login') localStorage.removeItem(LS_KEY);
      }
    } catch (error) {
      console.error(`${operation} error:`, error);
      const errorMsg = `Network error during ${operation.toLowerCase()}`;
      setNameError(errorMsg);
      setPasswordError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleSubmitRegister = () => handleSubmit('/api/register', 'Registration');
  const handleSubmitLogin = () => handleSubmit('/api/login', 'Login');

  if (isLoading) {
  return (
    <div className="loading-center">
      <LoadingSpinner size="large" centered />
    </div>
    );
  }


  return (
    <>
      <div className="home-page">
        <div className="home-left-panel">
          <img src={chappyLogo} alt="Chappy dog mascot" className="home-dog-image" />
        </div>
        <div className="home-right-panel">
          <h2 className='h2-login'>Login or Register</h2>
          <label htmlFor="name" className="nameLabel">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            value={formData.name}
            disabled={isLoading}
          />
          <span className="error-message">{nameError}</span>
          
          <label htmlFor="password" className="passwordLabel">Password</label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              value={formData.password}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-button"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
          </div>
          <span className="error-message">{passwordError}</span>

          <button
            className="home-button primary"
            onClick={handleSubmitLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <button
            className="home-button tertiary"
            onClick={handleSubmitRegister}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          
          <button
            className="home-button secondary"
            onClick={handleGuestMode}
            disabled={isLoading}
          >
            Guest Mode
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPage;