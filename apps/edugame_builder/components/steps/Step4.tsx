
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormData } from '../../types';
import { GAME_EXAMPLES } from '../../constants';
import { Icons } from '../../constants';
import AICoach from '../AICoach';

interface Step4Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step4: React.FC<Step4Props> = ({ formData, updateField }) => {
  const example = (formData.subject && GAME_EXAMPLES[formData.subject]) || GAME_EXAMPLES['기타'];
  const [isEditingConcept, setIsEditingConcept] = useState(false);
  const [isEditingMechanics, setIsEditingMechanics] = useState(!formData.mechanics.trim());
  const [isEditingVibe, setIsEditingVibe] = useState(!formData.vibe.trim());

  // gameConcept 파싱
  const parseGameConcept = (concept: string) => {
    if (!concept.trim()) return { title: '', description: '', features: [] };
    
    const lines = concept.split('\n').filter(l => l.trim());
    const title = lines[0] || '';
    const descriptionIndex = lines.findIndex(l => l.trim() && l !== title);
    const description = descriptionIndex !== -1 ? lines[descriptionIndex] : '';
    const featuresStartIndex = lines.findIndex(l => l.includes('주요 특징') || l.includes('특징'));
    const features = featuresStartIndex !== -1 
      ? lines.slice(featuresStartIndex + 1)
          .filter(l => l.trim() && (l.startsWith('-') || l.startsWith('•')))
          .map(l => l.replace(/^[-•]\s*/, '').trim())
      : [];
    
    return { title, description, features };
  };

  const gameConceptData = parseGameConcept(formData.gameConcept);

  const handleToggleEdit = () => {
    if (isEditingConcept) {
      // 저장 버튼 클릭 시 명시적으로 수정 모드 해제
      setIsEditingConcept(false);
    } else {
      // 수정 버튼 클릭 시 수정 모드 활성화
      setIsEditingConcept(true);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 설계 <span className="text-indigo-600">(Design)</span></h2>
        <p className="text-slate-600 text-lg">게임이 어떻게 작동하고 상호작용할지 정의합니다.</p>
      </div>

      {/* 선택한 게임 컨셉 카드 */}
      {formData.gameConcept && (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">🎮</span>
              선택한 게임 컨셉
            </h3>
            <button
              onClick={handleToggleEdit}
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isEditingConcept ? '저장' : '수정'}
            </button>
          </div>

          {isEditingConcept ? (
            <textarea
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white min-h-[200px] resize-none text-sm"
              value={formData.gameConcept}
              onChange={(e) => updateField('gameConcept', e.target.value)}
              autoFocus
            />
          ) : (
            <div className="space-y-4">
              {gameConceptData.title && (
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 mb-2">{gameConceptData.title}</h4>
                  {gameConceptData.description && (
                    <p className="text-slate-600 leading-relaxed">{gameConceptData.description}</p>
                  )}
                </div>
              )}
              {gameConceptData.features.length > 0 && (
                <div>
                  <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">주요 특징</h5>
                  <ul className="space-y-1">
                    {gameConceptData.features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanics */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">✨</span>
                핵심 기능
              </label>
              {formData.mechanics.trim() && (
                <button onClick={() => setIsEditingMechanics((editing) => !editing)} className="secondary-button px-3 py-1.5 text-xs">
                  {isEditingMechanics ? '미리보기' : '편집'}
                </button>
              )}
            </div>
            <div className="relative">
              {isEditingMechanics ? (
                <textarea
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:bg-white min-h-[220px] resize-none"
                  placeholder={example.mechanics}
                  value={formData.mechanics}
                  onChange={(e) => updateField('mechanics', e.target.value)}
                />
              ) : (
                <div className="markdown-preview min-h-[220px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.mechanics}</ReactMarkdown>
                </div>
              )}
              <AICoach 
                type="mechanics" 
                toolType={formData.subject} 
                currentValue={formData.mechanics} 
                onApply={(v) => { updateField('mechanics', v); setIsEditingMechanics(false); }}
                gameConcept={formData.gameConcept}
              />
            </div>
          </div>

          {/* Vibe */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-sm">🎨</span>
                디자인 및 분위기
              </label>
              {formData.vibe.trim() && (
                <button onClick={() => setIsEditingVibe((editing) => !editing)} className="secondary-button px-3 py-1.5 text-xs">
                  {isEditingVibe ? '미리보기' : '편집'}
                </button>
              )}
            </div>
            <div className="relative">
              {isEditingVibe ? (
                <textarea
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:bg-white min-h-[220px] resize-none"
                  placeholder={example.vibe}
                  value={formData.vibe}
                  onChange={(e) => updateField('vibe', e.target.value)}
                />
              ) : (
                <div className="markdown-preview min-h-[220px] rounded-xl border border-slate-100 bg-slate-50 p-4 text-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.vibe}</ReactMarkdown>
                </div>
              )}
              <AICoach 
                type="vibe" 
                toolType={formData.subject} 
                currentValue={formData.vibe} 
                onApply={(v) => { updateField('vibe', v); setIsEditingVibe(false); }}
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
