const TargetTopic = require('../models/TargetTopic');
const TargetTopicStats = require('../models/TargetTopicStats');

const parseDateKey = (dateStr) => new Date(`${dateStr}T00:00:00`);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr, days) => {
  const date = parseDateKey(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

const getDueDate = (startDate, dayCount) => addDays(startDate, Number(dayCount) - 1);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getUniqueNames = (names = []) => {
  const seen = new Set();
  return names.filter((name) => {
    const normalized = String(name).trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const getOrderedTopics = async () => (
  TargetTopic.find().sort({ order: 1, createdAt: 1, _id: 1 })
);

const getStats = async () => (
  TargetTopicStats.findOneAndUpdate(
    { key: 'global' },
    {
      $setOnInsert: {
        key: 'global',
        questionDoneCount: 0,
        totalTopicsCount: 0,
        completedTopicsCount: 0,
        totalQuestionsCount: 0,
        allTopicNames: [],
        completedTopicNames: [],
        topicSnapshots: [],
      },
    },
    { upsert: true, new: true }
  )
);

const getStatsMeta = (stats) => ({
  questionDoneCount: stats.questionDoneCount,
  totalTopicsCount: stats.totalTopicsCount,
  completedTopicsCount: stats.completedTopicsCount,
  totalQuestionsCount: stats.totalQuestionsCount,
  allTopicNames: getUniqueNames(stats.allTopicNames || []),
  completedTopicNames: getUniqueNames(stats.completedTopicNames || []),
});

const syncTopicSnapshot = async (topic) => {
  const stats = await getStats();
  const normalizedTitle = String(topic.title).trim().toLowerCase();
  const completedQuestions = (topic.questions || []).filter((question) => question.completed).length;
  const snapshot = {
    name: topic.title,
    totalQuestions: topic.questions?.length || 0,
    completedQuestions,
    completed: !!topic.completed,
  };

  const existingIndex = (stats.topicSnapshots || []).findIndex(
    (item) => item.name.trim().toLowerCase() === normalizedTitle
  );

  if (existingIndex >= 0) {
    stats.topicSnapshots[existingIndex] = snapshot;
  } else {
    stats.topicSnapshots.push(snapshot);
  }

  await stats.save();
  return stats;
};

const adjustQuestionStatsForBoardDelete = async (topic) => {
  // Keep earned stats for fully completed topics.
  if (topic.completed) {
    return getStats();
  }

  const stats = await getStats();
  const normalizedTitle = String(topic.title).trim().toLowerCase();
  const totalQuestions = topic.questions?.length || 0;
  const completedQuestions = (topic.questions || []).filter((question) => question.completed).length;

  stats.totalQuestionsCount = Math.max(0, stats.totalQuestionsCount - totalQuestions);
  stats.questionDoneCount = Math.max(0, stats.questionDoneCount - completedQuestions);

  const existingIndex = (stats.topicSnapshots || []).findIndex(
    (item) => item.name.trim().toLowerCase() === normalizedTitle
  );

  if (existingIndex >= 0) {
    const existing = stats.topicSnapshots[existingIndex];
    stats.topicSnapshots[existingIndex] = {
      name: existing.name,
      totalQuestions: 0,
      completedQuestions: 0,
      completed: existing.completed,
    };
  }

  await stats.save();
  return stats;
};

const normalizeStatsLists = async () => {
  const stats = await getStats();
  const uniqueTopicNames = getUniqueNames(stats.allTopicNames || []);
  const uniqueCompletedNames = getUniqueNames(stats.completedTopicNames || []);

  if (
    uniqueTopicNames.length !== (stats.allTopicNames || []).length ||
    uniqueCompletedNames.length !== (stats.completedTopicNames || []).length
  ) {
    stats.allTopicNames = uniqueTopicNames;
    stats.completedTopicNames = uniqueCompletedNames;
    await stats.save();
  }

  return stats;
};

const normalizeSchedule = async (baseStartDate = null) => {
  const topics = await getOrderedTopics();
  if (topics.length === 0) return [];

  let nextStartDate = baseStartDate || topics[0].startDate || formatDateKey(new Date());

  for (let index = 0; index < topics.length; index += 1) {
    const topic = topics[index];
    topic.order = index + 1;
    topic.startDate = nextStartDate;
    topic.dueDate = getDueDate(nextStartDate, topic.dayCount);
    nextStartDate = addDays(topic.dueDate, 1);
    await topic.save();
  }

  return topics;
};

const buildProgress = (questions, existingCompletedAt = null) => {
  const safeQuestions = questions || [];
  const total = safeQuestions.length;
  const completedCount = safeQuestions.filter((question) => question.completed).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const completed = total > 0 && completedCount === total;

  return {
    percentage,
    completed,
    completedAt: completed ? (existingCompletedAt || new Date()) : null,
  };
};

exports.getAllTopics = async (req, res, next) => {
  try {
    const [topics, stats] = await Promise.all([
      normalizeSchedule(),
      normalizeStatsLists(),
    ]);
    res.json({ success: true, data: topics, meta: getStatsMeta(stats) });
  } catch (error) {
    next(error);
  }
};

exports.createTopic = async (req, res, next) => {
  try {
    const { title, dayCount, questions } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Topic title is required' });
    }

    const parsedDayCount = Number(dayCount);
    if (!Number.isInteger(parsedDayCount) || parsedDayCount < 1) {
      return res.status(400).json({ success: false, message: 'Valid day count is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    const normalizedTitle = String(title).trim();

    const cleanedQuestions = questions
      .map((question) => ({
        name: question?.name?.trim(),
        link: question?.link?.trim() || '',
        completed: false,
      }))
      .filter((question) => question.name);

    if (cleanedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid question is required' });
    }

    const seenQuestionNames = new Set();
    const hasDuplicateQuestion = cleanedQuestions.some((question) => {
      const normalizedQuestion = question.name.toLowerCase();
      if (seenQuestionNames.has(normalizedQuestion)) return true;
      seenQuestionNames.add(normalizedQuestion);
      return false;
    });

    if (hasDuplicateQuestion) {
      return res.status(400).json({ success: false, message: 'Duplicate problem names are not allowed' });
    }

    const stats = await normalizeStatsLists();
    const duplicateTargetTopic = (stats.allTopicNames || []).some(
      (topicName) => topicName.trim().toLowerCase() === normalizedTitle.toLowerCase()
    );

    if (duplicateTargetTopic) {
      return res.status(400).json({ success: false, message: 'This target topic already exists' });
    }

    const topics = await getOrderedTopics();
    const lastTopic = topics[topics.length - 1];
    const startDate = lastTopic ? addDays(lastTopic.dueDate, 1) : formatDateKey(new Date());
    const topic = await TargetTopic.create({
      order: topics.length + 1,
      title: normalizedTitle,
      dayCount: parsedDayCount,
      startDate,
      dueDate: getDueDate(startDate, parsedDayCount),
      questions: cleanedQuestions,
      ...buildProgress(cleanedQuestions),
    });

    const updatedStats = await TargetTopicStats.findOneAndUpdate(
      { key: 'global' },
      {
        $inc: {
          totalTopicsCount: 1,
          totalQuestionsCount: cleanedQuestions.length,
        },
        $push: {
        allTopicNames: normalizedTitle,
      },
      $setOnInsert: {
        key: 'global',
        questionDoneCount: 0,
        completedTopicsCount: 0,
        completedTopicNames: [],
        topicSnapshots: [],
      },
    },
    { upsert: true, new: true }
    );

    updatedStats.topicSnapshots = [
      ...(updatedStats.topicSnapshots || []).filter(
        (item) => item.name.trim().toLowerCase() !== normalizedTitle.toLowerCase()
      ),
      {
        name: normalizedTitle,
        totalQuestions: cleanedQuestions.length,
        completedQuestions: 0,
        completed: false,
      },
    ];
    await updatedStats.save();

    res.status(201).json({ success: true, data: topic, meta: getStatsMeta(updatedStats) });
  } catch (error) {
    next(error);
  }
};

exports.toggleQuestion = async (req, res, next) => {
  try {
    const { topicId, questionId } = req.params;
    const topic = await TargetTopic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Target topic not found' });
    }

    const question = topic.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const wasCompleted = question.completed;
    question.completed = !question.completed;
    const progress = buildProgress(topic.questions, topic.completedAt);
    topic.percentage = progress.percentage;
    topic.completed = progress.completed;
    topic.completedAt = progress.completedAt;

    if (!wasCompleted && question.completed) {
      await TargetTopicStats.findOneAndUpdate(
        { key: 'global' },
        { $inc: { questionDoneCount: 1 }, $setOnInsert: { key: 'global' } },
        { upsert: true, new: true }
      );
    }

    if (topic.completed) {
      const today = formatDateKey(new Date());
      await TargetTopicStats.findOneAndUpdate(
        { key: 'global' },
        {
          $inc: { completedTopicsCount: 1 },
          $push: { completedTopicNames: topic.title },
          $setOnInsert: {
            key: 'global',
            questionDoneCount: 0,
            totalTopicsCount: 0,
            totalQuestionsCount: 0,
            allTopicNames: [],
          },
        },
        { upsert: true, new: true }
      );
      await syncTopicSnapshot(topic);
      await TargetTopic.findByIdAndDelete(topicId);
      const nextStartDate = topic.order === 1 ? addDays(today, 1) : null;
      const stats = await getStats();
      const topics = await normalizeSchedule(nextStartDate);
      return res.json({
        success: true,
        data: topics,
        meta: getStatsMeta(stats),
        autoDeleted: true,
        message: 'Topic completed and removed automatically',
      });
    }

    await topic.save();
    const stats = await syncTopicSnapshot(topic);
    res.json({ success: true, data: topic, meta: getStatsMeta(stats), autoDeleted: false });
  } catch (error) {
    next(error);
  }
};

exports.deleteTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const today = formatDateKey(new Date());
    const topic = await TargetTopic.findByIdAndDelete(topicId);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Target topic not found' });
    }

    await adjustQuestionStatsForBoardDelete(topic);
    const [topics, stats] = await Promise.all([
      normalizeSchedule(topic.order === 1 ? today : null),
      normalizeStatsLists(),
    ]);
    res.json({ success: true, message: 'Target topic deleted', data: topics, meta: getStatsMeta(stats) });
  } catch (error) {
    next(error);
  }
};

exports.extendTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { extraDays } = req.body;
    const parsedExtraDays = Number(extraDays);

    if (!Number.isInteger(parsedExtraDays) || parsedExtraDays < 1) {
      return res.status(400).json({ success: false, message: 'Valid extra days are required' });
    }

    const topic = await TargetTopic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Target topic not found' });
    }

    topic.dayCount += parsedExtraDays;
    await topic.save();

    const [topics, stats] = await Promise.all([
      normalizeSchedule(),
      normalizeStatsLists(),
    ]);
    res.json({ success: true, data: topics, meta: getStatsMeta(stats) });
  } catch (error) {
    next(error);
  }
};

