const MonthlyGoal = require('../models/MonthlyGoal');

// Get all monthly goals
exports.getAllGoals = async (req, res, next) => {
  try {
    const goals = await MonthlyGoal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// Get goals by month
exports.getGoalsByMonth = async (req, res, next) => {
  try {
    const { month } = req.params;
    const goals = await MonthlyGoal.find({ month }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// Create a new monthly goal
exports.createGoal = async (req, res, next) => {
  try {
    const { month, target } = req.body;
    if (!month || !target) {
      return res.status(400).json({ success: false, message: 'Month and target are required' });
    }

    const normalizedTarget = String(target).trim();
    const existingGoal = await MonthlyGoal.findOne({
      month,
      target: { $regex: `^${normalizedTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existingGoal) {
      return res.status(400).json({ success: false, message: 'This monthly goal already exists' });
    }

    const goal = await MonthlyGoal.create({ month, target: normalizedTarget });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// Toggle goal completion
exports.toggleGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await MonthlyGoal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    goal.completed = !goal.completed;
    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// Delete a goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await MonthlyGoal.findByIdAndDelete(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};
