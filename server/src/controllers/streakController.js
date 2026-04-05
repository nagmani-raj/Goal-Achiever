const Streak = require('../models/Streak');
const DailyGoal = require('../models/DailyGoal');

const parseDateKey = (dateStr) => new Date(`${dateStr}T00:00:00`);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPreviousDateKey = (dateStr) => {
  const date = parseDateKey(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
};

// Calculate daily percentage and update streak
exports.calculateStreak = async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Get daily goals for the date
    const daily = await DailyGoal.findOne({ date });
    let percentage = 0;

    if (daily && daily.topics.length > 0) {
      let topicPercentages = [];
      for (const topic of daily.topics) {
        if (topic.works.length > 0) {
          const completedWorks = topic.works.filter(w => w.completed).length;
          const topicPct = (completedWorks / topic.works.length) * 100;
          topicPercentages.push(topicPct);
        } else {
          topicPercentages.push(0);
        }
      }
      percentage = topicPercentages.length > 0
        ? topicPercentages.reduce((a, b) => a + b, 0) / topicPercentages.length
        : 0;
    }

    percentage = Math.round(percentage * 100) / 100;

    const existingStreak = await Streak.findOne({ date });
    const yesterdayStreak = await Streak.findOne({ date: getPreviousDateKey(date) });
    const alreadyQualified = existingStreak?.qualified || false;
    const qualifiedToday = alreadyQualified || percentage >= 60;

    let currentStreak = existingStreak?.currentStreak || 0;

    // Once a day crosses 60%, keep that day's streak locked even if tasks change later.
    if (qualifiedToday && !alreadyQualified) {
      currentStreak = (yesterdayStreak?.currentStreak || 0) + 1;
    }

    // Get longest streak from all records
    const maxStreakRecord = await Streak.findOne().sort({ longestStreak: -1 });
    const longestStreak = Math.max(
      maxStreakRecord?.longestStreak || 0,
      currentStreak
    );

    // Update or create today's streak. Qualification is sticky for the same date.
    const streak = await Streak.findOneAndUpdate(
      { date },
      {
        percentage,
        qualified: qualifiedToday,
        qualifiedAt: qualifiedToday
          ? (existingStreak?.qualifiedAt || new Date())
          : null,
        currentStreak,
        longestStreak,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: streak });
  } catch (error) {
    next(error);
  }
};

// Get current streak info
exports.getStreak = async (req, res, next) => {
  try {
    const today = formatDateKey(new Date());
    const yesterday = getPreviousDateKey(today);
    const [todayStreak, yesterdayStreak, maxStreakRecord] = await Promise.all([
      Streak.findOne({ date: today }),
      Streak.findOne({ date: yesterday }),
      Streak.findOne().sort({ longestStreak: -1 }),
    ]);

    let currentStreak = 0;

    if (todayStreak?.qualified) {
      currentStreak = todayStreak.currentStreak;
    } else if (yesterdayStreak?.qualified) {
      // Carry forward yesterday's earned streak throughout today until today's result is decided.
      currentStreak = yesterdayStreak.currentStreak;
    }


    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: maxStreakRecord?.longestStreak || 0,
        todayPercentage: todayStreak?.percentage || 0,
        todayQualified: todayStreak?.qualified || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get streak history (last 30 days)
exports.getStreakHistory = async (req, res, next) => {
  try {
    const history = await Streak.find()
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
