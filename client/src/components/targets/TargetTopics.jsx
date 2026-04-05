import { useEffect, useMemo, useState } from 'react';
import { targetAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import ProgressBar from '../common/ProgressBar';
import './TargetTopics.css';

const emptyQuestion = { name: '', link: '' };

const formatDisplayDate = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getTopicTiming = (topic) => {
  const today = getToday();
  const start = new Date(`${topic.startDate}T00:00:00`);
  const due = new Date(`${topic.dueDate}T00:00:00`);
  const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  const startsIn = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.min(topic.dayCount, Math.max(1, elapsedDays));
  const isFuture = startsIn > 0;
  const isOverdue = !topic.completed && !isFuture && daysLeft < 0;
  const isActive = !topic.completed && !isFuture;

  return {
    currentDay,
    daysLeft,
    startsIn,
    isFuture,
    isOverdue,
    isActive,
  };
};

const TargetTopics = () => {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({
    questionDoneCount: 0,
    totalTopicsCount: 0,
    completedTopicsCount: 0,
    totalQuestionsCount: 0,
    allTopicNames: [],
    completedTopicNames: [],
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [extendingTopicId, setExtendingTopicId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [extendInputs, setExtendInputs] = useState({});
  const [topicNameError, setTopicNameError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [form, setForm] = useState({
    title: '',
    dayCount: '',
    questions: [{ ...emptyQuestion }],
  });
  const { showSuccess, showWarning } = useNotifications();

  const fetchTopics = async () => {
    try {
      const res = await targetAPI.getAll();
      const list = res.data.data || [];
      setStats({
        questionDoneCount: res.data.meta?.questionDoneCount || 0,
        totalTopicsCount: res.data.meta?.totalTopicsCount || 0,
        completedTopicsCount: res.data.meta?.completedTopicsCount || 0,
        totalQuestionsCount: res.data.meta?.totalQuestionsCount || 0,
        allTopicNames: res.data.meta?.allTopicNames || [],
        completedTopicNames: res.data.meta?.completedTopicNames || [],
      });
      setTopics(list);
      setTopicNameError('');
      setQuestionError('');
      setExpandedId((prev) => prev || list[0]?._id || null);
    } catch (error) {
      console.error('Error fetching target topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const activeTopicId = useMemo(() => {
    const firstOpenTopic = topics.find((topic) => !topic.completed);
    return firstOpenTopic?._id || null;
  }, [topics]);

  const overview = useMemo(() => {
    const overallPercentage = stats.totalQuestionsCount > 0
      ? Math.min(100, Math.round((stats.questionDoneCount / stats.totalQuestionsCount) * 100))
      : 0;

    return {
      totalTopics: stats.allTopicNames.length,
      completedTopics: stats.completedTopicNames.length,
      totalQuestions: stats.totalQuestionsCount,
      completedQuestions: stats.questionDoneCount,
      overallPercentage,
    };
  }, [stats]);

  const updateQuestionField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, [field]: value } : question
      )),
    }));
  };

  const addQuestionRow = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...emptyQuestion }],
    }));
  };

  const removeQuestionRow = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      dayCount: '',
      questions: [{ ...emptyQuestion }],
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const cleanedQuestions = form.questions.filter((question) => question.name.trim());
    if (!form.title.trim() || !form.dayCount || cleanedQuestions.length === 0) {
      showWarning('Please fill in the required target topic details.');
      return;
    }
    const normalizedTitle = form.title.trim().toLowerCase();
    const hasDuplicate = (stats.allTopicNames || []).some((name) => name.trim().toLowerCase() === normalizedTitle);
    if (hasDuplicate) {
      const message = 'This target topic already exists';
      setTopicNameError(message);
      setQuestionError('');
      showWarning(message);
      return;
    }

    const questionNames = cleanedQuestions.map((question) => question.name.trim().toLowerCase());
    const hasDuplicateQuestion = new Set(questionNames).size !== questionNames.length;
    if (hasDuplicateQuestion) {
      const message = 'This problem name already exists in the list';
      setQuestionError(message);
      setTopicNameError('');
      showWarning(message);
      return;
    }

    setAdding(true);
    setTopicNameError('');
    setQuestionError('');
    try {
      await targetAPI.create({
        title: form.title.trim(),
        dayCount: Number(form.dayCount),
        questions: cleanedQuestions,
      });
      resetForm();
      await fetchTopics();
      showSuccess('Successfully added.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to add target topic';
      if (message.toLowerCase().includes('problem')) {
        setQuestionError(message);
        setTopicNameError('');
      } else {
        setTopicNameError(message);
        setQuestionError('');
      }
      showWarning('Invalid input, check again.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleQuestion = async (topicId, questionId) => {
    try {
      await targetAPI.toggleQuestion(topicId, questionId);
      await fetchTopics();
    } catch (error) {
      console.error('Error toggling question:', error);
    }
  };

  const handleExtendTopic = async (topicId) => {
    const extraDays = Number(extendInputs[topicId]);
    if (!Number.isInteger(extraDays) || extraDays < 1) {
      showWarning('Please enter a valid number of extra days.');
      return;
    }

    setExtendingTopicId(topicId);
    try {
      await targetAPI.extend(topicId, extraDays);
      setExtendInputs((prev) => ({ ...prev, [topicId]: '' }));
      await fetchTopics();
    } catch (error) {
      console.error('Error extending target topic:', error);
    } finally {
      setExtendingTopicId(null);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await targetAPI.delete(topicId);
      setTopicNameError('');
      setQuestionError('');
      setExpandedId((prev) => (prev === topicId ? null : prev));
      await fetchTopics();
    } catch (error) {
      console.error('Error deleting target topic:', error);
    }
  };

  const handleRefreshReset = async () => {
    setResetting(true);
    try {
      await targetAPI.reset();
      setTopics([]);
      setStats({
        questionDoneCount: 0,
        totalTopicsCount: 0,
        completedTopicsCount: 0,
        totalQuestionsCount: 0,
        allTopicNames: [],
        completedTopicNames: [],
      });
      setExpandedId(null);
      setActiveSummary(null);
      setExtendInputs({});
      setTopicNameError('');
      setQuestionError('');
      resetForm();
      await fetchTopics();
    } catch (error) {
      console.error('Error resetting target topics:', error);
    } finally {
      setResetting(false);
    }
  };

  const handleRemoveSavedName = async (event, name, listType) => {
    event.stopPropagation();
    try {
      const matchingTopic = topics.find((topic) => topic.title.trim().toLowerCase() === String(name).trim().toLowerCase());

      if (matchingTopic) {
        await targetAPI.delete(matchingTopic._id);
      }

      await targetAPI.removeName(name, listType);

      await fetchTopics();
    } catch (error) {
      console.error('Error removing saved topic name:', error);
    }
  };

  return (
    <div className="target-topics-page" id="target-topics-page">
      <div className="target-header">
        <div>
          <h2 className="page-title">Target Topics</h2>
          <p className="date-display">Har next topic previous topic ke end ke baad start hoga.</p>
        </div>
        <button className="target-refresh-btn" onClick={handleRefreshReset} disabled={resetting}>
          {resetting ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="target-layout">
        <section className="target-main">
          <div className="target-overview">
            <button
              className={`target-stat target-stat-button glass ${activeSummary === 'topics' ? 'target-stat-open' : ''}`}
              onClick={() => setActiveSummary((prev) => (prev === 'topics' ? null : 'topics'))}
            >
              <div className="target-stat-head">
                <span className="target-stat-label">Topics</span>
                <span className={`target-stat-arrow ${activeSummary === 'topics' ? 'open' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
              <strong className="target-stat-value">{overview.totalTopics}</strong>
              {activeSummary === 'topics' && (
                <div className="target-stat-dropdown" onClick={(event) => event.stopPropagation()}>
                  <div className="target-stat-dropdown-list">
                    {stats.allTopicNames.length === 0 ? (
                      <div className="target-stat-dropdown-empty">No topics added yet</div>
                    ) : (
                      stats.allTopicNames.map((name, index) => (
                        <button
                          key={`topics-${name}-${index}`}
                          className="target-stat-dropdown-item"
                          onClick={() => {
                            const foundTopic = topics.find((topic) => topic.title === name);
                            if (foundTopic) {
                              setExpandedId((prev) => (prev === foundTopic._id ? null : foundTopic._id));
                            }
                          }}
                        >
                          <span className="target-stat-dropdown-text">{name}</span>
                          <button
                            className="target-stat-dropdown-delete"
                            onClick={(event) => handleRemoveSavedName(event, name, 'topics')}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </button>
            <button
              className={`target-stat target-stat-button glass ${activeSummary === 'completed' ? 'target-stat-open' : ''}`}
              onClick={() => setActiveSummary((prev) => (prev === 'completed' ? null : 'completed'))}
            >
              <div className="target-stat-head">
                <span className="target-stat-label">Completed</span>
                <span className={`target-stat-arrow ${activeSummary === 'completed' ? 'open' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
              <strong className="target-stat-value">{overview.completedTopics}</strong>
              {activeSummary === 'completed' && (
                <div className="target-stat-dropdown" onClick={(event) => event.stopPropagation()}>
                  <div className="target-stat-dropdown-list">
                    {stats.completedTopicNames.length === 0 ? (
                      <div className="target-stat-dropdown-empty">No completed topic yet</div>
                    ) : (
                      stats.completedTopicNames.map((name, index) => (
                        <button
                          key={`completed-${name}-${index}`}
                          className="target-stat-dropdown-item completed"
                          onClick={() => {
                            const foundTopic = topics.find((topic) => topic.title === name);
                            if (foundTopic) {
                              setExpandedId((prev) => (prev === foundTopic._id ? null : foundTopic._id));
                            }
                          }}
                        >
                          <span className="target-stat-dropdown-text completed">{name}</span>
                          <button
                            className="target-stat-dropdown-delete"
                            onClick={(event) => handleRemoveSavedName(event, name, 'completed')}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </button>
            <div className="target-stat glass">
              <span className="target-stat-label">Questions Done</span>
              <strong className="target-stat-value">{overview.completedQuestions}/{overview.totalQuestions}</strong>
            </div>
            <div className="target-stat glass">
              <span className="target-stat-label">Overall Progress</span>
              <strong className="target-stat-value">{overview.overallPercentage}%</strong>
            </div>
          </div>

          <div className="target-board glass">
            {loading ? (
              <div className="loading-text">Loading target topics...</div>
            ) : topics.length === 0 ? (
              <div className="target-empty">
                <div className="target-empty-icon">[]</div>
                <p>No target topics added yet</p>
                <p className="target-empty-sub">Right side se topic aur question list add karke start kijiye.</p>
              </div>
            ) : (
              topics.map((topic, index) => {
                const isExpanded = expandedId === topic._id;
                const completedCount = topic.questions.filter((question) => question.completed).length;
                const timing = getTopicTiming(topic);
                const isCurrentTopic = activeTopicId === topic._id;

                return (
                  <div
                    key={topic._id}
                    className={`topic-accordion ${isExpanded ? 'expanded' : ''} animate-slideInUp`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <button
                      className="topic-accordion-header"
                      onClick={() => setExpandedId(isExpanded ? null : topic._id)}
                    >
                      <span className={`accordion-arrow ${isExpanded ? 'open' : ''}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                      <div className="accordion-title-wrap">
                        <span className="accordion-title">{topic.title}</span>
                        <span className="accordion-day-badge">Day {topic.dayCount}</span>
                        {isCurrentTopic && <span className="accordion-live-badge">Current Topic</span>}
                      </div>
                      <div className="accordion-meta">
                        <span className={`accordion-status ${topic.completed ? 'done' : ''}`}>
                          {completedCount}/{topic.questions.length}
                        </span>
                        <span className="accordion-percentage">{topic.percentage}%</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="topic-accordion-body">
                        <div className="topic-summary-row">
                          <div className="topic-summary-pill">
                            <span>Start</span>
                            <strong>{formatDisplayDate(topic.startDate)}</strong>
                          </div>
                          <div className="topic-summary-pill">
                            <span>Due</span>
                            <strong>{formatDisplayDate(topic.dueDate)}</strong>
                          </div>
                          <div className="topic-summary-pill">
                            <span>Day Status</span>
                            <strong>
                              {timing.isFuture
                                ? `Starts in ${timing.startsIn} day`
                                : `Day ${timing.currentDay} of ${topic.dayCount}`}
                            </strong>
                          </div>
                          <div className="topic-summary-pill">
                            <span>Timeline</span>
                            <strong>
                              {topic.completed
                                ? 'Completed'
                                : timing.isFuture
                                  ? `Starts in ${timing.startsIn} day`
                                  : timing.daysLeft >= 0
                                    ? `${timing.daysLeft} day left`
                                    : `${Math.abs(timing.daysLeft)} day over`}
                            </strong>
                          </div>
                        </div>

                        <div className="topic-progress-box">
                          <div className="topic-progress-header">
                            <span>Checklist progress auto-updates on every check</span>
                            <strong>{topic.percentage}%</strong>
                          </div>
                          <ProgressBar percentage={topic.percentage} size="lg" color="auto" />
                        </div>

                        {timing.isOverdue && isCurrentTopic && !topic.completed && (
                          <div className="topic-extension-box">
                            <div className="topic-extension-copy">
                              <strong>Time khatam ho gaya hai.</strong>
                              <span>Is topic ke liye kitne extra day chahiye? Save karte hi next sab topics ki dates bhi shift ho jayengi.</span>
                            </div>
                            <div className="topic-extension-actions">
                              <input
                                type="number"
                                min="1"
                                placeholder="Extra days"
                                value={extendInputs[topic._id] || ''}
                                onChange={(event) => setExtendInputs((prev) => ({ ...prev, [topic._id]: event.target.value }))}
                              />
                              <button
                                className="topic-extend-btn"
                                onClick={() => handleExtendTopic(topic._id)}
                                disabled={extendingTopicId === topic._id || !extendInputs[topic._id]}
                              >
                                {extendingTopicId === topic._id ? 'Saving...' : 'Add Days'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="question-table">
                          <div className="question-table-head">
                            <span>Status</span>
                            <span>Problem</span>
                            <span>Link</span>
                          </div>
                          {topic.questions.map((question) => (
                            <div key={question._id} className="question-row">
                              <button
                                className={`question-check ${question.completed ? 'checked' : ''}`}
                                onClick={() => handleToggleQuestion(topic._id, question._id)}
                              >
                                {question.completed && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                              <span className={`question-name ${question.completed ? 'completed' : ''}`}>{question.name}</span>
                              {question.link ? (
                                <a className="question-link" href={question.link} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              ) : (
                                <span className="question-link muted">No link</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="topic-footer-row">
                          <span className={`topic-complete-tag ${topic.completed ? 'done' : ''}`}>
                            {topic.completed ? 'Completed within checklist' : 'Complete all questions to finish topic'}
                          </span>
                          <button className="topic-remove-btn" onClick={() => handleDeleteTopic(topic._id)}>
                            Delete Topic
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="target-sidebar">
          <form className="target-form glass" onSubmit={handleCreate} id="target-topic-form">
            <div className="target-form-header">
              <h3>Add Target Topic</h3>
              <p>New topic automatically previous topic ke end-date ke next day se start hoga.</p>
            </div>

            <div className="target-form-group">
              <label htmlFor="target-topic-title">Topic</label>
              <input
                id="target-topic-title"
                type="text"
                placeholder="e.g. Arrays"
                value={form.title}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, title: event.target.value }));
                  if (topicNameError) setTopicNameError('');
                }}
              />
            </div>
            {topicNameError && <div className="form-error-text">{topicNameError}</div>}

            <div className="target-form-group">
              <label htmlFor="target-topic-days">Day</label>
              <input
                id="target-topic-days"
                type="number"
                min="1"
                placeholder="How many days?"
                value={form.dayCount}
                onChange={(event) => setForm((prev) => ({ ...prev, dayCount: event.target.value }))}
              />
            </div>

            <div className="target-question-builder">
              <div className="target-builder-head">
                <h4>Question List</h4>
                <button type="button" className="builder-add-btn" onClick={addQuestionRow}>
                  Add Question
                </button>
              </div>

              {form.questions.map((question, index) => (
                <div key={`question-form-${index}`} className="builder-question-card">
                  <div className="builder-question-top">
                    <span className="builder-question-index">Q{index + 1}</span>
                    {form.questions.length > 1 && (
                      <button type="button" className="builder-remove-btn" onClick={() => removeQuestionRow(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Question name"
                    value={question.name}
                    onChange={(event) => {
                      updateQuestionField(index, 'name', event.target.value);
                      if (questionError) setQuestionError('');
                    }}
                  />
                  <input
                    type="url"
                    placeholder="Problem link"
                    value={question.link}
                    onChange={(event) => updateQuestionField(index, 'link', event.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="target-submit-btn"
              disabled={adding || !form.title.trim() || !form.dayCount || !form.questions.some((question) => question.name.trim())}
            >
              {adding ? 'Saving...' : 'Create Target Topic'}
            </button>
            {questionError && <div className="form-error-text">{questionError}</div>}
          </form>
        </aside>
      </div>
    </div>
  );
};

export default TargetTopics;
