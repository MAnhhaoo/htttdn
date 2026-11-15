import { Tags, Ticket } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import CategoryManagement from './CategoryManagement';
import VoucherManagement from '../vouchers/VoucherManagement';

const CATALOG_TABS = [
  { id: 'categories', label: 'Danh mục ngành hàng', icon: Tags },
  { id: 'vouchers', label: 'Mã giảm giá Sàn', icon: Ticket },
];

export default function CatalogWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(CATALOG_TABS, 'categories');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={CATALOG_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'vouchers' ? <VoucherManagement /> : <CategoryManagement />}
    </div>
  );
}
