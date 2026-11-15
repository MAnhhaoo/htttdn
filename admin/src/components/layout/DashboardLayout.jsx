import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100 p-6 overflow-y-auto custom-scrollbar transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
