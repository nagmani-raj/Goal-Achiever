const mongoose = require('mongoose');

const targetQuestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    default: '',
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  _id: true,
});

const targetTopicSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  dayCount: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  questions: [targetQuestionSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('TargetTopic', targetTopicSchema);
