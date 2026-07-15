
import React, { useState } from 'react';
import { Icons } from '../constants';
import { improveContentWithAI } from '../services/geminiService';

interface AICoachProps {
  type: string;
  toolType: string;
  currentValue: string;
  onApply: (improved: string) => void;
  curriculumStandard?: string; // Step 2에서 선택한 성취기준
  gameConcept?: string; // Step 3에서 선택한 게임 컨셉
}

const AICoach: React.FC<AICoachProps> = ({ type, toolType, currentValue, onApply, curriculumStandard, gameConcept }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step4의 mechanics나 vibe 타입일 때는 "AI 생성", 나머지는 "AI 개선"
  const isGenerateMode = type === 'mechanics' || type === 'vibe';
  const buttonText = isGenerateMode ? 'AI 생성' : 'AI 개선';
  
  // 생성 모드일 때는 currentValue가 비어있어도 gameConcept가 있으면 활성화
  const canGenerate = isGenerateMode 
    ? (currentValue.trim() || gameConcept?.trim())
    : currentValue.trim();

  const handleImprove = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setIsOpen(true);
    setError(null);
    setImprovedText(null);

    try {
      const result = await improveContentWithAI(type, toolType, currentValue, curriculumStandard, gameConcept);
      if (!result) {
        throw new Error('AI가 개선 내용을 반환하지 않았습니다.');
      }
      setImprovedText(result);
    } catch (requestError) {
      console.error('AI improvement failed:', requestError);
      setError(requestError instanceof Error ? requestError.message : 'AI 요청이 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button 
        onClick={handleImprove}
        disabled={!canGenerate}
        aria-expanded={isOpen}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md
          ${canGenerate ?
            'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100' :
            'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}
        `}
      >
        <Icons.Sparkles className="w-4 h-4" />
        {buttonText}
      </button>

      {isOpen && (
        <div role="dialog" aria-label="AI 코치 제안" className="absolute bottom-full right-0 mb-3 w-72 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in sm:w-80">
          <div className="flex justify-between items-center mb-4">
            <span className="flex items-center gap-2 text-xs font-bold text-[#5e7c62]">
              <Icons.Bot className="w-4 h-4" /> SOLAR AI COACH
            </span>
            <button onClick={() => setIsOpen(false)} aria-label="AI 코치 닫기" className="text-slate-400 hover:text-slate-600">&times;</button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-2 border-[#6f8f72] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">{isGenerateMode ? '게임 설계를 생성 중...' : '더 나은 표현을 생각 중...'}</p>
            </div>
          ) : improvedText ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#d9e5da] bg-[#f3f7f3] p-3">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{improvedText}</p>
              </div>
              <button 
                onClick={() => { onApply(improvedText); setIsOpen(false); }}
                className="primary-button w-full py-2 text-sm"
              >
                {isGenerateMode ? '생성된 내용 적용' : '개선된 내용 적용'}
              </button>
            </div>
          ) : (
            <div role="alert" className="space-y-3">
              <p className="text-sm text-red-500 font-bold">{isGenerateMode ? '생성에 실패했습니다.' : '개선 제안을 생성하지 못했습니다.'}</p>
              {error && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}
              <button onClick={handleImprove} className="secondary-button w-full py-2 text-sm">다시 시도</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoach;
