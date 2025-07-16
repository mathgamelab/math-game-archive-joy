import React from 'react';

export interface MainNavItem {
  id: string;
  label: string;
}

interface MainNavigationProps {
  items: MainNavItem[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ items, activeSection, onSectionChange }) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center h-16">
        <div className="flex items-center space-x-8">
          <span className="text-2xl font-bold text-blue-700 select-none">MATH GAME</span>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`text-lg font-medium px-4 py-2 rounded transition-colors duration-150 ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}; 