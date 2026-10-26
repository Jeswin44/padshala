const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes for browsing / viewing
router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor'), updateCourse)
  .delete(protect, authorize('instructor'), deleteCourse);

module.exports = router;
