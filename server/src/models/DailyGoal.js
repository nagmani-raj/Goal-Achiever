const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  works: [workSchema],
});

const dailyGoalSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  topics: [topicSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('DailyGoal', dailyGoalSchema);
