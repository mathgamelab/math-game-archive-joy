
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

  const handleImprove = async (refinement?: 'shorter' | 'alternative') => {
    if (!canGenerate) return;
    setLoading(true);
    setIsOpen(true);
    setError(null);
    setImprovedText(null);

    try {
      const sourceValue = improvedText || currentValue;
      const result = await improveContentWithAI(type, toolType, sourceValue, curriculumStandard, gameConcept, refinement);
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div role="dialog" aria-modal="true" aria-label="AI 코치 제안" className="flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-bold text-[#5e7c62]">
                <Icons.Bot className="w-5 h-5" /> AI COACH
              </span>
              <button onClick={() => setIsOpen(false)} aria-label="AI 코치 닫기" className="px-2 text-2xl text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-[#6f8f72] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">{isGenerateMode ? '간결한 게임 명세를 생성 중...' : '더 나은 표현을 생각 중...'}</p>
                </div>
              ) : improvedText ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">내용을 직접 수정하거나 더 짧게 다시 생성할 수 있습니다.</p>
                  <textarea
                    aria-label="AI 생성 내용 편집"
                    className="min-h-[320px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed focus:outline-none"
                    value={improvedText}
                    onChange={(event) => setImprovedText(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void handleImprove('shorter')} className="secondary-button px-4 py-2 text-sm">더 짧게</button>
                    <button onClick={() => void handleImprove('alternative')} className="secondary-button px-4 py-2 text-sm">다른 방향</button>
                    <button
                      onClick={() => { onApply(improvedText); setIsOpen(false); }}
                      className="primary-button ml-auto px-5 py-2 text-sm"
                    >
                      {isGenerateMode ? '수정 내용 적용' : '개선 내용 적용'}
                    </button>
                  </div>
                </div>
              ) : (
                <div role="alert" className="space-y-3">
                  <p className="text-sm text-red-500 font-bold">{isGenerateMode ? '생성에 실패했습니다.' : '개선 제안을 생성하지 못했습니다.'}</p>
                  {error && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                    </div>
                  )}
                  <button onClick={() => void handleImprove()} className="secondary-button px-4 py-2 text-sm">다시 시도</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
