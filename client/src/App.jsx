import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import CatalogPage from './pages/CatalogPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InstructorDashboard from './pages/InstructorDashboard';
import MyLearningPage from './pages/MyLearningPage';
import LessonViewerPage from './pages/LessonViewerPage';

import './App.css';

/**
 * 404 Not Found Fallback Screen
 * Guidelines Section 11: "404 when refreshing a page or entering missing routes"
 */
const NotFoundPage = () => (
  <main className="container page-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
    <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
      The page you requested could not be found.
    </p>
    <Link to="/" className="btn btn-primary">
      Return to Catalog
    </Link>
  </main>
);

/**
 * App Root Component with Routing and Auth State
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <div className="app-main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<CatalogPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student-Only Protected Routes */}
              <Route
                path="/my-learning"
                element={
                  <ProtectedRoute requiredRole="student">
                    <MyLearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning/:courseId"
                element={
                  <ProtectedRoute requiredRole="student">
                    <LessonViewerPage />
                  </ProtectedRoute>
                }
              />

              {/* Instructor-Only Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
