const mongoose = require('mongoose');

// Subdocument Schema for Lessons (Embedded per Guidelines Section 6.4)
const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide lesson content or notes']
  },
  videoUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    index: true // Indexed for fast filtering (Section 6.4)
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lessons: [LessonSchema] // Embedded lessons list
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

module.exports = mongoose.model('Course', CourseSchema);
