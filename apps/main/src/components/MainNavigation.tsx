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

export const MainNavigation: React.FC<MainNavigationProps> = ({
  items,
  activeSection,
  onSectionChange,
  onContactClick,
}) => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
        <button
          type="button"
          onClick={() => onSectionChange('main')}
          className="flex items-center gap-2.5 text-left"
          aria-label="메인으로 이동"
        >
          <img
            src="/images/math_game_logo.png"
            alt=""
            className="h-7 w-auto select-none sm:h-9"
            style={{ objectFit: 'contain' }}
          />
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline sm:text-base">
            Math Game Archive
          </span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {items.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:text-[15px] ${
                  active
                    ? 'text-foreground underline decoration-primary/70 underline-offset-8'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onContactClick}
            className="ml-1 px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:text-[15px]"
          >
            문의하기
          </button>
        </div>
      </div>
    </nav>
  );
};
