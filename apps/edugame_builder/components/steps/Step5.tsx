
import React from 'react';
import { FormData } from '../../types';
import { Icons } from '../../constants';

interface Step5Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
  onNext: (level?: 'beginner' | 'advanced') => void;
}

const Step5: React.FC<Step5Props> = ({ formData, updateField, onNext }) => {
  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 세부 사항 <span className="text-purple-600">(Details)</span></h2>
        <p className="text-slate-600 text-lg">입력하신 내용을 바탕으로 AI가 구조를 잡았습니다. 오른쪽의 기술 구조화 초안을 확인하고 필요하면 수정해보세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* User Raw Input View */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">내가 입력한 내용</h3>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl border-2 border-slate-300 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar shadow-md">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">학습 목표</span>
              <p className="text-slate-800 mt-2 text-sm leading-relaxed">{formData.learningGoal || '입력 없음'}</p>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">게임 컨셉</span>
              <p className="text-slate-800 mt-2 text-sm font-bold whitespace-pre-wrap">{formData.gameConcept || '입력 없음'}</p>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">게임 설계</span>
              <p className="text-slate-800 mt-2 text-sm whitespace-pre-wrap">{formData.mechanics || '입력 없음'}</p>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">디자인 및 분위기</span>
              <p className="text-slate-800 mt-2 text-sm whitespace-pre-wrap">{formData.vibe || '입력 없음'}</p>
            </div>
          </div>
        </div>

        {/* Structured Edit View */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
              <Icons.Sparkles className="w-4 h-4" /> AI 기술 구조화 초안
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">직접 수정 가능</span>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-2xl border-2 border-purple-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 px-6 py-3 border-b-2 border-purple-200 text-xs font-bold text-purple-900">
              핵심 로직 및 보상 체계 (Game Logic)
            </div>
            <textarea 
              className="flex-1 p-6 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar placeholder:text-slate-400"
              value={formData.structuredData.gameLogic}
              onChange={(e) => updateField('structuredData.gameLogic', e.target.value)}
              placeholder="게임의 핵심 로직, 점수 계산 방식, 보상 체계 등을 기술적으로 구체화해주세요.&#10;&#10;예시:&#10;- 정답 시 +10점, 오답 시 -5점&#10;- 연속 정답 시 보너스 점수 2배&#10;- 게임 오버 조건: 시간 초과 또는 오답 3회"
            />
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-6 py-3 border-y-2 border-blue-200 text-xs font-bold text-blue-900">
              UI 에셋 및 시각화 계획 (UI Assets)
            </div>
            <textarea 
              className="h-48 p-6 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar placeholder:text-slate-400"
              value={formData.structuredData.uiAssets}
              onChange={(e) => updateField('structuredData.uiAssets', e.target.value)}
              placeholder="게임의 UI 구성, 시각적 요소, 애니메이션 등을 구체적으로 설명해주세요.&#10;&#10;예시:&#10;- 게임형 대시보드: 점수, 시간, 진행률 표시&#10;- 성취도 시각화: 별 3개 시스템&#10;- 문제 카드: 카드 뒤집기 애니메이션"
            />
          </div>
        </div>
      </div>

      {/* 프롬프트 생성 버튼 */}
      <div className="mt-8 pt-8 border-t-2 border-slate-200 flex-shrink-0 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {
              // 생성 버튼을 다시 누르면 항상 재생성
              updateField('geminiPrompt', '');
              updateField('editedPrompt', '');
              updateField('promptLevel', 'beginner');
              onNext('beginner');
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-base sm:text-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            초급자용 프롬프트 생성
          </button>
          <button 
            onClick={() => {
              // 생성 버튼을 다시 누르면 항상 재생성
              updateField('geminiPrompt', '');
              updateField('editedPrompt', '');
              updateField('promptLevel', 'advanced');
              onNext('advanced');
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-base sm:text-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            고급자용 프롬프트 생성
          </button>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          <span className="font-semibold text-purple-600">초급자용:</span> 프론트엔드만 있는 쉽고 직관적인 프롬프트 | 
          <span className="font-semibold text-blue-600"> 고급자용:</span> 백엔드를 포함한 고성능 프롬프트
        </p>
      </div>
    </div>
  );
};

export default Step5;
