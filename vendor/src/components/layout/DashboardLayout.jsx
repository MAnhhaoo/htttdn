import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A3A2C] dark:text-[#C9A84C]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100 p-6 overflow-y-auto transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
