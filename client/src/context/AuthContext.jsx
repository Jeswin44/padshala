import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

/**
 * AuthProvider component that wraps the app
 * Guidelines Section 7.1: "Keep shared state (such as the logged-in user) in context, not copied across components."
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial app load if token exists in localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('padshala_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response && response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem('padshala_token');
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('padshala_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle Login
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response && response.token) {
      localStorage.setItem('padshala_token', response.token);
      setUser(response.user);
    }
    return response;
  };

  // Handle Registration
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response && response.token) {
      localStorage.setItem('padshala_token', response.token);
      setUser(response.user);
    }
    return response;
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('padshala_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isInstructor: user?.role === 'instructor',
        isStudent: user?.role === 'student',
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
