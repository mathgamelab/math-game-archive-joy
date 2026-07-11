import React from 'react';

export interface TabData {
  id: string;
  label: string;
  description: string;
}

interface NavigationTabsProps {
  tabs: TabData[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  if (tabs.length <= 1) return null;

  return (
    <div className="border-b border-border/60 bg-background/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`chip shrink-0 whitespace-nowrap ${active ? 'chip-active' : 'hover:border-primary/25 hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
