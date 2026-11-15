import { Package, Truck } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import OrderManagement from './OrderManagement';
import ShippingManagement from '../shipping/ShippingManagement';

const ORDER_TABS = [
  { id: 'orders', label: 'Hóa đơn & Điều phối tổng', icon: Package },
  { id: 'shipping', label: 'Vận đơn & Hành trình', icon: Truck },
];

export default function OrderWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(ORDER_TABS, 'orders');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={ORDER_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'shipping' ? <ShippingManagement /> : <OrderManagement />}
    </div>
  );
}
