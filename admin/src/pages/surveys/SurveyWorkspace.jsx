import { ClipboardList, Star } from 'lucide-react';
import { WorkspaceTabs, useWorkspaceTab } from '../../components/ui';
import SurveyManagement from './SurveyManagement';
import ReviewManagement from '../reviews/ReviewManagement';

const SURVEY_TABS = [
  { id: 'surveys', label: 'Chiến dịch Khảo sát CRM', icon: ClipboardList },
  { id: 'reviews', label: 'Kiểm duyệt Đánh giá Sao', icon: Star },
];

export default function SurveyWorkspace() {
  const [activeTab, setActiveTab] = useWorkspaceTab(SURVEY_TABS, 'surveys');

  return (
    <div className="space-y-6">
      <WorkspaceTabs
        tabs={SURVEY_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'reviews' ? <ReviewManagement /> : <SurveyManagement />}
    </div>
  );
}
