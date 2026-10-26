import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Web Development', 'Computer Science', 'Data Science', 'Design', 'General'];

/**
 * Public Course Catalog Screen
 * Implements all 4 mandatory UI states: Loading, Success, Empty, Error (Guidelines Section 7.3)
 */
const CatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit: 6 // 6 items per page for a neat 3x2 grid
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const response = await courseAPI.getAll(params);
      if (response && response.success) {
        setCourses(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCourses(response.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
    fetchCourses();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setPage(1);
  };

  return (
    <main className="catalog-page-container">
      {/* Hero Banner */}
      <section className="catalog-hero" aria-labelledby="catalog-heading">
        <div className="hero-content">
          <h1 id="catalog-heading" className="hero-title">
            Unlock Knowledge with <span className="highlight">Padshala</span>
          </h1>
          <p className="hero-subtitle">
            Explore community-driven courses designed for students, by passionate educators.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="search-form" role="search">
            <input
              type="search"
              className="search-input"
              placeholder="Search courses by title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search courses"
            />
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Catalog Content */}
      <section className="catalog-content container">
        {/* Category Filter Pills */}
        <div className="category-filter-bar" role="tablist" aria-label="Course Categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              role="tab"
              aria-selected={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* State 1: ERROR STATE (Section 7.3) */}
        {error && (
          <Alert
            type="error"
            message={error}
            onRetry={fetchCourses}
          />
        )}

        {/* State 2: LOADING STATE (Section 7.3) */}
        {loading && <Spinner message="Fetching available courses..." />}

        {/* State 3: EMPTY STATE (Section 7.3) */}
        {!loading && !error && courses.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No matching courses found"
            message={
              search || selectedCategory !== 'All'
                ? "We couldn't find any courses matching your filters. Try clearing your search."
                : 'No courses have been published yet. Be the first instructor to publish one!'
            }
            actionLabel={search || selectedCategory !== 'All' ? 'Reset Filters' : undefined}
            onAction={resetFilters}
          />
        )}

        {/* State 4: SUCCESS STATE (Section 7.3) */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="results-header">
              <span className="results-count">
                Showing {courses.length} of {totalCourses} course{totalCourses === 1 ? '' : 's'}
              </span>
            </div>

            <div className="course-grid">
              {courses.map((course) => (
                <article key={course._id} className="course-card">
                  <div className="course-card-body">
                    <span className="badge-category">{course.category}</span>
                    <h2 className="course-title">
                      <Link to={`/courses/${course._id}`} className="course-title-link">
                        {course.title}
                      </Link>
                    </h2>
                    <p className="course-desc">
                      {course.description.length > 120
                        ? `${course.description.substring(0, 120)}...`
                        : course.description}
                    </p>
                  </div>

                  <div className="course-card-footer">
                    <div className="course-meta">
                      <span className="instructor-name">
                        👤 {course.instructor?.name || 'Educator'}
                      </span>
                      <span className="lesson-count">
                        📖 {course.lessons?.length || 0} Lesson{course.lessons?.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <Link to={`/courses/${course._id}`} className="btn btn-sm btn-outline-primary">
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls (Guidelines Section 6.6) */}
            {totalPages > 1 && (
              <nav className="pagination-bar" aria-label="Course list pagination">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                >
                  ← Previous
                </button>
                <span className="page-indicator">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default CatalogPage;
