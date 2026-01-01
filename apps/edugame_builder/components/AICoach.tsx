
import React, { useState } from 'react';
import { Icons } from '../constants';
import { improveContentWithAI } from '../services/geminiService';

interface AICoachProps {
  type: string;
  toolType: string;
  currentValue: string;
  onApply: (improved: string) => void;
}

const AICoach: React.FC<AICoachProps> = ({ type, toolType, currentValue, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!currentValue.trim()) return;
    setLoading(true);
    setIsOpen(true);
    const result = await improveContentWithAI(type, toolType, currentValue);
    setImprovedText(result);
    setLoading(false);
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button 
        onClick={handleImprove}
        disabled={!currentValue.trim()}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md
          ${currentValue.trim() ? 
            'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100' : 
            'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}
        `}
      >
        <Icons.Sparkles className="w-4 h-4" />
        AI 개선
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-purple-100 p-5 animate-in">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-purple-600 flex items-center gap-2">
              <Icons.Bot className="w-4 h-4" /> AI COACH
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">더 나은 표현을 생각 중...</p>
            </div>
          ) : improvedText ? (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{improvedText}</p>
              </div>
              <button 
                onClick={() => { onApply(improvedText); setIsOpen(false); }}
                className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-lg"
              >
                개선된 내용 적용
              </button>
            </div>
          ) : (
            <p className="text-sm text-red-500">개선 제안을 생성하지 못했습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoach;
