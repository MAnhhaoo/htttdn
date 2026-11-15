import { UserCheck, Calculator } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import EmployeeManagement from './EmployeeManagement';
import PayrollManagement from '../payroll/PayrollManagement';

const EMPLOYEE_TABS = [
  { id: 'staff', label: 'Hồ sơ & Phân ca Nhân sự', icon: UserCheck },
  { id: 'payroll', label: 'Bảng lương & Chốt công', icon: Calculator },
];

export default function EmployeeWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(EMPLOYEE_TABS, 'staff');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={EMPLOYEE_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'payroll' ? <PayrollManagement /> : <EmployeeManagement />}
    </div>
  );
}
