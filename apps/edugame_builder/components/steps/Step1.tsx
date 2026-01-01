
import React from 'react';
import { FormData, SubjectType } from '../../types';

interface Step1Props {
  formData: FormData;
  setSubject: (type: SubjectType) => void;
}

const Step1: React.FC<Step1Props> = ({ formData, setSubject }) => {
  const options: { type: SubjectType; label: string; icon: string; color: string }[] = [
    { type: '국어', label: '국어', icon: '📖', color: 'bg-red-100 text-red-600 border-red-200' },
    { type: '수학', label: '수학', icon: '📐', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { type: '사회', label: '사회', icon: '🌍', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { type: '과학', label: '과학', icon: '🧪', color: 'bg-green-100 text-green-600 border-green-200' },
    { type: '영어', label: '영어', icon: '🔤', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { type: '체육', label: '체육', icon: '⚽', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { type: '음악', label: '음악', icon: '🎵', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { type: '미술', label: '미술', icon: '🎨', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { type: '기술가정', label: '기술가정', icon: '🏠', color: 'bg-stone-100 text-stone-600 border-stone-200' },
    { type: '정보', label: '정보', icon: '💻', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    { type: '제2외국어', label: '제2외국어', icon: '🏮', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { type: '기타', label: '기타', icon: '💭', color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  return (
    <div className="space-y-8 py-8 flex flex-col items-center">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">어떤 교과를 게임으로 만들까요?</h2>
        <p className="text-slate-500 text-lg max-w-xl">기획하고 싶은 교과를 선택하면 성취기준을 불러옵니다.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl">
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setSubject(opt.type)}
            className={`
              group p-4 rounded-3xl border-2 text-center transition-all hover:scale-[1.03] hover:shadow-xl flex flex-col items-center gap-3
              ${formData.subject === opt.type ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-50' : 'border-slate-200 bg-white'}
            `}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:rotate-6 ${opt.color}`}>
              {opt.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900">{opt.label}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step1;
