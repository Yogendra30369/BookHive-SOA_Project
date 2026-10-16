import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './AppLayout.css';

export default function AppLayout() {
  const role = localStorage.getItem('archivalia_role');

  // If user is not logged in, redirect directly to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated user/admin layout
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

