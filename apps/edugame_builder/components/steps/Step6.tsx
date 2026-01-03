
import React, { useState, useEffect } from 'react';
import { FormData } from '../../types';
import { generateFinalPromptWithAI } from '../../services/geminiService';
import { Icons } from '../../constants';

interface Step6Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
  apiKey?: string; // Gemini API key
}

const Step6: React.FC<Step6Props> = ({ formData, updateField, apiKey }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastPromptLevel, setLastPromptLevel] = useState<string | undefined>(undefined);

  useEffect(() => {
    // promptLevel이 변경되었거나 새로 설정되었고, 프롬프트가 없을 때만 생성
    if (formData.promptLevel && formData.promptLevel !== lastPromptLevel && !loading && !formData.geminiPrompt) {
      setLastPromptLevel(formData.promptLevel);
      setLoading(true);
      generateFinalPromptWithAI(apiKey, formData).then((result) => {
        if (result) {
          updateField('geminiPrompt', result);
          updateField('editedPrompt', result);
        } else {
          // API 키가 없거나 생성 실패 시 기본 프롬프트 사용
          const defaultPrompt = `# ${formData.gameConcept || '게임'} 개발 프롬프트

## 프로젝트 개요
- 교과: ${formData.subject}
- 학년: ${formData.grade}
- 학습 목표: ${formData.learningGoal}

## 게임 컨셉
${formData.gameConcept}

## 게임 설계
${formData.mechanics}

## 디자인 및 분위기
${formData.vibe}

## 기술 요구사항
${formData.rules}

## 게임 로직
${formData.structuredData.gameLogic}

## UI 에셋
${formData.structuredData.uiAssets}

위 내용을 바탕으로 교육용 웹 게임을 개발해주세요.`;
          updateField('geminiPrompt', defaultPrompt);
          updateField('editedPrompt', defaultPrompt);
        }
        setLoading(false);
      }).catch((error) => {
        console.error('프롬프트 생성 실패:', error);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.promptLevel]);

  const handleCopy = () => {
    const text = formData.editedPrompt || formData.geminiPrompt;
    if (text) {
      navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const currentPrompt = formData.editedPrompt || formData.geminiPrompt || '';

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">최종 프롬프트 생성 <span className="text-green-600">(Result)</span></h2>
        <p className="text-slate-600 text-lg">
          {loading ? 'Gemini AI가 프롬프트를 생성 중입니다...' : '프롬프트를 편집한 후 복사해서 사용하세요!'}
        </p>
      </div>

      {loading ? (
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-20 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-800 font-semibold text-lg">AI가 최적화된 프롬프트를 생성하고 있습니다...</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border-2 border-slate-400 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '300px' }}>
            <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-b-2 border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-semibold text-slate-400">prompt.md</span>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">편집 가능</span>
              </div>
              <button 
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-lg text-base font-bold transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl h-10 px-6 transform hover:scale-105"
              >
                {success ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                {success ? '복사 완료!' : '복사하기'}
              </button>
            </div>
            
            <textarea 
              className="flex-1 w-full p-8 text-sm font-mono leading-relaxed whitespace-pre-wrap text-slate-200 bg-slate-900 border-0 focus:outline-none resize-none custom-scrollbar"
              style={{ minHeight: '250px' }}
              value={currentPrompt}
              onChange={(e) => updateField('editedPrompt', e.target.value)}
              placeholder="프롬프트를 편집하세요..."
            />
          </div>

          {currentPrompt && (
            <div className="flex flex-col items-center justify-center pt-6 pb-4 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icons.Check className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2">프롬프트 생성이 완료되었습니다! 🎉</h3>
                <p className="text-slate-600 text-lg">이제 생성된 프롬프트를 사용하여 선생님만의 멋진 게임을 개발해보세요.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-lg text-base font-semibold transition-all border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 h-12 px-8 py-3 shadow-md hover:shadow-lg"
              >
                처음으로 돌아가기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Step6;
