import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { NotificationProvider } from './context/NotificationContext';
import Dashboard from './pages/Dashboard';
import DeleteItemsPage from './pages/DeleteItemsPage';
import MonthlyPage from './pages/MonthlyPage';
import DailyPage from './pages/DailyPage';
import TargetTopicsPage from './pages/TargetTopicsPage';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="monthly" element={<MonthlyPage />} />
            <Route path="daily" element={<DailyPage />} />
            <Route path="targets" element={<TargetTopicsPage />} />
            <Route path="delete-items" element={<DeleteItemsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
