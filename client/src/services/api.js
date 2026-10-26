/**
 * Centralized API Client
 * Guidelines Section 7.2: "Create one API client module that sets the base URL,
 * headers (such as the auth token) and common error handling."
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Common fetch wrapper with automatic token injection and error parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('padshala_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Attach JWT Bearer token if logged in
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.message || (data.errors && data.errors.join(', ')))) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our custom error, rethrow
    if (error.status) throw error;
    // Network or server unreachable errors
    throw new Error('Unable to connect to server. Please check your internet or server connection.');
  }
};

// Authentication Endpoints
export const authAPI = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getMe: () =>
    request('/auth/me', {
      method: 'GET'
    })
};

// Course Endpoints
export const courseAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/courses${queryString ? `?${queryString}` : ''}`, {
      method: 'GET'
    });
  },
  getById: (id) =>
    request(`/courses/${id}`, {
      method: 'GET'
    }),
  create: (courseData) =>
    request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    }),
  update: (id, courseData) =>
    request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    }),
  delete: (id) =>
    request(`/courses/${id}`, {
      method: 'DELETE'
    })
};

// Enrollment Endpoints
export const enrollmentAPI = {
  enroll: (courseId) =>
    request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId })
    }),
  getMyEnrollments: () =>
    request('/enrollments/my', {
      method: 'GET'
    }),
  completeLesson: (courseId, lessonId) =>
    request(`/enrollments/${courseId}/complete-lesson`, {
      method: 'POST',
      body: JSON.stringify({ lessonId })
    })
};
