const mongoose = require('mongoose');

const monthlyGoalSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MonthlyGoal', monthlyGoalSchema);
