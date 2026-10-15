import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ orders = [] }) => {
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const exceptionCount = orders.filter((o) => o.exception !== null).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar 
          pendingCount={pendingCount} 
          confirmedCount={confirmedCount} 
          exceptionCount={exceptionCount} 
        />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
