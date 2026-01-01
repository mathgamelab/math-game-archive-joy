import React from 'react';
import { Button } from "@/components/ui/button";

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
  onTabChange 
}) => {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-4 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-shrink-0 whitespace-nowrap transition-smooth
                ${activeTab === tab.id 
                  ? 'bg-gradient-primary text-primary-foreground shadow-card hover:bg-gradient-primary hover:opacity-90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};