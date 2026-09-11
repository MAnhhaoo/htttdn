'use client';

export default function ProfileOverview() {
  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>Profile Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        <div style={{ padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Total Orders</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>12</div>
        </div>
        <div style={{ padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Saved Addresses</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>2</div>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Personal Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Full Name</div>
          <div style={{ fontWeight: 500 }}>Alex Johnson</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Email</div>
          <div style={{ fontWeight: 500 }}>alex.j@example.com</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Phone Number</div>
          <div style={{ fontWeight: 500 }}>+1 (555) 123-4567</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Member Since</div>
          <div style={{ fontWeight: 500 }}>October 2024</div>
        </div>
      </div>
      
      <button className="btn btn-outline">Edit Profile</button>
    </div>
  );
}
