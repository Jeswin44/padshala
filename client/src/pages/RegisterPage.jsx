import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

/**
 * Register Page with role selection, controlled inputs, and validation
 * Guidelines Section 7.1: "Controlled forms, clear labels, inline validation, disabled submit button."
 */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
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
      const response = await register(formData);
      if (response?.user?.role === 'instructor') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join Padshala</h1>
          <p className="auth-subtitle">Create your account to start learning or teaching</p>
        </div>

        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I want to join as a:</label>
            <div className="role-selector-grid" role="radiogroup" aria-label="Account Role">
              <button
                type="button"
                className={`role-option-btn ${formData.role === 'student' ? 'role-selected' : ''}`}
                onClick={() => handleRoleSelect('student')}
                disabled={isSubmitting}
                role="radio"
                aria-checked={formData.role === 'student'}
              >
                <span className="role-icon" aria-hidden="true">🎓</span>
                <span className="role-title">Student</span>
                <span className="role-desc">Enroll in courses and study</span>
              </button>

              <button
                type="button"
                className={`role-option-btn ${formData.role === 'instructor' ? 'role-selected' : ''}`}
                onClick={() => handleRoleSelect('instructor')}
                disabled={isSubmitting}
                role="radio"
                aria-checked={formData.role === 'instructor'}
              >
                <span className="role-icon" aria-hidden="true">👨‍🏫</span>
                <span className="role-title">Instructor</span>
                <span className="role-desc">Create courses and publish lessons</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">
              Full Name
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Jeswin Joseph"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.name && (
              <span className="field-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Email Address
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. jeswin@example.com"
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
            <label htmlFor="reg-password" className="form-label">
              Password (min. 6 characters)
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
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
            {isSubmitting ? 'Creating Account...' : `Register as ${formData.role === 'instructor' ? 'Instructor' : 'Student'}`}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
