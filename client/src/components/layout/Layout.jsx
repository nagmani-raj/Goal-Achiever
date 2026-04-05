import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SnackbarContainer from '../common/SnackbarContainer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout" id="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <SnackbarContainer />
    </div>
  );
};

export default Layout;
