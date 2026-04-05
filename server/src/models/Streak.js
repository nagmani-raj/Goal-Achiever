const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  qualified: {
    type: Boolean,
    default: false,
  },
  qualifiedAt: {
    type: Date,
    default: null,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Streak', streakSchema);
