// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get current month as YYYY-MM
export const getCurrentMonth = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Format month for display
export const formatMonthDisplay = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Calculate topic percentage
export const calcTopicPercentage = (works) => {
  if (!works || works.length === 0) return 0;
  const completed = works.filter(w => w.completed).length;
  return Math.round((completed / works.length) * 100);
};

// Calculate daily percentage (average of all topic percentages)
export const calcDailyPercentage = (topics) => {
  if (!topics || topics.length === 0) return 0;
  const percentages = topics.map(t => calcTopicPercentage(t.works));
  const sum = percentages.reduce((a, b) => a + b, 0);
  return Math.round(sum / percentages.length);
};

// Get today's date formatted
export const getToday = () => formatDate(new Date());

// Format date for display
export const formatDateDisplay = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
