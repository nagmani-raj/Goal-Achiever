import { useState, useEffect } from 'react';
import { dailyAPI, streakAPI } from '../../services/api';
import { getToday, formatDateDisplay, calcTopicPercentage, calcDailyPercentage } from '../../utils/helpers';
import { useNotifications } from '../../context/NotificationContext';
import ProgressBar from '../common/ProgressBar';
import './DailyGoals.css';

const DailyGoals = () => {
  const [dailyData, setDailyData] = useState(null);
  const [date] = useState(getToday());
  const [newTopic, setNewTopic] = useState('');
  const [workInputs, setWorkInputs] = useState({});
  const [addingTopic, setAddingTopic] = useState(false);
  const [addingWork, setAddingWork] = useState({});
  const [loading, setLoading] = useState(true);
  const [topicError, setTopicError] = useState('');
  const { showSuccess, showWarning } = useNotifications();

  const fetchDaily = async () => {
    try {
      const res = await dailyAPI.get(date);
      setDailyData(res.data.data);
      setTopicError('');
      // Recalculate streak
      await streakAPI.calculate(date);
    } catch (err) {
      console.error('Error fetching daily:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [date]);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    const normalizedTopic = newTopic.trim().toLowerCase();
    const hasDuplicate = (dailyData?.topics || []).some(topic => topic.title.trim().toLowerCase() === normalizedTopic);
    if (hasDuplicate) {
      const message = 'This daily topic already exists';
      setTopicError(message);
      showWarning(message);
      return;
    }
    setAddingTopic(true);
    setTopicError('');
    try {
      await dailyAPI.addTopic(date, { title: newTopic.trim() });
      setNewTopic('');
      await fetchDaily();
      showSuccess('Successfully added.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to add daily topic';
      setTopicError(message);
      showWarning('Invalid input, check again.');
    } finally {
      setAddingTopic(false);
    }
  };

  const handleAddWork = async (e, topicId) => {
    e.preventDefault();
    const text = workInputs[topicId];
    if (!text?.trim()) return;
    setAddingWork(prev => ({ ...prev, [topicId]: true }));
    try {
      await dailyAPI.addWork(date, topicId, { text: text.trim() });
      setWorkInputs(prev => ({ ...prev, [topicId]: '' }));
      await fetchDaily();
      showSuccess('Successfully added.');
    } catch (err) {
      console.error('Error adding work:', err);
      showWarning('Invalid input, check again.');
    } finally {
      setAddingWork(prev => ({ ...prev, [topicId]: false }));
    }
  };

  const handleToggleWork = async (topicId, workId) => {
    try {
      await dailyAPI.toggleWork(date, topicId, workId);
      await fetchDaily();
    } catch (err) {
      console.error('Error toggling work:', err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await dailyAPI.deleteTopic(date, topicId);
      setTopicError('');
      await fetchDaily();
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
  };

  const handleDeleteWork = async (topicId, workId) => {
    try {
      await dailyAPI.deleteWork(date, topicId, workId);
      await fetchDaily();
    } catch (err) {
      console.error('Error deleting work:', err);
    }
  };

  const topics = dailyData?.topics || [];
  const dailyPercentage = calcDailyPercentage(topics);

  if (loading) {
    return (
      <div className="daily-goals">
        <div className="loading-text">Loading today's goals...</div>
      </div>
    );
  }

  return (
    <div className="daily-goals" id="daily-goals">
      <div className="daily-header">
        <div>
          <h2 className="page-title">📋 Daily Goals</h2>
          <p className="date-display">{formatDateDisplay(date)}</p>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="daily-progress glass">
        <div className="daily-progress-header">
          <span className="daily-progress-label">Today's Overall Progress</span>
          <span className={`daily-progress-value ${dailyPercentage >= 60 ? 'streak-qualified' : ''}`}>
            {dailyPercentage}%
          </span>
        </div>
        <ProgressBar percentage={dailyPercentage} size="lg" color="auto" />
        <div className="daily-streak-hint">
          {dailyPercentage >= 60 ? (
            <span className="hint-pass">🔥 Streak will be maintained!</span>
          ) : (
            <span className="hint-warn">⚡ Reach 60% to continue your streak</span>
          )}
        </div>
      </div>

      {/* Add Topic Button */}
      <form className="add-topic-form glass" onSubmit={handleAddTopic} id="add-topic-form">
        <div className="add-topic-icon">📌</div>
        <input
          type="text"
          placeholder="Add new topic / title..."
          value={newTopic}
          onChange={(e) => {
            setNewTopic(e.target.value);
            if (topicError) setTopicError('');
          }}
          id="topic-input"
        />
        <button type="submit" className="btn-add-topic" disabled={addingTopic || !newTopic.trim()} id="add-topic-btn">
          {addingTopic ? '⏳' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Topic
            </>
          )}
        </button>
      </form>
      {topicError && <div className="form-error-text">{topicError}</div>}

      {/* Topics List */}
      <div className="topics-list">
        {topics.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">📝</div>
            <p>No topics added today</p>
            <p className="empty-sub">Add your first topic and start listing your work!</p>
          </div>
        ) : (
          topics.map((topic, idx) => {
            const topicPct = calcTopicPercentage(topic.works);
            return (
              <div
                key={topic._id}
                className="topic-card glass animate-slideInUp"
                style={{ animationDelay: `${idx * 0.08}s` }}
                id={`topic-${topic._id}`}
              >
                <div className="topic-header">
                  <div className="topic-title-row">
                    <span className="topic-number">{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="topic-title">{topic.title}</h3>
                    <span className={`topic-pct ${topicPct >= 80 ? 'pct-high' : topicPct >= 60 ? 'pct-mid' : topicPct >= 40 ? 'pct-low' : 'pct-very-low'}`}>
                      {topicPct}%
                    </span>
                    <button className="topic-delete-btn" onClick={() => handleDeleteTopic(topic._id)} id={`delete-topic-${topic._id}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <ProgressBar percentage={topicPct} size="sm" color="auto" showLabel={false} />
                </div>

                {/* Work Items */}
                <div className="work-list">
                  {topic.works.map((work, wIdx) => (
                    <div key={work._id} className={`work-item ${work.completed ? 'work-completed' : ''}`}>
                      <button
                        className={`work-check ${work.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleWork(topic._id, work._id)}
                        id={`toggle-work-${work._id}`}
                      >
                        {work.completed && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <span className={`work-text ${work.completed ? 'work-done' : ''}`}>{work.text}</span>
                      <button className="work-delete" onClick={() => handleDeleteWork(topic._id, work._id)} id={`delete-work-${work._id}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Work Button (Second Add Button) */}
                <form className="add-work-form" onSubmit={(e) => handleAddWork(e, topic._id)} id={`add-work-form-${topic._id}`}>
                  <input
                    type="text"
                    placeholder="Add work item..."
                    value={workInputs[topic._id] || ''}
                    onChange={(e) => setWorkInputs(prev => ({ ...prev, [topic._id]: e.target.value }))}
                    id={`work-input-${topic._id}`}
                  />
                  <button
                    type="submit"
                    className="btn-add-work"
                    disabled={addingWork[topic._id] || !workInputs[topic._id]?.trim()}
                    id={`add-work-btn-${topic._id}`}
                  >
                    {addingWork[topic._id] ? '⏳' : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Work
                      </>
                    )}
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyGoals;
