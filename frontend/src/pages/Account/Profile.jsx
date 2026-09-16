import { useSelector } from 'react-redux';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';

export default function Profile() {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">My Profile</h2>
      <p className="text-light-muted dark:text-dark-muted mb-8">Manage your personal information and account settings.</p>

      <form className="max-w-2xl space-y-6" onSubmit={(e) => e.preventDefault()}>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <Button variant="outline" className="text-sm py-2 px-4">Change Avatar</Button>
            <p className="text-xs text-light-muted mt-2">JPG, GIF or PNG. Max size of 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" defaultValue={user?.name || ''} />
          <Input label="Email Address" type="email" defaultValue={user?.email || ''} disabled />
          <Input label="Phone Number" placeholder="Add your phone number" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-light-text dark:text-dark-text">Date of Birth</label>
            <input type="date" className="w-full p-3 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        <div className="pt-6 border-t border-light-border dark:border-dark-border flex justify-end">
          <Button variant="primary" type="submit" className="px-8">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
