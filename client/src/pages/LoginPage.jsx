import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

/**
 * Login Page with controlled form and validation
 * Guidelines Section 7.1: "Controlled forms with clear labels, inline validation, disabled button while submitting."
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after successful login
  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await login(formData.email, formData.password);
      // Navigate based on user role
      if (response?.user?.role === 'instructor') {
        navigate('/dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your Padshala account</p>
        </div>

        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.email && (
              <span className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.password && (
              <span className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
