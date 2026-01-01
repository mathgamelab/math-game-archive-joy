
import React, { useState } from 'react';
import { STEP_NAMES, Icons } from './constants';
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

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
    frontendPrompt: '',
    backendPrompt: ''
  });

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

  const nextStep = () => {
    if (currentStep < 6) {
      if (currentStep === 4) {
        setFormData(prev => ({
          ...prev,
          structuredData: {
            gameLogic: prev.mechanics || "사용자 인터랙션에 따른 학습 보상 체계 구축",
            learningFlow: `${prev.learningGoal} 달성을 위한 단계별 퀴즈/미션 구성`,
            uiAssets: `Vibe: ${prev.vibe}\n- 게임형 대시보드\n- 성취도 시각화 요소`,
            rules: prev.rules || "프레임워크 최적화 및 학습 데이터 무결성 유지"
          }
        }));
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1 formData={formData} setSubject={(s) => { updateField('subject', s); nextStep(); }} />;
      case 2: return <Step2 formData={formData} updateField={updateField} />;
      case 3: return <Step3 formData={formData} updateField={updateField} onNext={nextStep} />;
      case 4: return <Step4 formData={formData} updateField={updateField} />;
      case 5: return <Step5 formData={formData} updateField={updateField} />;
      case 6: return <Step6 formData={formData} updateField={updateField} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
      <Header currentStep={currentStep} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12 pb-32">
        {renderStepContent()}
      </main>

      <FooterNav 
        currentStep={currentStep} 
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

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default App;
