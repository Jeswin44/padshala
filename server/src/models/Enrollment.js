const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, {
  timestamps: true
});

// Compound unique index: guarantees a student can never enroll in the same course twice (Section 6.4)
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
