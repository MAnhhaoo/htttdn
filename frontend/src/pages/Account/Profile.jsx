import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import { User, Mail, MapPin, Phone } from 'lucide-react';

export default function Profile() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8 border-b border-light-border dark:border-dark-border pb-6">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">My Profile</h1>
          <Button variant="outline" onClick={() => logout()} isLoading={isLoggingOut}>
            Sign Out
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-light-muted dark:text-dark-muted">Full Name</p>
              <p className="font-semibold text-light-text dark:text-dark-text">{user.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-light-muted dark:text-dark-muted">Email Address</p>
              <p className="font-semibold text-light-text dark:text-dark-text">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-light-muted dark:text-dark-muted">Phone Number</p>
              <p className="font-semibold text-light-text dark:text-dark-text">{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-light-muted dark:text-dark-muted">Delivery Address</p>
              <p className="font-semibold text-light-text dark:text-dark-text">{user.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
