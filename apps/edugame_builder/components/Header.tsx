
import React, { useState, useEffect } from 'react';
import { STEP_NAMES, Icons } from '../constants';
import mathGameLogo from '../../../public/images/math_game_logo.png';

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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={mathGameLogo} alt="" className="h-7 w-auto select-none sm:h-9" />
          <h1 className="whitespace-nowrap text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">EduGame Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* 커뮤니티 드롭다운 메뉴 */}
          <div className="relative community-menu-container">
            <button 
              onClick={toggleCommunityMenu}
              aria-expanded={isCommunityMenuOpen}
              aria-haspopup="menu"
              className="secondary-button h-9 gap-2 whitespace-nowrap px-3 text-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              <span>커뮤니티</span>
            </button>
            {isCommunityMenuOpen && (
              <div role="menu" className="absolute right-0 z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <a 
                  href="https://open.kakao.com/o/gVSDtSIh" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  role="menuitem"
                  className="block px-4 py-3 text-center text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  개발자 단톡방<br/>
                  <span style={{ backgroundColor: '#fef08a', color: '#000000', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block' }}>
                    입장코드:vibe
                  </span>
                </a>
              </div>
            )}
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">
            <span className="sr-only">현재 단계 </span><span className="text-slate-950">{currentStep}</span> / 6
          </div>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto border-t border-slate-100 bg-white px-4 py-3 no-scrollbar">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative min-w-[500px] px-2">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-slate-800 z-0 transition-all duration-500"
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
                  ${isCompleted ? 'bg-slate-700 text-white shadow-md' :
                    isCurrent ? 'bg-slate-900 text-white shadow-lg scale-110 ring-4 ring-slate-100' :
                    'bg-slate-200 text-slate-500'}
                `}>
                  {isCompleted ? <Icons.Check className="w-6 h-6" /> : step}
                </div>
                <span className={`mt-2 text-[10px] sm:text-xs font-medium ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
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
