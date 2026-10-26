import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

/**
 * Student "My Learning" Screen
 * Displays enrolled courses with personal progress indicators
 * Guidelines Section 7.3: Implements all 4 UI states
 */
const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEnrollments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await enrollmentAPI.getMyEnrollments();
      if (response && response.success) {
        setEnrollments(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <main className="my-learning-container container page-content">
      <div className="page-header">
        <h1 className="page-title">My Learning</h1>
        <p className="page-subtitle">Track your progress and continue your active study modules.</p>
      </div>

      {error && <Alert type="error" message={error} onRetry={fetchEnrollments} />}

      {/* State 1: Loading */}
      {loading && <Spinner message="Fetching your enrolled courses..." />}

      {/* State 2: Empty */}
      {!loading && !error && enrollments.length === 0 && (
        <EmptyState
          icon="🎒"
          title="No enrolled courses yet"
          message="You have not enrolled in any courses yet. Browse our catalog and start learning today!"
          actionLabel="Browse Catalog"
          onAction={() => navigate('/')}
        />
      )}

      {/* State 3: Success */}
      {!loading && !error && enrollments.length > 0 && (
        <div className="course-grid">
          {enrollments.map((en) => {
            const course = en.course;
            if (!course) return null;

            const totalLessons = course.lessons?.length || 0;
            const completedCount = en.completedLessons?.length || 0;
            const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            return (
              <article key={en._id} className="course-card learning-card">
                <div className="course-card-body">
                  <span className="badge-category">{course.category}</span>
                  <h2 className="course-title">
                    <Link to={`/learning/${course._id}`} className="course-title-link">
                      {course.title}
                    </Link>
                  </h2>
                  <p className="instructor-meta">
                    👨‍🏫 {course.instructor?.name || 'Educator'}
                  </p>

                  {/* Progress Bar */}
                  <div className="progress-section" aria-label={`Course progress: ${progressPercent}% completed`}>
                    <div className="progress-meta">
                      <span className="progress-text">{progressPercent}% Completed</span>
                      <span className="progress-fraction">
                        {completedCount}/{totalLessons} Lessons
                      </span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="course-card-footer">
                  <Link
                    to={`/learning/${course._id}`}
                    className="btn btn-primary btn-block"
                  >
                    {completedCount === 0 ? 'Start Course →' : 'Continue Learning →'}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyLearningPage;
