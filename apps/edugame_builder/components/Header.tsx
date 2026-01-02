
import React, { useState, useEffect } from 'react';
import { STEP_NAMES, Icons } from '../constants';

interface HeaderProps {
  currentStep: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.community-menu-container')) {
        setIsCommunityMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleCommunityMenu = () => {
    setIsCommunityMenuOpen(!isCommunityMenuOpen);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg text-2xl">
            🎮
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">EduGame Builder</span>
        </div>
        <div className="flex items-center gap-3">
          {/* 커뮤니티 드롭다운 메뉴 */}
          <div className="relative community-menu-container">
            <button 
              onClick={toggleCommunityMenu}
              className="px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition shadow-sm whitespace-nowrap h-9"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              <span>커뮤니티</span>
            </button>
            {isCommunityMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-slate-200 z-50 overflow-hidden" style={{ minWidth: '220px', width: 'auto' }}>
                <a 
                  href="https://open.kakao.com/o/gVSDtSIh" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block px-4 py-2 text-black hover:bg-slate-50 transition-colors text-sm font-medium text-center"
                >
                  개발자 단톡방<br/>
                  <span style={{ backgroundColor: '#fef08a', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block' }}>
                    입장코드:vibe
                  </span>
                </a>
              </div>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-1.5 rounded-full">
            Step <span className="text-orange-600">{currentStep}</span> of 6
          </div>
        </div>
      </div>
      
      <div className="w-full bg-white border-t border-slate-100 px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative min-w-[500px] px-2">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />

          {STEP_NAMES.map((name, i) => {
            const step = i + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            
            return (
              <div key={name} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isCompleted ? 'bg-orange-500 text-white shadow-md' : 
                    isCurrent ? 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-xl scale-125 ring-4 ring-orange-50' : 
                    'bg-slate-200 text-slate-500'}
                `}>
                  {isCompleted ? <Icons.Check className="w-6 h-6" /> : step}
                </div>
                <span className={`mt-2 text-[10px] sm:text-xs font-medium ${isCurrent ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
