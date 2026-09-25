import { useState } from 'react';
import { Store, Save } from 'lucide-react';
import { mockVendorProfiles } from '../../data';

const CURRENT_VENDOR_ID = 3;

export default function StoreSettings() {
  const profile = mockVendorProfiles.find(p => p.userId === CURRENT_VENDOR_ID);
  const [form, setForm] = useState({
    storeName: profile?.storeName || '',
    description: profile?.description || '',
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert('Store settings saved (mock)');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your store information</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            {profile?.storeLogo ? (
              <img src={profile.storeLogo} alt="Store Logo" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <Store className="w-8 h-8 text-indigo-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{form.storeName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{form.businessName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
            <input type="text" value={form.storeName}
              onChange={e => handleChange('storeName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
            <input type="text" value={form.businessName}
              onChange={e => handleChange('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Type</label>
            <select value={form.businessType}
              onChange={e => handleChange('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Manufacturer">Manufacturer</option>
            </select>
          </div>

          <button onClick={handleSave}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
