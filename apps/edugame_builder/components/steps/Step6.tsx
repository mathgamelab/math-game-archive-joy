
import React, { useState } from 'react';
import { FormData } from '../../types';
import { generateFrontendPrompt, generateBackendPrompt } from '../../services/geminiService';
import { Icons } from '../../constants';

interface Step6Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
}

const Step6: React.FC<Step6Props> = ({ formData, updateField }) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend');
  const [loading, setLoading] = useState({ frontend: false, backend: false });
  const [success, setSuccess] = useState({ frontend: false, backend: false });

  const handleTabClick = async (tab: 'frontend' | 'backend') => {
    setActiveTab(tab);
    
    // 해당 탭의 프롬프트가 없으면 생성
    if (tab === 'frontend' && !formData.frontendPrompt) {
      setLoading(prev => ({ ...prev, frontend: true }));
      const result = await generateFrontendPrompt(formData);
      if (result) {
        updateField('frontendPrompt', result);
      }
      setLoading(prev => ({ ...prev, frontend: false }));
    } else if (tab === 'backend' && !formData.backendPrompt) {
      setLoading(prev => ({ ...prev, backend: true }));
      const result = await generateBackendPrompt(formData);
      if (result) {
        updateField('backendPrompt', result);
      }
      setLoading(prev => ({ ...prev, backend: false }));
    }
  };

  const handleCopy = (type: 'frontend' | 'backend') => {
    const text = type === 'frontend' ? formData.frontendPrompt : formData.backendPrompt;
    if (text) {
      navigator.clipboard.writeText(text);
      setSuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setSuccess(prev => ({ ...prev, [type]: false })), 2000);
    }
  };

  const currentPrompt = activeTab === 'frontend' ? formData.frontendPrompt : formData.backendPrompt;
  const currentLoading = activeTab === 'frontend' ? loading.frontend : loading.backend;
  const currentSuccess = activeTab === 'frontend' ? success.frontend : success.backend;

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">프롬프트 작성 <span className="text-green-600">(Prompt)</span></h2>
        <p className="text-slate-600 text-lg">프론트엔드와 백엔드 프롬프트를 생성하여 Cursor나 Windsurf에 입력하세요.</p>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => handleTabClick('frontend')}
          disabled={loading.frontend}
          className={`
            px-6 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg
            ${activeTab === 'frontend'
              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }
            ${loading.frontend ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {loading.frontend ? '생성 중...' : '프론트엔드 설계'}
        </button>
        <button
          onClick={() => handleTabClick('backend')}
          disabled={loading.backend}
          className={`
            px-6 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg
            ${activeTab === 'backend'
              ? 'bg-green-600 text-white ring-4 ring-green-100'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }
            ${loading.backend ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {loading.backend ? '생성 중...' : '백엔드 설계'}
        </button>
      </div>

      {currentLoading ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-20 flex flex-col items-center gap-6 shadow-xl">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{activeTab === 'frontend' ? '프론트엔드' : '백엔드'} 프롬프트를 생성 중입니다...</h3>
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
              <span className="ml-4 text-xs font-mono text-slate-500">
                {activeTab === 'frontend' ? 'FRONTEND_PROMPT.md' : 'BACKEND_PROMPT.md'}
              </span>
            </div>
            <button 
              onClick={() => handleCopy(activeTab)}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all transform hover:scale-105
                ${currentSuccess 
                  ? 'bg-green-600 text-white' 
                  : activeTab === 'frontend'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                }
              `}
            >
              {currentSuccess ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
              {currentSuccess ? '복사 완료!' : '클립보드 복사'}
            </button>
          </div>
          
          <textarea 
            className="flex-1 w-full bg-slate-900 p-8 text-slate-300 font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
            value={currentPrompt || ''}
            onChange={(e) => updateField(activeTab === 'frontend' ? 'frontendPrompt' : 'backendPrompt', e.target.value)}
            placeholder={`${activeTab === 'frontend' ? '프론트엔드' : '백엔드'} 프롬프트가 여기에 나타납니다...`}
          />
        </div>
      )}

      {!currentLoading && currentPrompt && (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Icons.Check className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-3">프롬프트 생성이 완료되었습니다! 🎉</h3>
          <p className="text-slate-500 text-lg mb-8">이제 생성된 프롬프트를 사용하여 당신만의 멋진 게임을 개발해보세요.</p>
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
