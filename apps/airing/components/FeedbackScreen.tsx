
import React, { useEffect, useState } from 'react';
import { Message } from '../types';
import { generateFeedback, GEMINI_API_KEY } from '../services/geminiService';
import StatusBar from './StatusBar';
import { Download, Home, FileText } from 'lucide-react';

interface FeedbackScreenProps {
  history: Message[];
  feedback: string;
  setFeedback: (f: string) => void;
  onReset: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ history, feedback, setFeedback, onReset }) => {
  const [loading, setLoading] = useState(!feedback);

  useEffect(() => {
    if (!feedback) {
      const getFeedback = async () => {
        setLoading(true);
        const apiKey = GEMINI_API_KEY;
        const fb = await generateFeedback(apiKey, history);
        setFeedback(fb);
        setLoading(false);
      };
      getFeedback();
    }
  }, [history, feedback, setFeedback]);

  const downloadLog = () => {
    let logText = 'AI 영어 대화 학습 리포트\n\n';
    history.forEach((m, i) => {
      logText += `${m.role === 'user' ? '학생' : '튜터'}: ${m.text}\n\n`;
    });
    logText += `\n--- AI 피드백 ---\n\n${feedback}`;

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `English_Lesson_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <StatusBar />
      
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="text-indigo-600" /> 학습 결과 리포트
        </h1>

        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">오늘의 대화 요약</h2>
          <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 max-h-60 overflow-y-auto space-y-3">
            {history.length > 0 ? history.map((m, i) => (
              <div key={i} className="text-sm">
                <span className={`font-bold ${m.role === 'user' ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {m.role === 'user' ? '나: ' : '튜터: '}
                </span>
                <span className="text-gray-600 leading-relaxed">{m.text}</span>
              </div>
            )) : <p className="text-gray-400 text-center py-4">대화 내역이 없습니다.</p>}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI 정밀 피드백</h2>
          <div className="bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100 min-h-[150px]">
            {loading ? (
              <div className="w-full space-y-4 py-4">
                <div className="h-3 bg-indigo-200/40 rounded-full animate-pulse w-full"></div>
                <div className="h-3 bg-indigo-200/40 rounded-full animate-pulse w-5/6"></div>
                <div className="h-3 bg-indigo-200/40 rounded-full animate-pulse w-4/6"></div>
                <p className="text-indigo-400 text-center font-bold text-sm mt-6 animate-pulse">대화 내용을 분석하여 맞춤 피드백을 생성 중입니다...</p>
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-white/0 flex flex-col gap-3">
        <button
          onClick={downloadLog}
          className="w-full py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
        >
          <Download size={18} /> 학습 리포트 저장
        </button>
        <button
          onClick={onReset}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
        >
          <Home size={18} /> 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default FeedbackScreen;
