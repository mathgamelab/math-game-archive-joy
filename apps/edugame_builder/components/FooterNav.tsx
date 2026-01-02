
import React from 'react';
import { Icons } from '../constants';
import { FormData } from '../types';

interface FooterNavProps {
  currentStep: number;
  formData: FormData;
  onNext: () => void;
  onPrev: () => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ currentStep, formData, onNext, onPrev }) => {
  // Step5에서 프롬프트가 생성되어 있으면 > 버튼 활성화
  const isStep5WithPrompt = currentStep === 5 && formData.geminiPrompt;
  const isNextDisabled = currentStep === 5 && !isStep5WithPrompt;

  return (
    <>
      <div className="hidden md:block fixed left-8 top-1/2 -translate-y-1/2 z-20">
        <button 
          onClick={onPrev}
          disabled={currentStep === 1}
          className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105"
        >
          <Icons.ArrowLeft className="w-7 h-7" />
        </button>
      </div>

      <div className="hidden md:block fixed right-8 top-1/2 -translate-y-1/2 z-20">
        <button 
          onClick={onNext}
          disabled={isNextDisabled}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-xl flex items-center justify-center text-white hover:from-orange-600 hover:to-yellow-600 transition-all hover:scale-105 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Icons.ArrowRight className="w-7 h-7" />
        </button>
      </div>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
        <button 
          onClick={onPrev}
          disabled={currentStep === 1}
          className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-2xl flex items-center justify-center text-slate-600 disabled:opacity-30"
        >
          <Icons.ArrowLeft className="w-7 h-7" />
        </button>
        <button 
          onClick={onNext}
          disabled={isNextDisabled}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 shadow-2xl flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none"
        >
          <Icons.ArrowRight className="w-8 h-8" />
        </button>
      </div>
    </>
  );
};

export default FooterNav;
