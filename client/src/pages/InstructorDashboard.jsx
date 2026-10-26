import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Web Development', 'Computer Science', 'Data Science', 'Design', 'General'];

/**
 * Instructor Dashboard Screen
 * Allows instructors to manage (Create, Read, Update, Delete) their own courses
 * Guidelines Section 6.6 & 7.1: Server-side ownership, controlled forms, 4 UI states
 */
const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal / Form state for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    lessons: [
      { title: '', content: '', videoUrl: '' }
    ]
  });

  const fetchMyCourses = async () => {
    setLoading(true);
    setError('');

    try {
      // Get all courses and filter to instructor's own courses
      const response = await courseAPI.getAll({ limit: 50 });
      if (response && response.data) {
        const myCourses = response.data.filter(
          (c) => c.instructor?._id === user?.id || c.instructor === user?.id
        );
        setCourses(myCourses);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'Web Development',
      lessons: [{ title: '', content: '', videoUrl: '' }]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      lessons:
        course.lessons && course.lessons.length > 0
          ? course.lessons.map((l) => ({
              title: l.title,
              content: l.content,
              videoUrl: l.videoUrl || ''
            }))
          : [{ title: '', content: '', videoUrl: '' }]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...courseForm.lessons];
    updatedLessons[index][field] = value;
    setCourseForm((prev) => ({ ...prev, lessons: updatedLessons }));
  };

  const addLessonField = () => {
    setCourseForm((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { title: '', content: '', videoUrl: '' }]
    }));
  };

  const removeLessonField = (index) => {
    if (courseForm.lessons.length <= 1) return;
    const updatedLessons = courseForm.lessons.filter((_, i) => i !== index);
    setCourseForm((prev) => ({ ...prev, lessons: updatedLessons }));
  };

  const validateForm = () => {
    const errs = {};
    if (!courseForm.title.trim()) errs.title = 'Course title is required';
    if (!courseForm.description.trim()) errs.description = 'Course description is required';

    // Check lessons
    courseForm.lessons.forEach((les, idx) => {
      if (!les.title.trim()) {
        errs[`lesson_${idx}_title`] = `Lesson ${idx + 1} requires a title`;
      }
      if (!les.content.trim()) {
        errs[`lesson_${idx}_content`] = `Lesson ${idx + 1} requires notes/content`;
      }
    });

    return errs;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingCourseId) {
        // Update existing course
        await courseAPI.update(editingCourseId, courseForm);
        setFeedback({
          type: 'success',
          message: 'Course updated successfully!'
        });
      } else {
        // Create new course
        await courseAPI.create(courseForm);
        setFeedback({
          type: 'success',
          message: 'New course created and published successfully!'
        });
      }

      setIsModalOpen(false);
      fetchMyCourses();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Operation failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      await courseAPI.delete(courseId);
      setFeedback({
        type: 'success',
        message: `Course "${courseTitle}" deleted successfully.`
      });
      fetchMyCourses();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete course.'
      });
    }
  };

  return (
    <main className="dashboard-container container page-content">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Instructor Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.name}</strong>. Manage your curriculum and published courses.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          + Create New Course
        </button>
      </div>

      {feedback.message && (
        <Alert type={feedback.type} message={feedback.message} />
      )}

      {error && <Alert type="error" message={error} onRetry={fetchMyCourses} />}

      {/* State 1: Loading */}
      {loading && <Spinner message="Loading your courses..." />}

      {/* State 2: Empty */}
      {!loading && !error && courses.length === 0 && (
        <EmptyState
          icon="📚"
          title="No courses created yet"
          message="You haven't published any courses yet. Click below to create your first course module!"
          actionLabel="+ Create Your First Course"
          onAction={openCreateModal}
        />
      )}

      {/* State 3: Success */}
      {!loading && !error && courses.length > 0 && (
        <div className="table-responsive">
          <table className="courses-table" aria-label="Your published courses">
            <thead>
              <tr>
                <th scope="col">Course Title</th>
                <th scope="col">Category</th>
                <th scope="col">Lessons</th>
                <th scope="col">Created Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td className="table-title-cell">
                    <strong>{course.title}</strong>
                    <span className="table-desc-preview">
                      {course.description.substring(0, 60)}...
                    </span>
                  </td>
                  <td>
                    <span className="badge-category">{course.category}</span>
                  </td>
                  <td>{course.lessons?.length || 0} lessons</td>
                  <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td className="table-actions-cell">
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-sm btn-link"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => openEditModal(course)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(course._id, course.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Modal Form (Create / Edit) */}
      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">
                {editingCourseId ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-body" noValidate>
              <div className="form-group">
                <label htmlFor="course-title" className="form-label">
                  Course Title *
                </label>
                <input
                  id="course-title"
                  type="text"
                  className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="e.g., Full Stack MERN Development"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="course-category" className="form-label">
                  Category *
                </label>
                <select
                  id="course-category"
                  className="form-select"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="course-description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="course-description"
                  rows="3"
                  className={`form-textarea ${formErrors.description ? 'input-error' : ''}`}
                  placeholder="Summarize what students will learn in this course..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </div>

              {/* Dynamic Lessons Section */}
              <div className="lessons-form-section">
                <div className="lessons-header">
                  <h3 className="lessons-heading">Course Lessons ({courseForm.lessons.length})</h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addLessonField}
                  >
                    + Add Another Lesson
                  </button>
                </div>

                {courseForm.lessons.map((lesson, idx) => (
                  <div key={idx} className="lesson-input-card">
                    <div className="lesson-card-header">
                      <span className="lesson-badge">Lesson {idx + 1}</span>
                      {courseForm.lessons.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger"
                          onClick={() => removeLessonField(idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        className={`form-input ${formErrors[`lesson_${idx}_title`] ? 'input-error' : ''}`}
                        placeholder="Lesson title (e.g. Introduction to React Components)"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                        required
                      />
                      {formErrors[`lesson_${idx}_title`] && (
                        <span className="field-error">{formErrors[`lesson_${idx}_title`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <textarea
                        rows="2"
                        className={`form-textarea ${formErrors[`lesson_${idx}_content`] ? 'input-error' : ''}`}
                        placeholder="Lesson notes, explanation, or instructions..."
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(idx, 'content', e.target.value)}
                        required
                      />
                      {formErrors[`lesson_${idx}_content`] && (
                        <span className="field-error">{formErrors[`lesson_${idx}_content`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Optional Video Resource URL (YouTube, Vimeo, etc.)"
                        value={lesson.videoUrl}
                        onChange={(e) => handleLessonChange(idx, 'videoUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving Course...'
                    : editingCourseId
                    ? 'Save Changes'
                    : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default InstructorDashboard;
