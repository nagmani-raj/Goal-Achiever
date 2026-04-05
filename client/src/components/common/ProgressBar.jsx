import './ProgressBar.css';

const ProgressBar = ({ percentage = 0, size = 'md', showLabel = true, color = 'primary' }) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  const getColorClass = () => {
    if (color !== 'auto') return color;
    if (clampedPct >= 80) return 'success';
    if (clampedPct >= 60) return 'primary';
    if (clampedPct >= 40) return 'warning';
    return 'danger';
  };

  return (
    <div className={`progress-bar-container progress-${size}`}>
      <div className="progress-track">
        <div
          className={`progress-fill progress-${getColorClass()}`}
          style={{ width: `${clampedPct}%` }}
        >
          <div className="progress-shine" />
        </div>
      </div>
      {showLabel && (
        <span className={`progress-label progress-label-${getColorClass()}`}>
          {Math.round(clampedPct)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
