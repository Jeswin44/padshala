import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

/**
 * Course Details & Enrollment Screen
 * Displays full curriculum and handles 1-click enrollment for students
 * Guidelines Section 7.3: Implements Loading, Success, Empty, and Error states
 */
const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isInstructor } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchCourseData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await courseAPI.getById(id);
      if (response && response.success) {
        setCourse(response.data);
      }

      // Check enrollment status if logged-in student
      if (isAuthenticated && isStudent) {
        try {
          const enrollmentsRes = await enrollmentAPI.getMyEnrollments();
          if (enrollmentsRes?.data) {
            const enrolled = enrollmentsRes.data.some(
              (en) => en.course?._id === id || en.course === id
            );
            setIsEnrolled(enrolled);
          }
        } catch (e) {
          // Non-blocking: enrollment check error
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await enrollmentAPI.enroll(id);
      if (response?.success) {
        setIsEnrolled(true);
        setFeedback({
          type: 'success',
          message: '🎉 Congratulations! You are now enrolled. You can start learning immediately!'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Enrollment failed. Please try again.'
      });
    } finally {
      setEnrolling(false);
    }
  };

  // State 1: Loading
  if (loading) {
    return <Spinner message="Loading course curriculum and details..." />;
  }

  // State 2: Error
  if (error) {
    return (
      <main className="container page-content">
        <Alert type="error" message={error} onRetry={fetchCourseData} />
      </main>
    );
  }

  // State 3: Empty / Not Found
  if (!course) {
    return (
      <main className="container page-content">
        <EmptyState
          icon="🔍"
          title="Course Not Found"
          message="The course you are looking for does not exist or may have been removed."
          actionLabel="Browse Other Courses"
          onAction={() => navigate('/')}
        />
      </main>
    );
  }

  // State 4: Success
  const isOwner = isInstructor && course.instructor?._id === user?.id;

  return (
    <main className="course-details-container">
      {/* Course Banner */}
      <section className="course-banner-section" aria-labelledby="course-banner-title">
        <div className="container">
          <div className="banner-nav">
            <Link to="/" className="breadcrumb-link">
              ← Back to Catalog
            </Link>
          </div>

          <div className="banner-grid">
            <div className="banner-info">
              <span className="badge-category">{course.category}</span>
              <h1 id="course-banner-title" className="course-banner-title">
                {course.title}
              </h1>
              <p className="course-banner-meta">
                Created by <strong>{course.instructor?.name || 'Educator'}</strong> ({course.instructor?.email})
              </p>
            </div>

            {/* Enrollment Action Card */}
            <div className="banner-action-card">
              <div className="action-card-body">
                <span className="price-tag">Free Enrollment</span>
                <p className="card-note">Includes full access to all lessons and materials.</p>

                {feedback.message && (
                  <Alert type={feedback.type} message={feedback.message} />
                )}

                {isEnrolled ? (
                  <Link
                    to={`/learning/${course._id}`}
                    className="btn btn-success btn-block"
                  >
                    Go to Lessons →
                  </Link>
                ) : isOwner ? (
                  <Link
                    to="/dashboard"
                    className="btn btn-outline-primary btn-block"
                  >
                    Manage in Dashboard ⚙️
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Details */}
      <section className="course-body-section container">
        <div className="course-layout-grid">
          {/* Left Column: Description & Curriculum */}
          <div className="course-main-content">
            <article className="content-card">
              <h2 className="section-title">About This Course</h2>
              <p className="course-full-description">{course.description}</p>
            </article>

            <article className="content-card">
              <h2 className="section-title">
                Curriculum ({course.lessons?.length || 0} Lessons)
              </h2>

              {course.lessons && course.lessons.length > 0 ? (
                <ul className="curriculum-list" aria-label="Course curriculum lessons">
                  {course.lessons.map((lesson, idx) => (
                    <li key={lesson._id || idx} className="curriculum-item">
                      <div className="lesson-left">
                        <span className="lesson-number">{idx + 1}</span>
                        <div className="lesson-info">
                          <h3 className="lesson-title">{lesson.title}</h3>
                          {lesson.videoUrl && (
                            <span className="lesson-tag">🎥 Video Resource Included</span>
                          )}
                        </div>
                      </div>
                      {isEnrolled && (
                        <Link
                          to={`/learning/${course._id}`}
                          className="btn btn-sm btn-link"
                        >
                          View →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-subtext">No lessons added to this course yet.</p>
              )}
            </article>
          </div>

          {/* Right Column: Key Details */}
          <aside className="course-sidebar-content">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Course Information</h3>
              <ul className="specs-list">
                <li>
                  <span className="spec-label">Category:</span>
                  <span className="spec-val">{course.category}</span>
                </li>
                <li>
                  <span className="spec-label">Total Lessons:</span>
                  <span className="spec-val">{course.lessons?.length || 0}</span>
                </li>
                <li>
                  <span className="spec-label">Access:</span>
                  <span className="spec-val">Lifetime access</span>
                </li>
                <li>
                  <span className="spec-label">Level:</span>
                  <span className="spec-val">All levels</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default CourseDetailsPage;
