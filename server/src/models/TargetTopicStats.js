const mongoose = require('mongoose');

const topicSnapshotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  completedQuestions: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  _id: false,
});

const targetTopicStatsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global',
  },
  questionDoneCount: {
    type: Number,
    default: 0,
  },
  totalTopicsCount: {
    type: Number,
    default: 0,
  },
  completedTopicsCount: {
    type: Number,
    default: 0,
  },
  totalQuestionsCount: {
    type: Number,
    default: 0,
  },
  allTopicNames: {
    type: [String],
    default: [],
  },
  completedTopicNames: {
    type: [String],
    default: [],
  },
  topicSnapshots: {
    type: [topicSnapshotSchema],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TargetTopicStats', targetTopicStatsSchema);
