
import React, { useState, useEffect } from 'react';
import { FormData } from '../../types';
import { Icons } from '../../constants';
import { generateGameIdeas, GameIdea } from '../../services/geminiService';

interface Step3Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
  onNext: () => void;
}

const Step3: React.FC<Step3Props> = ({ formData, updateField, onNext }) => {
  const [ideas, setIdeas] = useState<GameIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizeIdea = (idea: Partial<GameIdea>): GameIdea | null => {
    const title = typeof idea.title === 'string' ? idea.title.trim() : '';
    const description = typeof idea.description === 'string' ? idea.description.trim() : '';
    const keyFeatures = Array.isArray(idea.keyFeatures)
      ? idea.keyFeatures.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 3)
      : [];
    const curriculumAlignment = Array.isArray(idea.curriculumAlignment)
      ? idea.curriculumAlignment.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
    const classroomValue = typeof idea.classroomValue === 'string' ? idea.classroomValue.trim() : '';

    if (!title || !description || keyFeatures.length === 0) {
      return null;
    }

    return {
      title,
      description,
      keyFeatures,
      curriculumAlignment,
      classroomValue
    };
  };

  // localStorage에서 저장된 아이디어 불러오기
  const loadSavedIdeas = (): GameIdea[] | null => {
    try {
      const key = `gameIdeas_${formData.learningGoal.trim()}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (!Array.isArray(parsed)) return null;
        const normalized = parsed
          .map((item) => normalizeIdea(item as Partial<GameIdea>))
          .filter((item): item is GameIdea => item !== null);
        return normalized.length > 0 ? normalized : null;
      }
    } catch (e) {
      console.error('Failed to load saved ideas:', e);
    }
    return null;
  };

  // localStorage에 아이디어 저장
  const saveIdeas = (ideasToSave: GameIdea[]) => {
    try {
      const key = `gameIdeas_${formData.learningGoal.trim()}`;
      localStorage.setItem(key, JSON.stringify(ideasToSave));
    } catch (e) {
      console.error('Failed to save ideas:', e);
    }
  };

  const loadIdeas = async (forceRefresh: boolean = false) => {
    if (!formData.learningGoal.trim()) {
      setError('먼저 Step 2에서 구체적인 학습 목표를 입력해주세요.');
      return;
    }

    // 강제 새로고침이 아니고 저장된 아이디어가 있으면 불러오기
    if (!forceRefresh) {
      const savedIdeas = loadSavedIdeas();
      if (savedIdeas && savedIdeas.length > 0) {
        setIdeas(savedIdeas);
        
        // gameConcept가 있으면 일치하는 것을 선택
        if (formData.gameConcept.trim()) {
          const conceptTitle = getGameConceptTitle(formData.gameConcept);
          if (conceptTitle) {
            const matchedIndex = savedIdeas.findIndex(idea => idea.title === conceptTitle);
            if (matchedIndex !== -1) {
              setSelectedIndex(matchedIndex);
            }
          }
        }
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSelectedIndex(null);

    try {
      const result = await generateGameIdeas(
        formData.learningGoal,
        formData.subject,
        formData.curriculumStandard
      );

      if (result && result.length > 0) {
        const normalized = result
          .map((item) => normalizeIdea(item))
          .filter((item): item is GameIdea => item !== null);

        if (normalized.length > 0) {
          setIdeas(normalized);
          saveIdeas(normalized); // 생성된 아이디어 저장
        } else {
          setError('게임 아이디어 형식이 올바르지 않습니다. 다시 시도해주세요.');
        }
      } else {
        setError('게임 아이디어를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (requestError) {
      console.error('Game ideas generation failed:', requestError);
      setError(requestError instanceof Error ? requestError.message : '게임 아이디어 생성 요청이 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // gameConcept에서 제목 추출
  const getGameConceptTitle = (gameConcept: string): string | null => {
    if (!gameConcept.trim()) return null;
    const lines = gameConcept.split('\n').filter(l => l.trim());
    return lines.length > 0 ? lines[0].trim() : null;
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 아이디어 불러오기 또는 생성
    if (formData.learningGoal.trim()) {
      loadIdeas(false); // 저장된 것이 있으면 불러오기
    }
  }, []);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const selectedIdea = ideas[index];
    const curriculumBlock = selectedIdea.curriculumAlignment.length > 0
      ? `\n\n성취기준 반영:\n${selectedIdea.curriculumAlignment.map((item) => `- ${item}`).join('\n')}`
      : '';
    const classroomValueBlock = selectedIdea.classroomValue
      ? `\n\n수업 활용 가치:\n${selectedIdea.classroomValue}`
      : '';

    // 선택한 아이디어를 gameConcept에 저장
    const gameConceptText = `${selectedIdea.title}\n\n${selectedIdea.description}\n\n주요 특징:\n${selectedIdea.keyFeatures.map(f => `- ${f}`).join('\n')}${curriculumBlock}${classroomValueBlock}`;
    updateField('gameConcept', gameConceptText);
  };

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onNext(); // Step 4로 이동
    }
  };

  // 제목을 어절 단위로 줄바꿈하는 함수
  const formatTitle = (title: string) => {
    // 공백이 없으면 그대로 반환
    if (!title.includes(' ')) {
      return [title];
    }

    const words = title.split(' ').filter(w => w.length > 0);
    if (words.length === 0) return [title];
    
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word, index) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // 10글자 넘으면 새 줄로
      if (testLine.length > 10 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
      
      // 마지막 단어면 현재 줄 추가
      if (index === words.length - 1) {
        lines.push(currentLine);
      }
    });

    return lines.length > 0 ? lines : [title];
  };

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">게임 컨셉 선택 <span className="text-blue-600">(Concept)</span></h2>
        <p className="text-slate-600 text-lg">학습 목표를 달성하기 위한 게임 아이디어를 선택하세요.</p>
      </div>

      {/* 선택한 학습 목표 표시 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl border-2 border-blue-100 shadow-sm">
        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">선택한 학습 목표</h4>
        <p className="text-slate-700 text-lg leading-relaxed">"{formData.learningGoal || '아직 입력된 내용이 없습니다.'}"</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div role="alert" className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* 게임 아이디어 카드들 */}
      {ideas.length > 0 && (
        <div className="space-y-6">
          <div role="radiogroup" aria-label="게임 아이디어 선택" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <div
                key={index}
                onClick={() => handleSelect(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(index);
                  }
                }}
                role="radio"
                aria-checked={selectedIndex === index}
                tabIndex={0}
                className={`
                  relative bg-white rounded-3xl border-2 p-6 cursor-pointer transition-all shadow-xl
                  ${selectedIndex === index
                    ? 'border-blue-600 ring-4 ring-blue-200 scale-105'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-2xl'
                  }
                `}
              >
                {/* 선택 표시 */}
                {selectedIndex === index && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Icons.Check className="w-6 h-6 text-white stroke-[3]" />
                  </div>
                )}

                {/* 아이콘 영역 */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center text-4xl
                    ${selectedIndex === index ? 'bg-blue-100' : 'bg-slate-100'}
                    transition-colors
                  `}>
                    {index === 0 && '🎮'}
                    {index === 1 && '⚡'}
                    {index === 2 && '🌟'}
                  </div>
                </div>

                {/* 제목 */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 text-center leading-tight">
                  {formatTitle(idea.title).map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[64px]">
                  {idea.description}
                </p>

                {/* 주요 특징 */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">주요 특징</h4>
                  <ul className="space-y-1">
                    {idea.keyFeatures.map((feature, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 성취기준 반영 */}
                {idea.curriculumAlignment.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">성취기준 반영</h4>
                    <ul className="space-y-1">
                      {idea.curriculumAlignment.map((alignment, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{alignment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 수업 활용 가치 */}
                {idea.classroomValue && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">수업 활용 가치</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{idea.classroomValue}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 새로운 아이디어 찾기 버튼 */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => loadIdeas(true)}
              disabled={loading || !formData.learningGoal.trim()}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg
                ${loading || !formData.learningGoal.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>아이디어 생성 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>새로운 아이디어 찾기</span>
                </>
              )}
            </button>
          </div>

          {/* 확인 버튼 */}
          {selectedIndex !== null && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                선택한 아이디어로 진행하기 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 로딩 중일 때 */}
      {loading && ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-lg font-bold">게임 아이디어를 생성하고 있습니다...</p>
        </div>
      )}

      {/* 아이디어가 없고 로딩도 아닐 때 */}
      {!loading && ideas.length === 0 && !error && formData.learningGoal.trim() && (
        <div className="text-center py-20">
          <p className="text-slate-400">위의 버튼을 클릭하여 게임 아이디어를 생성하세요.</p>
        </div>
      )}
    </div>
  );
};

export default Step3;