exports.resetTopics = async (req, res, next) => {
  try {
    await Promise.all([
      TargetTopic.deleteMany({}),
      TargetTopicStats.findOneAndUpdate(
        { key: 'global' },
        {
          questionDoneCount: 0,
          totalTopicsCount: 0,
          completedTopicsCount: 0,
          totalQuestionsCount: 0,
          allTopicNames: [],
          completedTopicNames: [],
          topicSnapshots: [],
          key: 'global',
        },
        { upsert: true, new: true }
      ),
    ]);

    res.json({
      success: true,
      message: 'All target topics cleared',
      data: [],
      meta: {
        questionDoneCount: 0,
        totalTopicsCount: 0,
        completedTopicsCount: 0,
        totalQuestionsCount: 0,
        allTopicNames: [],
        completedTopicNames: [],
        topicSnapshots: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.removeTopicName = async (req, res, next) => {
  try {
    const { name, listType } = req.body;
    if (!name || !listType) {
      return res.status(400).json({ success: false, message: 'Name and list type are required' });
    }

    const stats = await getStats();
    const normalizedName = String(name).trim().toLowerCase();
    const snapshot = (stats.topicSnapshots || []).find(
      (item) => item.name.trim().toLowerCase() === normalizedName
    );

    if (listType === 'topics') {
      stats.allTopicNames = (stats.allTopicNames || []).filter(
        (item) => item.trim().toLowerCase() !== normalizedName
      );
    }

    if (listType === 'completed') {
      stats.completedTopicNames = (stats.completedTopicNames || []).filter(
        (item) => item.trim().toLowerCase() !== normalizedName
      );
    }

    if (snapshot) {
      stats.topicSnapshots = (stats.topicSnapshots || []).filter(
        (item) => item.name.trim().toLowerCase() !== normalizedName
      );
    }

    await stats.save();
    res.json({ success: true, meta: getStatsMeta(stats) });
  } catch (error) {
    next(error);
  }
};
