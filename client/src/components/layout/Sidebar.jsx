import { NavLink } from 'react-router-dom';
import { useStoredItems } from '../../hooks/useStoredItems';
import './Sidebar.css';

const Sidebar = () => {
  const { items } = useStoredItems();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#grad)" />
            <path d="M9 16L14 21L23 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6c5ce7" />
                <stop offset="1" stopColor="#00cec9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="sidebar-title">GoalTracker</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-dashboard">
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink to="/monthly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-monthly">
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span className="nav-label">Monthly Goals</span>
        </NavLink>

        <NavLink to="/daily" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-daily">
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="nav-label">Daily Goals</span>
        </NavLink>

        <NavLink to="/targets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-targets">
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16" />
              <path d="M4 12h16" />
              <path d="M4 19h10" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </span>
          <span className="nav-label">Target Topics</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom-nav">
        <NavLink to="/delete-items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} id="nav-delete-items">
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </span>
          <span className="nav-label">Delete Items</span>
          <span className="nav-count">{items.length}</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">Built with care</p>
      </div>
    </aside>
  );
};

export default Sidebar;
