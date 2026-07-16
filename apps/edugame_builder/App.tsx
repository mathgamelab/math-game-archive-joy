
import React, { useEffect, useState } from 'react';
import { FormData, SubjectType } from './types';
import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step3 from './components/steps/Step3';
import Step4 from './components/steps/Step4';
import Step5 from './components/steps/Step5';
import Step6 from './components/steps/Step6';
import Header from './components/Header';
import FooterNav from './components/FooterNav';
import IdeaBooster from './components/IdeaBooster';

const DRAFT_STORAGE_KEY = 'edugameBuilderDraftV2';

const createInitialFormData = (): FormData => ({
  subject: '',
  grade: '',
  curriculumStandard: '',
  gameConcept: '',
  learningGoal: '',
  mechanics: '',
  vibe: '',
  rules: '',
  structuredData: {
    gameLogic: '',
    learningFlow: '',
    uiAssets: '',
    rules: ''
  },
  geminiPrompt: '',
  editedPrompt: '',
  promptLevel: undefined
});

const clearEduGameStorage = () => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('gameIdeas_')) localStorage.removeItem(key);
  }
};

const loadDraft = (): { currentStep: number; formData: FormData } => {
  try {
    clearEduGameStorage();
    return { currentStep: 1, formData: createInitialFormData() };
  } catch {
    try {
      clearEduGameStorage();
    } catch {
      // 저장소 접근이 차단된 환경에서는 메모리 상태로 계속 진행합니다.
    }
    return { currentStep: 1, formData: createInitialFormData() };
  }
};

const App: React.FC = () => {
  const [initialDraft] = useState(loadDraft);
  const [currentStep, setCurrentStep] = useState(initialDraft.currentStep);
  const [formData, setFormData] = useState<FormData>(initialDraft.formData);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ currentStep, formData }));
    } catch (error) {
      console.warn('초안 저장 실패:', error);
    }
  }, [currentStep, formData]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const updateField = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [keyof FormData, string];
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const requirements: Partial<Record<number, Array<[keyof FormData, string]>>> = {
      1: [['subject', '교과를 선택해주세요.']],
      2: [
        ['curriculumStandard', '성취기준을 하나 이상 선택해주세요.'],
        ['learningGoal', '구체적인 학습 목표를 입력해주세요.']
      ],
      3: [['gameConcept', '게임 아이디어를 선택해주세요.']],
      4: [
        ['mechanics', '게임의 핵심 기능을 입력해주세요.'],
        ['vibe', '디자인 및 분위기를 입력해주세요.']
      ]
    };
    const missing = (requirements[currentStep] || []).find(([field]) => {
      const value = formData[field];
      return typeof value !== 'string' || !value.trim();
    });
    if (!missing) return true;
    setNotice(missing[1]);
    return false;
  };

  const nextStep = (level?: 'beginner' | 'advanced') => {
    if (!validateCurrentStep()) return;
    if (currentStep < 6) {
      if (currentStep === 4) {
        setFormData(prev => ({
          ...prev,
          structuredData: {
            gameLogic: prev.structuredData.gameLogic || prev.mechanics || "사용자 인터랙션에 따른 학습 보상 체계 구축",
            learningFlow: prev.structuredData.learningFlow || `${prev.learningGoal} 달성을 위한 단계별 퀴즈/미션 구성`,
            uiAssets: prev.structuredData.uiAssets || `Vibe: ${prev.vibe}\n- 게임형 대시보드\n- 성취도 시각화 요소`,
            rules: prev.structuredData.rules || prev.rules || "프레임워크 최적화 및 학습 데이터 무결성 유지"
          }
        }));
      }
      if (level) {
        setFormData(prev => ({ ...prev, promptLevel: level }));
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectSubject = (subject: SubjectType) => {
    setFormData(prev => ({ ...prev, subject }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetApp = () => {
    setFormData(createInitialFormData());
    setCurrentStep(1);
    try {
      clearEduGameStorage();
    } catch {
      // 저장소 접근이 차단되어도 앱 초기화는 유지합니다.
    }
    setNotice('새 게임 기획을 시작합니다.');
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1 formData={formData} setSubject={selectSubject} />;
      case 2: return <Step2 formData={formData} updateField={updateField} />;
      case 3: return <Step3 formData={formData} updateField={updateField} onNext={nextStep} />;
      case 4: return <Step4 formData={formData} updateField={updateField} />;
      case 5: return <Step5 formData={formData} updateField={updateField} onNext={nextStep} />;
      case 6: return <Step6 formData={formData} updateField={updateField} onReset={resetApp} />;
      default: return null;
    }
  };

  return (
    <div className="page-shell flex min-h-screen flex-col overflow-x-hidden">
      <Header currentStep={currentStep} />

      {notice && (
        <div role="alert" className="fixed left-1/2 top-4 z-[100] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-modal">
          {notice}
        </div>
      )}
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12 pb-32">
        {renderStepContent()}
      </main>

      <FooterNav 
        currentStep={currentStep}
        formData={formData}
        onNext={nextStep} 
        onPrev={prevStep} 
      />

      {currentStep >= 3 && currentStep <= 5 && (
        <IdeaBooster 
          currentStep={currentStep}
          formData={formData}
          onApply={(idea) => {
            if (currentStep === 3) {
              updateField('gameConcept', `${formData.gameConcept}\n\n💡 ${idea}`.trim());
            } else if (currentStep === 4) {
              updateField('mechanics', `${formData.mechanics}\n- ${idea}`.trim());
            } else if (currentStep === 5) {
              updateField('structuredData.gameLogic', `${formData.structuredData.gameLogic}\n\n💡 ${idea}`.trim());
            }
          }} 
        />
      )}

    </div>
  );
};

export default App;
