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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <img
              src="/images/math_game_logo.png"
              alt="Math Game Logo"
              className="h-10 w-auto select-none"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex items-center space-x-2">
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
      </div>
    </nav>
  );
}; 