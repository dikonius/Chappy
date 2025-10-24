import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  password: string;
}

const LS_KEY = 'token'; // Standardized to match ProtectedRoute and other components

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');  // Unified error for login/register
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Or navigate('/') if preferred for root/home
  };

  // Basic frontend validation (aligned with backend expectations)
  const validateForm = (data: FormData): string | null => {
    if (!data.name.trim()) return 'Name is required';
    if (data.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  // Shared success handler
  const handleSuccess = (data: { token: string; user: { id: string; name: string } }) => {
    localStorage.setItem(LS_KEY, data.token);
    // Optional: Store user info for quick access (e.g., in profile)
    localStorage.setItem('user', JSON.stringify(data.user));
    setFormData({ name: '', password: '' });  // Clear form
    console.log('Operation successful');  // Replace with toast/UI feedback
    navigate('/dashboard');  // Redirect to protected dashboard after auth
  };

  const handleSubmit = async (endpoint: '/api/login' | '/api/register', operation: string) => {
    const validationError = validateForm(formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name, password: formData.password }),  // Use 'name' to match backend
      });

      if (!response.ok) {
        let errorMsg = `${operation} failed`;
        try {
          const errorData = await response.json();
          // Handle backend validation errors array
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMsg = errorData.errors.map((err: { path: string; message: string }) => `${err.path}: ${err.message}`).join(', ');
          } else {
            errorMsg = errorData.message || errorMsg;
          }
        } catch {
          // Fallback for non-JSON
        }
        setErrorMessage(errorMsg);
        if (endpoint === '/api/login') localStorage.removeItem(LS_KEY);
        return;
      }

      const data = await response.json();
      if (data.success) {
        handleSuccess(data);
      } else {
        setErrorMessage(data.message || `${operation} failed`);
        if (endpoint === '/api/login') localStorage.removeItem(LS_KEY);
      }
    } catch (error) {
      console.error(`${operation} error:`, error);
      setErrorMessage(`Network error during ${operation.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRegister = () => handleSubmit('/api/register', 'Registration');
  const handleSubmitLogin = () => handleSubmit('/api/login', 'Login');

  const isFormValid = !!formData.name.trim() && formData.password.length >= 6;

  return (
    <>
      <div className="main-login">
        <div className="box-login column">
          <h2>Register or Login</h2>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            value={formData.name}
            disabled={isLoading}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            value={formData.password}
            disabled={isLoading}
          />

          {errorMessage && <span className="error-message">{errorMessage}</span>}
          <button
            className="button-reg"
            onClick={handleSubmitRegister}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <button
            className="login-button"
            onClick={handleSubmitLogin}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button className="button-reg" onClick={handleGoBack} disabled={isLoading}>
            Back to Previous Page
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginPage;