import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive Semantic Navbar
 * Guidelines Section 7.4: "Semantic HTML, labels, sufficient contrast, mobile-first design."
 */
const Navbar = () => {
  const { user, isAuthenticated, isInstructor, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-logo" aria-hidden="true">📖</span>
          <span className="brand-name">Padshala</span>
          <span className="brand-tag">पाठशाला</span>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>

        {/* Navigation links */}
        <nav
          className={`navbar-nav ${mobileMenuOpen ? 'nav-open' : ''}`}
          aria-label="Primary Navigation"
        >
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Browse Courses
          </Link>

          {isAuthenticated ? (
            <>
              {isStudent && (
                <Link to="/my-learning" className="nav-link" onClick={closeMenu}>
                  My Learning
                </Link>
              )}

              {isInstructor && (
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  Instructor Dashboard
                </Link>
              )}

              <div className="nav-user-section">
                <span className="user-badge">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-pill role-${user.role}`}>
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth-section">
              <Link to="/login" className="btn btn-sm btn-link" onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={closeMenu}>
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
