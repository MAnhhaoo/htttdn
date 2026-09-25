import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';

export default function Profile() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const queryClient = useQueryClient();

  // Lấy profile từ BE
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
  });

  const userData = profile?.data || profile || {};

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Sync state khi profile load xong
  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
    }
  }, [userData?.id]);

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Cập nhật thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ fullName, phone, address });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">My Profile</h2>
      <p className="text-light-muted dark:text-dark-muted mb-8">Manage your personal information and account settings.</p>

      <form className="max-w-2xl space-y-6" onSubmit={handleSubmit}>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            {fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-light-text dark:text-dark-text">{userData.email}</p>
            <p className="text-xs text-light-muted mt-1 capitalize">Role: {userData.role || 'customer'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={userData.email || ''} 
            disabled 
          />
          <Input 
            label="Phone Number" 
            placeholder="Add your phone number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input 
            label="Address" 
            placeholder="Add your address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="pt-6 border-t border-light-border dark:border-dark-border flex justify-end">
          <Button 
            variant="primary" 
            type="submit" 
            className="px-8" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
