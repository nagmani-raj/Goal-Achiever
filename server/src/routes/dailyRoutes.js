const express = require('express');
const router = express.Router();
const {
  getDailyGoals,
  addTopic,
  addWork,
  toggleWork,
  deleteTopic,
  deleteWork,
} = require('../controllers/dailyController');

router.get('/:date', getDailyGoals);
router.post('/:date/topic', addTopic);
router.post('/:date/topic/:topicId/work', addWork);
router.patch('/:date/topic/:topicId/work/:workId/toggle', toggleWork);
router.delete('/:date/topic/:topicId', deleteTopic);
router.delete('/:date/topic/:topicId/work/:workId', deleteWork);

module.exports = router;
