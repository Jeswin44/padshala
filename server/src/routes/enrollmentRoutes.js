const express = require('express');
const {
  enrollInCourse,
  getMyEnrollments,
  completeLesson
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All enrollment routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

router.post('/', enrollInCourse);
router.get('/my', getMyEnrollments);
router.post('/:courseId/complete-lesson', completeLesson);

module.exports = router;
