import { Modal, Badge } from '../../components/ui';
import { formatDate } from '../../utils/formatHelpers';
import { Mail, Phone, MapPin, Calendar, Activity } from 'lucide-react';

export default function UserDetailModal({ isOpen, onClose, user }) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user.fullName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center text-sm">
            <Mail className="w-5 h-5 text-slate-400 mr-3" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="w-5 h-5 text-slate-400 mr-3" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{user.phone || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="w-5 h-5 text-slate-400 mr-3" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{user.address || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="w-5 h-5 text-slate-400 mr-3" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Joined Date</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Activity className="w-5 h-5 text-slate-400 mr-3" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
              <Badge variant={user.status === 'active' ? 'success' : 'default'} className="mt-1">
                {user.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
