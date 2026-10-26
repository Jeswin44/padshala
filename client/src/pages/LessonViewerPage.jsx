import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

/**
 * Lesson Viewer & Classroom Screen
 * Provides side-by-side lesson navigation and completion toggle
 * Guidelines Section 7.3 & 7.4: Responsive layout, progress feedback, 4 UI states
 */
const LessonViewerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingLesson, setUpdatingLesson] = useState(false);
  const [error, setError] = useState('');

  const fetchClassroomData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch course details
      const courseRes = await courseAPI.getById(courseId);
      if (courseRes?.success) {
        setCourse(courseRes.data);
      }

      // 2. Fetch student's enrollment record
      const enrollmentsRes = await enrollmentAPI.getMyEnrollments();
      if (enrollmentsRes?.data) {
        const myEn = enrollmentsRes.data.find(
          (en) => en.course?._id === courseId || en.course === courseId
        );

        if (!myEn) {
          setError('You are not enrolled in this course yet. Please enroll first.');
        } else {
          setEnrollment(myEn);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load classroom materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomData();
  }, [courseId]);

  const activeLesson = course?.lessons?.[activeLessonIndex];
  const completedLessonIds = enrollment?.completedLessons || [];
  const isLessonCompleted = activeLesson && completedLessonIds.includes(activeLesson._id);

  const handleToggleComplete = async () => {
    if (!activeLesson) return;

    setUpdatingLesson(true);
    try {
      const response = await enrollmentAPI.completeLesson(courseId, activeLesson._id);
      if (response?.success) {
        setEnrollment((prev) => ({
          ...prev,
          completedLessons: response.completedLessons
        }));
      }
    } catch (err) {
      alert(err.message || 'Could not update completion status.');
    } finally {
      setUpdatingLesson(false);
    }
  };

  // State 1: Loading
  if (loading) {
    return <Spinner message="Preparing your digital classroom..." />;
  }

  // State 2: Error
  if (error) {
    return (
      <main className="container page-content">
        <Alert type="error" message={error} onRetry={fetchClassroomData} />
        <div style={{ marginTop: '1rem' }}>
          <Link to={`/courses/${courseId}`} className="btn btn-outline">
            Go to Course Overview
          </Link>
        </div>
      </main>
    );
  }

  // State 3: Empty / No lessons
  if (!course || !course.lessons || course.lessons.length === 0) {
    return (
      <main className="container page-content">
        <EmptyState
          icon="📝"
          title="No lessons published yet"
          message="The instructor has not added any lessons to this course yet. Please check back later!"
          actionLabel="Back to Courses"
          onAction={() => navigate('/my-learning')}
        />
      </main>
    );
  }

  // State 4: Success
  const totalLessons = course.lessons.length;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <main className="classroom-layout">
      {/* Classroom Sidebar: Curriculum navigation */}
      <aside className="classroom-sidebar" aria-label="Course curriculum navigation">
        <div className="sidebar-header">
          <Link to="/my-learning" className="back-link">
            ← My Learning
          </Link>
          <h2 className="classroom-course-title">{course.title}</h2>

          <div className="classroom-progress">
            <div className="progress-labels">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <nav className="lessons-nav-list" aria-label="Lesson list">
          {course.lessons.map((lesson, idx) => {
            const isCompleted = completedLessonIds.includes(lesson._id);
            const isActive = idx === activeLessonIndex;

            return (
              <button
                key={lesson._id || idx}
                type="button"
                className={`lesson-nav-item ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
                onClick={() => setActiveLessonIndex(idx)}
              >
                <span className="lesson-nav-status" aria-hidden="true">
                  {isCompleted ? '✅' : '⚪'}
                </span>
                <span className="lesson-nav-title">
                  {idx + 1}. {lesson.title}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Classroom Main View: Active lesson content */}
      <section className="classroom-content" aria-labelledby="active-lesson-title">
        {activeLesson ? (
          <article className="active-lesson-card">
            <header className="lesson-content-header">
              <span className="badge-category">
                Lesson {activeLessonIndex + 1} of {totalLessons}
              </span>
              <h1 id="active-lesson-title" className="active-lesson-title">
                {activeLesson.title}
              </h1>

              {/* Completion Toggle Button */}
              <button
                type="button"
                className={`btn btn-sm ${
                  isLessonCompleted ? 'btn-success' : 'btn-outline-primary'
                }`}
                onClick={handleToggleComplete}
                disabled={updatingLesson}
              >
                {updatingLesson
                  ? 'Updating...'
                  : isLessonCompleted
                  ? '✓ Completed'
                  : 'Mark as Completed'}
              </button>
            </header>

            {/* Optional Video Player / Resource Link */}
            {activeLesson.videoUrl && (
              <div className="lesson-video-box">
                <span className="video-icon" aria-hidden="true">🎥</span>
                <div className="video-info">
                  <strong>Course Video Resource:</strong>
                  <a
                    href={activeLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-link"
                  >
                    Open Resource ({activeLesson.videoUrl}) ↗
                  </a>
                </div>
              </div>
            )}

            {/* Lesson Body Notes */}
            <div className="lesson-body-notes">
              <h2 className="notes-heading">Lesson Notes & Instructions</h2>
              <div className="notes-content">{activeLesson.content}</div>
            </div>

            {/* Navigation footer between lessons */}
            <footer className="lesson-nav-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveLessonIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeLessonIndex === 0}
              >
                ← Previous Lesson
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setActiveLessonIndex((prev) => Math.min(prev + 1, totalLessons - 1))
                }
                disabled={activeLessonIndex === totalLessons - 1}
              >
                Next Lesson →
              </button>
            </footer>
          </article>
        ) : (
          <EmptyState title="Select a lesson" message="Click on a lesson from the curriculum sidebar to start reading." />
        )}
      </section>
    </main>
  );
};

export default LessonViewerPage;
