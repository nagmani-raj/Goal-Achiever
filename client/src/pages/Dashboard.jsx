import { useEffect, useState } from 'react';
import { dailyAPI, monthlyAPI, targetAPI } from '../services/api';
import { getToday, getCurrentMonth, formatDateDisplay, calcDailyPercentage } from '../utils/helpers';
import StreakPanel from '../components/streak/StreakPanel';
import ProgressBar from '../components/common/ProgressBar';
import './Dashboard.css';

const Dashboard = () => {
  const [todayData, setTodayData] = useState(null);
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [targetTopics, setTargetTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = getToday();
        const currentMonth = getCurrentMonth();

        const [dailyRes, monthlyRes, targetRes] = await Promise.all([
          dailyAPI.get(today),
          monthlyAPI.getByMonth(currentMonth),
          targetAPI.getAll(),
        ]);

        setTodayData(dailyRes.data.data);
        setMonthlyGoals(monthlyRes.data.data);
        setTargetTopics(targetRes.data.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const topics = todayData?.topics || [];
  const dailyPct = calcDailyPercentage(topics);
  const totalWorks = topics.reduce((sum, topic) => sum + topic.works.length, 0);
  const completedWorks = topics.reduce((sum, topic) => sum + topic.works.filter((work) => work.completed).length, 0);
  const monthlyCompleted = monthlyGoals.filter((goal) => goal.completed).length;
  const monthlyPct = monthlyGoals.length > 0 ? Math.round((monthlyCompleted / monthlyGoals.length) * 100) : 0;
  const totalTargetQuestions = targetTopics.reduce((sum, topic) => sum + topic.questions.length, 0);
  const completedTargetQuestions = targetTopics.reduce(
    (sum, topic) => sum + topic.questions.filter((question) => question.completed).length,
    0
  );
  const targetPct = totalTargetQuestions > 0
    ? Math.round((completedTargetQuestions / totalTargetQuestions) * 100)
    : 0;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" id="dashboard">
      <div className="dashboard-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="date-display">{formatDateDisplay(getToday())}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="stats-row stats-row-five">
            <div className="stat-card glass animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon stat-icon-tasks">T</div>
              <div className="stat-info">
                <div className="stat-value">{totalWorks}</div>
                <div className="stat-label">Today's Tasks</div>
              </div>
            </div>
            <div className="stat-card glass animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon stat-icon-done">C</div>
              <div className="stat-info">
                <div className="stat-value">{completedWorks}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card glass animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon stat-icon-topics">P</div>
              <div className="stat-info">
                <div className="stat-value">{topics.length}</div>
                <div className="stat-label">Topics</div>
              </div>
            </div>
            <div className="stat-card glass animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="stat-icon stat-icon-monthly">M</div>
              <div className="stat-info">
                <div className="stat-value">{monthlyGoals.length}</div>
                <div className="stat-label">Monthly Goals</div>
              </div>
            </div>
            <div className="stat-card glass animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="stat-icon stat-icon-target">TT</div>
              <div className="stat-info">
                <div className="stat-value">{targetTopics.length}</div>
                <div className="stat-label">Target Topics</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card glass animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <h3 className="card-title">Today's Progress</h3>
            <div className="card-progress">
              <div className="card-progress-header">
                <span>{completedWorks} / {totalWorks} tasks done</span>
                <span className="card-pct">{dailyPct}%</span>
              </div>
              <ProgressBar percentage={dailyPct} size="lg" color="auto" />
            </div>
            {topics.length > 0 && (
              <div className="card-topics">
                {topics.map((topic) => {
                  const topicCompleted = topic.works.filter((work) => work.completed).length;
                  const topicPct = topic.works.length > 0 ? Math.round((topicCompleted / topic.works.length) * 100) : 0;
                  return (
                    <div key={topic._id} className="card-topic-row">
                      <span className="card-topic-name">{topic.title}</span>
                      <div className="card-topic-progress">
                        <ProgressBar percentage={topicPct} size="sm" color="auto" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dashboard-card glass animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h3 className="card-title">Monthly Progress</h3>
            <div className="card-progress">
              <div className="card-progress-header">
                <span>{monthlyCompleted} / {monthlyGoals.length} goals</span>
                <span className="card-pct">{monthlyPct}%</span>
              </div>
              <ProgressBar percentage={monthlyPct} size="lg" color="auto" />
            </div>
          </div>

          <div className="dashboard-card glass animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <h3 className="card-title">Target Topics Progress</h3>
            <div className="card-progress">
              <div className="card-progress-header">
                <span>{completedTargetQuestions} / {totalTargetQuestions} checklist items</span>
                <span className="card-pct">{targetPct}%</span>
              </div>
              <ProgressBar percentage={targetPct} size="lg" color="auto" />
            </div>
            {targetTopics.length > 0 && (
              <div className="card-topics">
                {targetTopics.slice(0, 4).map((topic) => (
                  <div key={topic._id} className="card-topic-row">
                    <span className="card-topic-name">{topic.title}</span>
                    <div className="card-topic-progress">
                      <ProgressBar percentage={topic.percentage} size="sm" color="auto" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <StreakPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
