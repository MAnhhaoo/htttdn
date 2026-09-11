'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('miva-token');
    localStorage.removeItem('miva-user');
    addToast('Logged out successfully', 'success');
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/account', label: '👤 Profile Overview' },
    { href: '/account/orders', label: '📦 My Orders' },
    { href: '/account/wishlist', label: '❤️ Wishlist' },
    { href: '/account/vouchers', label: '🎟️ Vouchers' },
    { href: '/account/settings', label: '⚙️ Settings' },
  ];

  return (
    <div className="container section">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">My Account</span>
      </div>

      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', padding: 'var(--space-2)' }}>
              <img src="https://ui-avatars.com/api/?name=User&background=C9A84C&color=fff&size=48" alt="User" style={{ borderRadius: 'var(--radius-full)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Hello, User!</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Welcome to Miva</div>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {navItems.map(item => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`account-sidebar-item ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ height: 1, background: 'var(--border-color)', margin: 'var(--space-2) 0' }}></div>
              <button 
                className="account-sidebar-item" 
                style={{ color: 'var(--error)' }}
                onClick={handleLogout}
              >
                🚪 Log Out
              </button>
            </nav>
          </div>
        </aside>
        
        <main className="account-content">
          {children}
        </main>
      </div>
    </div>
  );
}
