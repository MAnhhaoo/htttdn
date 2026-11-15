import { Store, ShieldCheck } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import VendorManagement from './VendorManagement';
import VendorRegistrationManagement from './VendorRegistrationManagement';

const VENDOR_TABS = [
  { id: 'shops', label: 'Đang hoạt động & Danh sách Shop', icon: Store },
  { id: 'registrations', label: 'Hồ sơ Đăng ký & Gia hạn', icon: ShieldCheck },
];

export default function VendorWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(VENDOR_TABS, 'shops');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={VENDOR_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'registrations' ? <VendorRegistrationManagement /> : <VendorManagement />}
    </div>
  );
}
