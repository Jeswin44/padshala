const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Enroll logged-in student in a course
 * @route   POST /api/enrollments
 * @access  Private (Student only)
 */
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid courseId'
    });
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if student is already enrolled (Section 6.4 compound index safeguard)
  const existingEnrollment = await Enrollment.findOne({
    student: req.user.id,
    course: courseId
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in this course'
    });
  }

  const enrollment = await Enrollment.create({
    student: req.user.id,
    course: courseId
  });

  res.status(201).json({
    success: true,
    data: enrollment
  });
});

/**
 * @desc    Get enrolled courses for current logged-in student
 * @route   GET /api/enrollments/my
 * @access  Private (Student only)
 */
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email' }
    })
    .sort({ enrolledAt: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

/**
 * @desc    Toggle/Mark a lesson as completed for an enrolled student
 * @route   POST /api/enrollments/:courseId/complete-lesson
 * @access  Private (Student only)
 */
exports.completeLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;

  let enrollment = await Enrollment.findOne({
    student: req.user.id,
    course: req.params.courseId
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  const alreadyCompleted = enrollment.completedLessons.includes(lessonId);
  if (alreadyCompleted) {
    enrollment.completedLessons = enrollment.completedLessons.filter(
      id => id.toString() !== lessonId
    );
  } else {
    enrollment.completedLessons.push(lessonId);
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    completedLessons: enrollment.completedLessons
  });
});
