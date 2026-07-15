
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { FormData } from '../types';
import { generateImprovementIdeas } from '../services/geminiService';

interface IdeaBoosterProps {
  currentStep: number;
  formData: FormData;
  onApply: (idea: string) => void;
}

const IdeaBooster: React.FC<IdeaBoosterProps> = ({ currentStep, formData, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldTwinkle, setShouldTwinkle] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show twinkle effect after some time in specific steps to draw attention
    const timer = setTimeout(() => {
      if (currentStep >= 4) setShouldTwinkle(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const loadIdeas = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateImprovementIdeas(formData, currentStep);
      if (result && result.length > 0) {
        setIdeas(result);
      } else {
        setError('아이디어를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (requestError) {
      console.error('Improvement ideas generation failed:', requestError);
      setError(requestError instanceof Error ? requestError.message : '아이디어 생성 요청이 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!isOpen) {
      // 열 때 아이디어가 없으면 생성
      if (ideas.length === 0) {
        loadIdeas();
      }
    }
    setIsOpen(!isOpen);
  };

  const handleApply = (idea: string) => {
    onApply(idea);
    setIsOpen(false);
    setShouldTwinkle(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end md:bottom-8 md:right-8">
      {isOpen && (
        <div role="dialog" aria-label="아이디어 부스터" className="mb-4 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in">
          <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Icons.Lightbulb className="w-5 h-5" /> 아이디어 부스터
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={loadIdeas}
                disabled={loading}
                aria-label="새로운 아이디어 생성"
                className="rounded px-2 py-1 text-xs transition-colors hover:bg-white/20 disabled:opacity-50"
                title="새로운 아이디어 생성"
              >
                🔄
              </button>
              <button onClick={() => setIsOpen(false)} aria-label="아이디어 부스터 닫기" className="text-2xl leading-none">&times;</button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 space-y-3 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">아이디어를 생성하고 있습니다...</p>
              </div>
            ) : error ? (
              <div role="alert" className="text-center py-8">
                <p className="text-sm text-red-500 mb-3">{error}</p>
                <button
                  onClick={loadIdeas}
                  className="primary-button px-4 py-2 text-sm"
                >
                  다시 시도
                </button>
              </div>
            ) : ideas.length > 0 ? (
              ideas.map((idea, index) => (
                <button 
                  key={index}
                  onClick={() => handleApply(idea)}
                  className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-400 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f0e8] text-xs font-bold text-[#5e7c62]">
                      {index + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed flex-1">{idea}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">아이디어를 생성할 수 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={handleOpen}
        disabled={loading}
        aria-label="아이디어 부스터 열기"
        aria-expanded={isOpen}
        className={`
          w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50
          ${isOpen || shouldTwinkle ? 'bg-slate-800 text-white ring-4 ring-slate-100' : 'bg-slate-200 text-slate-500'}
          ${shouldTwinkle && !isOpen ? 'animate-twinkle' : ''}
        `}
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icons.Lightbulb className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};

export default IdeaBooster;
