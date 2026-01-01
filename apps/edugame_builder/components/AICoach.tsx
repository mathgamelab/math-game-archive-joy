
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
    const result = await improveContentWithAI(type, toolType, currentValue, curriculumStandard, gameConcept);
    setImprovedText(result);
    setLoading(false);
    
    // 결과가 없으면 에러로 간주 (콘솔에 자세한 에러가 이미 출력됨)
    if (!result) {
      setError('API 키 HTTP referrer 제한 문제일 수 있습니다. 콘솔을 확인하세요.');
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <button 
        onClick={handleImprove}
        disabled={!canGenerate}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md
          ${canGenerate ? 
            'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100' : 
            'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'}
        `}
      >
        <Icons.Sparkles className="w-4 h-4" />
        {buttonText}
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
              <p className="text-sm text-slate-500">{isGenerateMode ? '게임 설계를 생성 중...' : '더 나은 표현을 생각 중...'}</p>
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
                {isGenerateMode ? '생성된 내용 적용' : '개선된 내용 적용'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-500 font-bold">{isGenerateMode ? '생성에 실패했습니다.' : '개선 제안을 생성하지 못했습니다.'}</p>
              {error && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    💡 해결: Google Cloud Console에서 API 키의 HTTP referrer 제한에 <code className="bg-red-100 px-1 rounded">http://localhost:3000/*</code> 추가
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoach;
