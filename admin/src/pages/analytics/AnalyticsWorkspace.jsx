import { TrendingUp, Users } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import Analytics from './Analytics';
import CustomerAnalytics from './CustomerAnalytics';

const ANALYTICS_TABS = [
  { id: 'overview', label: 'Doanh thu & Vận hành Sàn', icon: TrendingUp },
  { id: 'customers', label: 'Phân tích Khách hàng', icon: Users },
];

export default function AnalyticsWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(ANALYTICS_TABS, 'overview');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={ANALYTICS_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'customers' ? <CustomerAnalytics /> : <Analytics />}
    </div>
  );
}
