import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({
  orders = [],
  pendingCount,
  confirmedCount,
  exceptionCount,
}) => {
  const pCount =
    pendingCount !== undefined
      ? pendingCount
      : orders.filter((o) => o.status === 'pending').length;
  const cCount =
    confirmedCount !== undefined
      ? confirmedCount
      : orders.filter((o) => o.status === 'confirmed').length;
  const eCount =
    exceptionCount !== undefined
      ? exceptionCount
      : orders.filter((o) => o.exception !== null).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar 
          pendingCount={pCount} 
          confirmedCount={cCount} 
          exceptionCount={eCount} 
        />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
