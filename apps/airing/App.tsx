import React, { useState } from 'react';
import { AppState, Difficulty, ConversationMode, Message } from './types';
import { PERSONAS } from './constants';
import MainScreen from './components/MainScreen';
import CallScreen from './components/CallScreen';
import FeedbackScreen from './components/FeedbackScreen';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    screen: 'main',
    persona: PERSONAS[0],
    difficulty: Difficulty.MEDIUM,
    mode: ConversationMode.FREE,
    scenario: '',
    history: [],
    feedback: ''
  });

  const startCall = (personaId: string, difficulty: Difficulty, mode: ConversationMode, scenario: string) => {
    const selectedPersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
    setState(prev => ({
      ...prev,
      persona: selectedPersona,
      difficulty,
      mode,
      scenario,
      history: [],
      screen: 'call'
    }));
  };

  const endCall = (history: Message[], forceMain: boolean = false) => {
    console.log('endCall 호출됨, history 길이:', history.length, 'forceMain:', forceMain);
    
    // forceMain이 true이거나, 빈 히스토리이고 현재 화면이 main이 아닌 경우에만 메인으로 이동
    // (오류 상황에서는 화면을 유지하기 위해 forceMain을 false로 전달)
    if (forceMain || (history.length === 0 && state.screen !== 'call')) {
      console.log('메인 화면으로 이동');
      setState(prev => ({
        ...prev,
        history: [],
        screen: 'main'
      }));
    } else if (history.length > 0) {
      // 정상 종료면 피드백 화면으로
      console.log('히스토리 있음 - 피드백 화면으로 이동');
      setState(prev => ({
        ...prev,
        history,
        screen: 'feedback'
      }));
    } else {
      // 빈 히스토리지만 현재 화면이 'call'이면 화면 유지 (오류 상황)
      console.log('빈 히스토리지만 통화 화면 유지 (오류 상황)');
      // 화면은 그대로 유지
    }
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      screen: 'main',
      history: [],
      feedback: ''
    }));
  };

  const setFeedback = (feedback: string) => {
    setState(prev => ({ ...prev, feedback }));
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-4 font-sans overflow-hidden">
      {/* 
        반응형 스마트폰 컨테이너 
        - 너비: 최대 420px, 모바일에서는 화면의 95%
        - 높이: 최대 850px, 모바일에서는 뷰포트 높이의 92% (dvh는 주소창 제외 실제 높이)
      */}
      <div className="relative w-[min(420px,95vw)] h-[min(850px,92dvh)] bg-white rounded-[3rem] border-[6px] sm:border-[8px] border-gray-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-500">
        
        {/* Notch with Speaker and High-Detail Camera Lens */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-44 h-6 sm:h-7 bg-gray-900 rounded-b-[1.5rem] z-20 flex items-center justify-center px-4">
            {/* Speaker Grille */}
            <div className="w-10 sm:w-14 h-1 bg-gray-800 rounded-full opacity-40 shadow-inner"></div>
            
            {/* Realistic Camera Lens */}
            <div className="absolute right-2 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#111111] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
              <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-gradient-to-b from-[#333] to-[#000] p-[1px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center relative overflow-hidden">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-tr from-[#0a0a1a] via-[#1a1a3a] to-[#050505]"></div>
                  <div className="absolute top-[20%] right-[25%] w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white/40 rounded-full blur-[0.2px]"></div>
                </div>
              </div>
            </div>
        </div>

        {/* Dynamic Screens */}
        <div className="flex-1 overflow-hidden relative">
          {state.screen === 'main' && (
            <MainScreen onStart={startCall} />
          )}
          {state.screen === 'call' && (
            <CallScreen 
              persona={state.persona} 
              mode={state.mode} 
              difficulty={state.difficulty} 
              scenario={state.scenario}
              onEnd={endCall} 
            />
          )}
          {state.screen === 'feedback' && (
            <FeedbackScreen 
              history={state.history} 
              feedback={state.feedback}
              setFeedback={setFeedback}
              onReset={reset} 
            />
          )}
        </div>

        {/* Home Indicator (Bottom Bar) */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-gray-300 rounded-full opacity-50 z-10"></div>
      </div>
    </div>
  );
};

export default App;