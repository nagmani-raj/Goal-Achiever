import DailyGoals from '../components/daily/DailyGoals';
import StreakPanel from '../components/streak/StreakPanel';
import './DailyPage.css';

const DailyPage = () => {
  return (
    <div className="daily-page" id="daily-page">
      <div className="daily-page-main">
        <DailyGoals />
      </div>
      <div className="daily-page-sidebar">
        <StreakPanel />
      </div>
    </div>
  );
};

export default DailyPage;
