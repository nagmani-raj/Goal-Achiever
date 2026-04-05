const express = require('express');
const router = express.Router();
const {
  getStreak,
  getStreakHistory,
  calculateStreak,
} = require('../controllers/streakController');

router.get('/', getStreak);
router.get('/history', getStreakHistory);
router.post('/calculate', calculateStreak);

module.exports = router;
