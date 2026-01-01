
import React from 'react';
import { FormData } from '../../types';
import { GAME_EXAMPLES } from '../../constants';
import AICoach from '../AICoach';

interface Step4Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step4: React.FC<Step4Props> = ({ formData, updateField }) => {
  const example = (formData.subject && GAME_EXAMPLES[formData.subject]) || GAME_EXAMPLES['기타'];

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 설계 <span className="text-indigo-600">(Design)</span></h2>
        <p className="text-slate-600 text-lg">게임이 어떻게 작동하고 상호작용할지 정의합니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanics */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl relative">
            <label className="block text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">✨</span>
              핵심 기능
            </label>
            <div className="relative">
              <textarea 
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:bg-white min-h-[220px] resize-none"
                placeholder={example.mechanics}
                value={formData.mechanics}
                onChange={(e) => updateField('mechanics', e.target.value)}
              />
              <AICoach 
                type="mechanics" 
                toolType={formData.subject} 
                currentValue={formData.mechanics} 
                onApply={(v) => updateField('mechanics', v)}
                gameConcept={formData.gameConcept}
              />
            </div>
          </div>

          {/* Vibe */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl relative">
            <label className="block text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-sm">🎨</span>
              디자인 및 분위기
            </label>
            <div className="relative">
              <textarea 
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:bg-white min-h-[220px] resize-none"
                placeholder={example.vibe}
                value={formData.vibe}
                onChange={(e) => updateField('vibe', e.target.value)}
              />
              <AICoach 
                type="vibe" 
                toolType={formData.subject} 
                currentValue={formData.vibe} 
                onApply={(v) => updateField('vibe', v)}
                gameConcept={formData.gameConcept}
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-slate-900 p-8 rounded-3xl border-2 border-slate-700 shadow-xl text-white">
          <label className="block text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center text-sm font-mono">&gt;_</span>
            개발 규칙 & 성취 기준 <span className="text-sm font-normal text-slate-500">(.cursorrules)</span>
          </label>
          <textarea 
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none font-mono text-sm text-blue-200"
            placeholder={example.rules}
            value={formData.rules}
            onChange={(e) => updateField('rules', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4;
