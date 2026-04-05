import { useState, useEffect } from 'react';
import PieChart from '../common/PieChart';
import { streakAPI, dailyAPI } from '../../services/api';
import { getToday, calcDailyPercentage } from '../../utils/helpers';
import './StreakPanel.css';

const StreakPanel = () => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    todayPercentage: 0,
  });
  const [dailyStats, setDailyStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const today = getToday();

      // Calculate streak first
      await streakAPI.calculate(today);

      // Fetch streak info
      const streakRes = await streakAPI.get();
      setStreakData(streakRes.data.data);

      // Fetch today's daily goals for pie chart
      const dailyRes = await dailyAPI.get(today);
      const topics = dailyRes.data.data?.topics || [];
      let completed = 0;
      let total = 0;
      topics.forEach(t => {
        t.works.forEach(w => {
          total++;
          if (w.completed) completed++;
        });
      });
      setDailyStats({ completed, total });
    } catch (err) {
      console.error('Streak fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="streak-panel glass animate-fadeIn">
        <div className="streak-loading">Loading streak data...</div>
      </div>
    );
  }

  return (
    <div className="streak-panel glass animate-fadeIn" id="streak-panel">
      <h3 className="streak-title">🔥 Streak Tracker</h3>

      <div className="streak-boxes">
        <div className="streak-box current-streak">
          <div className="streak-number">{streakData.currentStreak}</div>
          <div className="streak-label">Current Streak</div>
          <div className="streak-fire-icon">🔥</div>
        </div>

        <div className="streak-box longest-streak">
          <div className="streak-number">{streakData.longestStreak}</div>
          <div className="streak-label">Longest Streak</div>
          <div className="streak-fire-icon">🏆</div>
        </div>
      </div>

      <div className="streak-today">
        <div className="today-percentage">
          <span className="today-label">Today's Progress</span>
          <span className={`today-value ${streakData.todayPercentage >= 60 ? 'qualified' : 'not-qualified'}`}>
            {Math.round(streakData.todayPercentage)}%
          </span>
        </div>
        <div className="today-threshold">
          {streakData.todayPercentage >= 60 ? (
            <span className="threshold-pass">✅ Streak qualified! (≥60%)</span>
          ) : (
            <span className="threshold-fail">⚡ Need 60% to build streak</span>
          )}
        </div>
      </div>

      <div className="performance-section">
        <h4 className="performance-title">📊 Performance</h4>
        <PieChart completed={dailyStats.completed} total={dailyStats.total} size={150} />
      </div>
    </div>
  );
};

export default StreakPanel;
