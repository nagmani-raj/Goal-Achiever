const DailyGoal = require('../models/DailyGoal');

// Get daily goals for a specific date
exports.getDailyGoals = async (req, res, next) => {
  try {
    const { date } = req.params;
    let daily = await DailyGoal.findOne({ date });
    if (!daily) {
      daily = await DailyGoal.create({ date, topics: [] });
    }
    res.json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};

// Add a topic to a date
exports.addTopic = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const normalizedTitle = String(title).trim();

    let daily = await DailyGoal.findOne({ date });
    if (!daily) {
      daily = await DailyGoal.create({ date, topics: [] });
    }

    const duplicateTopic = daily.topics.some(
      (topic) => topic.title.trim().toLowerCase() === normalizedTitle.toLowerCase()
    );

    if (duplicateTopic) {
      return res.status(400).json({ success: false, message: 'This daily topic already exists' });
    }

    daily.topics.push({ title: normalizedTitle, works: [] });
    await daily.save();
    res.status(201).json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};

// Add work to a topic
exports.addWork = async (req, res, next) => {
  try {
    const { date, topicId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Work text is required' });
    }

    const daily = await DailyGoal.findOne({ date });
    if (!daily) {
      return res.status(404).json({ success: false, message: 'Daily goal not found' });
    }

    const topic = daily.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    topic.works.push({ text, completed: false });
    await daily.save();
    res.status(201).json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};

// Toggle work completion
exports.toggleWork = async (req, res, next) => {
  try {
    const { date, topicId, workId } = req.params;
    const daily = await DailyGoal.findOne({ date });
    if (!daily) {
      return res.status(404).json({ success: false, message: 'Daily goal not found' });
    }

    const topic = daily.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const work = topic.works.id(workId);
    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    work.completed = !work.completed;
    await daily.save();
    res.json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};

// Delete a topic
exports.deleteTopic = async (req, res, next) => {
  try {
    const { date, topicId } = req.params;
    const daily = await DailyGoal.findOne({ date });
    if (!daily) {
      return res.status(404).json({ success: false, message: 'Daily goal not found' });
    }

    daily.topics = daily.topics.filter(t => t._id.toString() !== topicId);
    await daily.save();
    res.json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};

// Delete a work item
exports.deleteWork = async (req, res, next) => {
  try {
    const { date, topicId, workId } = req.params;
    const daily = await DailyGoal.findOne({ date });
    if (!daily) {
      return res.status(404).json({ success: false, message: 'Daily goal not found' });
    }

    const topic = daily.topics.id(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    topic.works = topic.works.filter(w => w._id.toString() !== workId);
    await daily.save();
    res.json({ success: true, data: daily });
  } catch (error) {
    next(error);
  }
};
