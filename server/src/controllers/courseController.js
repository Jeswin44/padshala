const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all courses with pagination and optional search/category filters
 * @route   GET /api/courses
 * @access  Public
 * Guidelines Section 6.6: "For lists that can grow, add pagination and a sensible maximum page size."
 */
exports.getCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50); // Sensible max of 50
  const skip = (page - 1) * limit;

  // Build query filter
  const query = {};

  // Search by keyword in title or description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (req.query.category && req.query.category !== 'All') {
    query.category = req.query.category;
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: courses
  });
});

/**
 * @desc    Get single course details by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: `Course not found with id of ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Instructor only)
 */
exports.createCourse = asyncHandler(async (req, res) => {
  // Automatically assign current logged in instructor (Section 6.6)
  req.body.instructor = req.user.id;

  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide course title, description, and category'
    });
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Course Instructor Owner only)
 * Guidelines Section 6.6: "Always check ownership on the server."
 */
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: `Course not found with id of ${req.params.id}`
    });
  }

  // Server-side ownership verification
  if (course.instructor.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized: You can only edit courses that you created'
    });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Course Instructor Owner only)
 * Guidelines Section 6.6: "Always check ownership on the server."
 */
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: `Course not found with id of ${req.params.id}`
    });
  }

  // Server-side ownership verification
  if (course.instructor.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized: You can only delete courses that you created'
    });
  }

  // Delete course and cascade delete associated enrollments
  await Course.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ course: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Course and related enrollments successfully deleted'
  });
});
