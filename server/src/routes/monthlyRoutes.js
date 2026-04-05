const express = require('express');
const router = express.Router();
const {
  getAllGoals,
  getGoalsByMonth,
  createGoal,
  toggleGoal,
  deleteGoal,
} = require('../controllers/monthlyController');

router.get('/', getAllGoals);
router.get('/:month', getGoalsByMonth);
router.post('/', createGoal);
router.patch('/:id/toggle', toggleGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
