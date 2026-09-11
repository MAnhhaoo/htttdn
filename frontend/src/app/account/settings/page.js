'use client';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Settings saved successfully', 'success');
  };

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>Account Settings</h2>
      
      <form onSubmit={handleSave} style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>Personal Information</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" className="form-input" defaultValue="Alex" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-input" defaultValue="Johnson" />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" defaultValue="alex.j@example.com" disabled />
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>Email cannot be changed directly. Please contact support.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input type="tel" className="form-input" defaultValue="+1 (555) 123-4567" />
        </div>

        <h3 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>Preferences</h3>
        
        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Receive order updates via email</span>
          </label>
        </div>
        
        <div className="form-group">
          <label className="form-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Receive promotional emails and newsletter</span>
          </label>
        </div>

        <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
          <label className="form-label">Theme</label>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <label className="form-radio">
              <input type="radio" name="theme" checked={theme === 'light'} onChange={() => theme !== 'light' && toggleTheme()} />
              <span>Light Mode</span>
            </label>
            <label className="form-radio">
              <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => theme !== 'dark' && toggleTheme()} />
              <span>Dark Mode</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-8)' }}>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
