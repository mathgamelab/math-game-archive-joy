import React from 'react';

export interface MainNavItem {
  id: string;
  label: string;
}

interface MainNavigationProps {
  items: MainNavItem[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onContactClick?: () => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ items, activeSection, onSectionChange, onContactClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 flex items-center h-12 sm:h-16">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <img
              src="/images/math_game_logo.png"
              alt="Math Game Logo"
              className="h-6 sm:h-10 w-auto select-none"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-nowrap">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`text-sm sm:text-lg font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-colors duration-150 ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={onContactClick}
              className="text-sm sm:text-lg font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-colors duration-150 bg-blue-600 text-white shadow hover:bg-blue-700 ml-1 sm:ml-2"
              style={{ minWidth: '72px' }}
            >
              문의하기
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 