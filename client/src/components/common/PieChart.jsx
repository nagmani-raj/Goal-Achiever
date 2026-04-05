import './PieChart.css';

const PieChart = ({ completed = 0, total = 0, size = 140 }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pending = total - completed;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const completedArc = (percentage / 100) * circumference;

  return (
    <div className="pie-chart-container" id="performance-chart">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="pie-chart-svg"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(225, 112, 85, 0.3)"
          strokeWidth="12"
        />
        {/* Completed arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#pieGradient)"
          strokeWidth="12"
          strokeDasharray={`${completedArc} ${circumference - completedArc}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          className="pie-chart-arc"
        />
        {/* Percentage text */}
        <text x="60" y="55" textAnchor="middle" className="pie-chart-percent">
          {percentage}%
        </text>
        <text x="60" y="72" textAnchor="middle" className="pie-chart-sub">
          Done
        </text>
        <defs>
          <linearGradient id="pieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#00cec9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pie-chart-legend">
        <div className="legend-item">
          <span className="legend-dot legend-completed" />
          <span className="legend-text">Done: {completed}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-pending" />
          <span className="legend-text">Left: {pending}</span>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
