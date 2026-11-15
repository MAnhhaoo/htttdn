import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useToast } from '@shared/components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../api/axiosClient';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AttendanceCheckInModal } from '../attendance/AttendanceCheckInModal';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const handleOpenCheckIn = async () => {
    setCheckInOpen(true);
    try {
      const freshProfile = await profileApi.getProfile();
      if (freshProfile) {
        setProfileData(freshProfile);
      }
    } catch {
      // Fall back to authenticated user in context
    }
  };

  const handleCheckInSuccess = () => {
    toast.success('Đã ghi nhận chấm công vào ca thành công!');
    window.dispatchEvent(new Event('miva:attendance'));
  };

  return (
    <div className="flex h-screen bg-[#F4F5F3] dark:bg-[#0B110E] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCheckIn={handleOpenCheckIn}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      <AttendanceCheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        profile={profileData || user}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  );
};
