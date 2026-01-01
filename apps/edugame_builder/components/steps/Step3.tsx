
import React from 'react';
import { FormData } from '../../types';
import { GAME_EXAMPLES } from '../../constants';
import AICoach from '../AICoach';

interface Step3Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step3: React.FC<Step3Props> = ({ formData, updateField }) => {
  const example = (formData.subject && GAME_EXAMPLES[formData.subject]) || GAME_EXAMPLES['기타'];

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 컨셉 설계 <span className="text-blue-600">(Concept)</span></h2>
        <p className="text-slate-600 text-lg">학습 목표를 달성하기 위한 흥미로운 게임 세계관을 만들어 봅시다.</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl border-2 border-blue-100 shadow-sm mb-8">
        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Selected Learning Goal</h4>
        <p className="text-slate-700 italic">"{formData.learningGoal || '아직 입력된 내용이 없습니다.'}"</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 md:p-14 shadow-2xl space-y-12 relative">
        <div className="flex flex-col gap-4">
          <label className="text-lg font-bold text-slate-400">게임 명칭 및 핵심 컨셉</label>
          <div className="relative">
            <textarea 
              className="w-full text-2xl md:text-3xl font-extrabold border-b-4 border-slate-100 focus:border-blue-600 focus:outline-none py-2 bg-transparent transition-colors placeholder:text-slate-200 min-h-[120px] resize-none"
              placeholder={example.gameConcept}
              value={formData.gameConcept}
              onChange={(e) => updateField('gameConcept', e.target.value)}
            />
            <AICoach 
              type="gameConcept" 
              toolType={formData.subject} 
              currentValue={formData.gameConcept} 
              onApply={(v) => updateField('gameConcept', v)} 
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button 
            onClick={() => updateField('gameConcept', example.gameConcept)}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200"
          >
            추천 예시 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
