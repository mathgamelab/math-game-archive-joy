
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface IdeaBoosterProps {
  currentStep: number;
  onApply: (idea: string) => void;
}

const IDEAS = [
  { icon: '+', title: '더하기 (Add)', desc: '알림(Push) 기능을 더하면 어떨까요?', action: '실시간 알림 및 푸시 기능' },
  { icon: '-', title: '빼기 (Subtract)', desc: '복잡한 설정을 빼고 자동화에 집중하세요.', action: '설정 간소화 및 원클릭 자동화' },
  { icon: 'U', title: '편리함 (Usability)', desc: '음성 인식이나 템플릿 저장을 넣어보세요.', action: '음성 인식 입력 및 커스텀 템플릿' },
  { icon: 'AI', title: 'AI 지능 (AI Tech)', desc: '내용을 AI가 자동으로 요약하게 할까요?', action: 'AI 자동 요약 및 리포트 리포팅' }
];

const IdeaBooster: React.FC<IdeaBoosterProps> = ({ currentStep, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldTwinkle, setShouldTwinkle] = useState(false);

  useEffect(() => {
    // Show twinkle effect after some time in specific steps to draw attention
    const timer = setTimeout(() => {
      if (currentStep === 4) setShouldTwinkle(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleApply = (idea: string) => {
    onApply(idea);
    setIsOpen(false);
    setShouldTwinkle(false);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-yellow-200 overflow-hidden animate-in">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Icons.Lightbulb className="w-5 h-5" /> 아이디어 부스터
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-2xl leading-none">&times;</button>
          </div>
          <div className="p-4 bg-slate-50 space-y-3 max-h-[300px] overflow-y-auto">
            {IDEAS.map((item) => (
              <button 
                key={item.title}
                onClick={() => handleApply(item.action)}
                className="w-full text-left bg-white p-3 rounded-xl border border-slate-200 hover:border-yellow-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700">{item.icon}</span>
                  <span className="font-bold text-slate-800">{item.title}</span>
                </div>
                <p className="text-xs text-slate-500 ml-9">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110
          ${isOpen || shouldTwinkle ? 'bg-amber-400 text-white ring-4 ring-amber-100' : 'bg-slate-200 text-slate-400'}
          ${shouldTwinkle && !isOpen ? 'animate-twinkle' : ''}
        `}
      >
        <Icons.Lightbulb className="w-8 h-8" />
      </button>
    </div>
  );
};

export default IdeaBooster;
