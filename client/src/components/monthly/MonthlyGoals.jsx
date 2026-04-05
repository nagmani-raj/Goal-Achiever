import { useState, useEffect } from 'react';
import { monthlyAPI } from '../../services/api';
import { getCurrentMonth, formatMonthDisplay } from '../../utils/helpers';
import { useNotifications } from '../../context/NotificationContext';
import { notifyDataChanged } from '../../utils/dataSync';
import ProgressBar from '../common/ProgressBar';
import './MonthlyGoals.css';

const MonthlyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [newTarget, setNewTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { showSuccess, showWarning } = useNotifications();

  const fetchGoals = async () => {
    try {
      const res = await monthlyAPI.getByMonth(currentMonth);
      setGoals(res.data.data);
      setErrorMessage('');
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    fetchGoals();
  }, [currentMonth]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTarget.trim()) return;
    const normalizedTarget = newTarget.trim().toLowerCase();
    const hasDuplicate = goals.some(goal => goal.target.trim().toLowerCase() === normalizedTarget);
    if (hasDuplicate) {
      const message = 'This monthly goal already exists';
      setErrorMessage(message);
      showWarning(message);
      return;
    }
    setAdding(true);
    setErrorMessage('');
    try {
      await monthlyAPI.create({ month: currentMonth, target: newTarget.trim() });
      setNewTarget('');
      await fetchGoals();
      notifyDataChanged();
      showSuccess('Successfully added.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to add monthly goal';
      setErrorMessage(message);
      showWarning('Invalid input, check again.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await monthlyAPI.toggle(id);
      await fetchGoals();
    } catch (err) {
      console.error('Error toggling goal:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await monthlyAPI.delete(id);
      setErrorMessage('');
      await fetchGoals();
      notifyDataChanged();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const percentage = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const changeMonth = (offset) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + offset, 1);
    const newYear = d.getFullYear();
    const newMonth = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  return (
    <div className="monthly-goals" id="monthly-goals">
      <div className="monthly-header">
        <h2 className="page-title">📅 Monthly Goals</h2>
        <div className="month-selector">
          <button className="month-arrow" onClick={() => changeMonth(-1)} id="prev-month">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="month-display">{formatMonthDisplay(currentMonth)}</span>
          <button className="month-arrow" onClick={() => changeMonth(1)} id="next-month">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="monthly-progress glass">
        <div className="progress-info">
          <span className="progress-text">{completedCount} / {goals.length} completed</span>
        </div>
        <ProgressBar percentage={percentage} size="lg" color="auto" />
      </div>

      <form className="add-goal-form glass" onSubmit={handleAdd} id="add-monthly-goal-form">
        <input
          type="text"
          placeholder="Write your monthly target..."
          value={newTarget}
          onChange={(e) => {
            setNewTarget(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          id="monthly-goal-input"
        />
        <button type="submit" className="btn-add" disabled={adding || !newTarget.trim()} id="add-monthly-goal-btn">
          {adding ? (
            <span className="btn-loading">⏳</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Goal
            </>
          )}
        </button>
      </form>
      {errorMessage && <div className="form-error-text">{errorMessage}</div>}

      <div className="goals-list">
        {loading ? (
          <div className="loading-text">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">🎯</div>
            <p>No goals set for {formatMonthDisplay(currentMonth)}</p>
            <p className="empty-sub">Add your first monthly goal above!</p>
          </div>
        ) : (
          goals.map((goal, index) => (
            <div
              key={goal._id}
              className={`goal-card glass glass-hover animate-slideInUp ${goal.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                className={`goal-check ${goal.completed ? 'checked' : ''}`}
                onClick={() => handleToggle(goal._id)}
                id={`toggle-goal-${goal._id}`}
              >
                {goal.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className={`goal-text ${goal.completed ? 'goal-done' : ''}`}>
                {goal.target}
              </span>
              <button className="goal-delete" onClick={() => handleDelete(goal._id)} id={`delete-goal-${goal._id}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyGoals;
