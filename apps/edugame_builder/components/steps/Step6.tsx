
import React, { useState, useEffect } from 'react';
import { FormData } from '../../types';
import { generateFinalPromptWithAI } from '../../services/geminiService';
import { Icons } from '../../constants';

interface Step6Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step6: React.FC<Step6Props> = ({ formData, updateField }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (formData.geminiPrompt) return;
      setLoading(true);
      const result = await generateFinalPromptWithAI(formData);
      if (result) {
        updateField('geminiPrompt', result);
        updateField('editedPrompt', result);
      }
      setLoading(false);
    };
    fetchPrompt();
  }, []);

  const handleCopy = () => {
    const text = formData.editedPrompt || formData.geminiPrompt;
    navigator.clipboard.writeText(text);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">최종 프롬프트 생성 <span className="text-green-600">(Result)</span></h2>
        <p className="text-slate-600 text-lg">생성된 프롬프트를 복사하여 Cursor나 Windsurf에 입력하세요.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-20 flex flex-col items-center gap-6 shadow-xl">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">최적의 프롬프트를 조합 중입니다...</h3>
            <p className="text-slate-400 mt-2">이 작업은 약 5-10초 정도 소요될 수 있습니다.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col min-h-[600px]">
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs font-mono text-slate-500">OPTIMIZED_PROMPT.md</span>
            </div>
            <button 
              onClick={handleCopy}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all transform hover:scale-105
                ${success ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}
              `}
            >
              {success ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
              {success ? '복사 완료!' : '클립보드 복사'}
            </button>
          </div>
          
          <textarea 
            className="flex-1 w-full bg-slate-900 p-8 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
            value={formData.editedPrompt || formData.geminiPrompt}
            onChange={(e) => updateField('editedPrompt', e.target.value)}
            placeholder="프롬프트가 여기에 나타납니다..."
          />
        </div>
      )}

      {!loading && formData.geminiPrompt && (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Icons.Check className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-3">기획이 완료되었습니다! 🎉</h3>
          <p className="text-slate-500 text-lg mb-8">이제 생성된 프롬프트를 사용하여 당신만의 멋진 앱을 개발해보세요.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            새로운 기획 시작하기
          </button>
        </div>
      )}
    </div>
  );
};

export default Step6;
