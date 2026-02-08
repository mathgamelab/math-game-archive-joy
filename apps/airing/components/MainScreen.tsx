import React, { useState } from 'react';
import { PERSONAS } from '../constants';
import { Difficulty, ConversationMode } from '../types';
import StatusBar from './StatusBar';
import { Settings, X, Check } from 'lucide-react';

interface MainScreenProps {
  onStart: (personaId: string, difficulty: Difficulty, mode: ConversationMode, scenario: string) => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onStart }) => {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [mode, setMode] = useState<ConversationMode>(ConversationMode.FREE);
  const [scenario, setScenario] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const difficultyLabels = {
    [Difficulty.EASY]: '초급',
    [Difficulty.MEDIUM]: '중급',
    [Difficulty.HARD]: '고급',
  };

  const modeLabels = {
    [ConversationMode.FREE]: '자유 대화 모드',
    [ConversationMode.CHOICE]: '객관식 모드',
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      <StatusBar />
      
      <div className="flex-1 px-5 sm:px-6 pt-4 sm:pt-6 overflow-y-auto pb-40">
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">AI 전화영어</h1>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Settings size={16} />
            <span className="text-xs sm:text-sm font-medium">설정 및 난이도</span>
          </button>
        </header>

        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">튜터 선택</h2>
          <div className="grid grid-cols-1 gap-2.5">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersonaId(p.id)}
                className={`p-3 sm:p-4 rounded-[1.5rem] border-2 transition-all flex items-center gap-3 sm:gap-4 ${
                  personaId === p.id 
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-gray-100">
                  {p.emoji}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-gray-900">{p.name}</span>
                    {personaId === p.id && <Check size={14} className="text-indigo-600" />}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">대화 상황 설정</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="예: 자기소개, 식당 주문 등"
              className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm placeholder:text-gray-300"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            />
          </div>
        </section>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-[2.5rem] p-6 sm:p-8 pb-10 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">학습 설정</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">학습 난이도</h4>
                <div className="flex flex-wrap gap-2">
                  {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                        difficulty === d 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {difficultyLabels[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">대화 모드</h4>
                <div className="flex flex-wrap gap-2">
                  {[ConversationMode.FREE, ConversationMode.CHOICE].map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                        mode === m 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {modeLabels[m]}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm"
              >
                설정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Button - Positioned responsively */}
      <div className="absolute bottom-10 sm:bottom-12 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={() => onStart(personaId, difficulty, mode, scenario)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all pointer-events-auto"
        >
          <div className="relative">
            <i className="fa-solid fa-phone text-2xl sm:text-3xl text-[#00FF00]"></i>
            <div className="absolute -inset-2 bg-[#00FF00]/20 rounded-full animate-ping opacity-30"></div>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default MainScreen;