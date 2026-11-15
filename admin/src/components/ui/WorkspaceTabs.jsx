import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook đồng bộ tab đang chọn với query param `?tab=...` trên URL.
 */
export function useWorkspaceTab(tabs = [], defaultTab) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fallbackTab = defaultTab || tabs[0]?.id || '';
  const rawTab = searchParams.get('tab');
  const activeTab = tabs.some((t) => t.id === rawTab) ? rawTab : fallbackTab;

  const setActiveTab = useCallback(
    (nextTab) => {
      const nextParams = new URLSearchParams(searchParams);
      if (!nextTab || nextTab === fallbackTab) {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', nextTab);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams, fallbackTab],
  );

  return [activeTab, setActiveTab];
}

/**
 * Thanh chuyển đổi Tab dùng chung cho các Không gian làm việc (Workspaces) trong Admin Portal.
 */
export function WorkspaceTabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl w-fit max-w-full overflow-x-auto shadow-xs ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-[#1A3A2C] text-white dark:bg-[#2A5C4A] dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#1A3A2C] dark:hover:text-slate-100 hover:bg-[#EEF5F1]/70 dark:hover:bg-slate-800/60'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#C9A84C]' : 'text-slate-400'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  isActive
                    ? 'bg-[#C9A84C]/20 text-[#FBF7EC] border border-[#C9A84C]/35'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default WorkspaceTabs;
