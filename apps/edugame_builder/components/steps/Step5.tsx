
import React from 'react';
import { FormData } from '../../types';
import { Icons } from '../../constants';

interface Step5Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step5: React.FC<Step5Props> = ({ formData, updateField }) => {
  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 로직 구성 <span className="text-purple-600">(Logic)</span></h2>
        <p className="text-slate-600 text-lg">AI가 구조화한 게임 데이터입니다. 개발을 위해 세부 사항을 다듬어보세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* User Raw Input View */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">기획 요약</h3>
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
            <div>
              <span className="text-xs font-bold text-slate-400">LEARNING GOAL</span>
              <p className="text-slate-800 mt-2 text-sm leading-relaxed">{formData.learningGoal}</p>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-400">GAME CONCEPT</span>
              <p className="text-slate-800 mt-2 text-sm font-bold">{formData.gameConcept}</p>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <span className="text-xs font-bold text-slate-400">MECHANICS</span>
              <p className="text-slate-800 mt-2 text-sm whitespace-pre-wrap">{formData.mechanics}</p>
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

          <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
            <div className="bg-purple-50 px-6 py-3 border-b border-purple-100 text-xs font-bold text-purple-800">
              핵심 로직 및 보상 체계 (Game Logic)
            </div>
            <textarea 
              className="flex-1 p-6 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar"
              value={formData.structuredData.gameLogic}
              onChange={(e) => updateField('structuredData.gameLogic', e.target.value)}
            />
            <div className="bg-blue-50 px-6 py-3 border-y border-blue-100 text-xs font-bold text-blue-800">
              UI 에셋 및 시각화 계획 (UI Assets)
            </div>
            <textarea 
              className="h-48 p-6 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar"
              value={formData.structuredData.uiAssets}
              onChange={(e) => updateField('structuredData.uiAssets', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;
