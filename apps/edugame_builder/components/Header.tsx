
import React from 'react';
import { STEP_NAMES, Icons } from '../constants';

interface HeaderProps {
  currentStep: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg text-2xl">
            🎮
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">EduGame Builder</span>
        </div>
        <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-1.5 rounded-full">
          Step <span className="text-orange-600">{currentStep}</span> of 6
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
