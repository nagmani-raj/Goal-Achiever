const express = require('express');
const router = express.Router();
const {
  getAllTopics,
  createTopic,
  toggleQuestion,
  deleteTopic,
  extendTopic,
  resetTopics,
  removeTopicName,
} = require('../controllers/targetTopicController');

router.get('/', getAllTopics);
router.post('/', createTopic);
router.patch('/names/remove', removeTopicName);
router.delete('/', resetTopics);
router.patch('/:topicId/questions/:questionId/toggle', toggleQuestion);
router.patch('/:topicId/extend', extendTopic);
router.delete('/:topicId', deleteTopic);

module.exports = router;
