
import React, { useState, useEffect } from 'react';
import { FormData } from '../../types';
import { Icons } from '../../constants';
import {
  generateGameIdeas,
  generatePlanningQuestions,
  getFallbackPlanningQuestions,
  GameIdea,
  PlanningQuestion,
  stripMarkdownFormatting,
} from '../../services/geminiService';

interface Step3Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
  onNext: () => void;
}

const Step3: React.FC<Step3Props> = ({ formData, updateField, onNext }) => {
  const [ideas, setIdeas] = useState<GameIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [questions, setQuestions] = useState<PlanningQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answerDraft, setAnswerDraft] = useState('');
  const [hasRequestedIdeas, setHasRequestedIdeas] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createFingerprint = (value: string): string => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    return Math.abs(hash).toString(36);
  };

  const planningContext = [
    formData.subject,
    formData.learningGoal.trim(),
    formData.curriculumStandard.trim(),
  ].join('|');
  const planningStorageKey = `gamePlanning_${createFingerprint(planningContext)}`;

  const buildPlanningBrief = (
    planningQuestions: PlanningQuestion[] = questions,
    planningAnswers: string[] = answers,
  ): string => planningQuestions
    .map((question, index) => {
      const answer = planningAnswers[index]?.trim();
      return answer ? `${question.question}\n${answer}` : '';
    })
    .filter(Boolean)
    .join('\n\n');

  const savePlanningSession = (
    nextQuestions: PlanningQuestion[],
    nextAnswers: string[],
    nextQuestionIndex: number,
    generated: boolean,
  ) => {
    try {
      localStorage.setItem(planningStorageKey, JSON.stringify({
        questions: nextQuestions,
        answers: nextAnswers,
        currentQuestion: nextQuestionIndex,
        generated,
      }));
    } catch (storageError) {
      console.warn('기획 대화 저장 실패:', storageError);
    }
  };

  const normalizeIdea = (idea: Partial<GameIdea>): GameIdea | null => {
    const category = idea.category === 'safe' || idea.category === 'immersive' || idea.category === 'experimental'
      ? idea.category
      : null;
    const title = typeof idea.title === 'string' ? stripMarkdownFormatting(idea.title) : '';
    const gameConcept = typeof idea.gameConcept === 'string' ? stripMarkdownFormatting(idea.gameConcept) : '';
    const description = typeof idea.description === 'string' ? stripMarkdownFormatting(idea.description) : '';
    const coreLoop = typeof idea.coreLoop === 'string' ? stripMarkdownFormatting(idea.coreLoop) : '';
    const learningEvidence = typeof idea.learningEvidence === 'string' ? stripMarkdownFormatting(idea.learningEvidence) : '';
    const keyFeatures = Array.isArray(idea.keyFeatures)
      ? idea.keyFeatures
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map(stripMarkdownFormatting)
          .slice(0, 3)
      : [];
    const curriculumAlignment = Array.isArray(idea.curriculumAlignment)
      ? idea.curriculumAlignment
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map(stripMarkdownFormatting)
      : [];
    const classroomValue = typeof idea.classroomValue === 'string' ? stripMarkdownFormatting(idea.classroomValue) : '';
    const rendering = idea.rendering === '2D' || idea.rendering === '2.5D' || idea.rendering === '3D'
      ? idea.rendering
      : '2D';
    const complexity = idea.complexity === '낮음' || idea.complexity === '중간' || idea.complexity === '높음'
      ? idea.complexity
      : '중간';
    const techApproach = typeof idea.techApproach === 'string' ? stripMarkdownFormatting(idea.techApproach) : '';
    const risk = typeof idea.risk === 'string' ? stripMarkdownFormatting(idea.risk) : '';
    const fallback = typeof idea.fallback === 'string' ? stripMarkdownFormatting(idea.fallback) : '';

    if (!category || !title || !gameConcept || !description || !coreLoop || !learningEvidence || keyFeatures.length === 0
      || !techApproach || !risk || !fallback) {
      return null;
    }

    return {
      category,
      title,
      gameConcept,
      description,
      coreLoop,
      learningEvidence,
      keyFeatures,
      curriculumAlignment,
      classroomValue,
      rendering,
      techApproach,
      complexity,
      risk,
      fallback,
    };
  };

  // localStorage에서 저장된 아이디어 불러오기
  const getIdeasStorageKey = (planningBrief: string): string => {
    const keySource = `${planningContext}|${planningBrief.trim()}`;
    return `gameIdeas_${createFingerprint(keySource)}`;
  };

  const loadSavedIdeas = (planningBrief: string): GameIdea[] | null => {
    try {
      const key = getIdeasStorageKey(planningBrief);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (!Array.isArray(parsed)) return null;
        const normalized = parsed
          .map((item) => normalizeIdea(item as Partial<GameIdea>))
          .filter((item): item is GameIdea => item !== null);
        const hasRequiredCategories = normalized.length === 3
          && normalized[0].category === 'safe'
          && normalized[1].category === 'immersive'
          && normalized[2].category === 'experimental';
        return hasRequiredCategories ? normalized : null;
      }
    } catch (e) {
      console.error('Failed to load saved ideas:', e);
    }
    return null;
  };

  // localStorage에 아이디어 저장
  const saveIdeas = (ideasToSave: GameIdea[], planningBrief: string) => {
    try {
      const key = getIdeasStorageKey(planningBrief);
      localStorage.setItem(key, JSON.stringify(ideasToSave));
    } catch (e) {
      console.error('Failed to save ideas:', e);
    }
  };

  const loadIdeas = async (forceRefresh: boolean = false, planningBrief = buildPlanningBrief()) => {
    if (!formData.learningGoal.trim()) {
      setError('먼저 Step 2에서 구체적인 학습 목표를 입력해주세요.');
      return;
    }

    // 강제 새로고침이 아니고 저장된 아이디어가 있으면 불러오기
    if (!forceRefresh) {
      const savedIdeas = loadSavedIdeas(planningBrief);
      if (savedIdeas && savedIdeas.length > 0) {
        setIdeas(savedIdeas);
        setHasRequestedIdeas(true);
        
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
    setHasRequestedIdeas(true);
    setError(null);
    setSelectedIndex(null);
    if (questions.length > 0) {
      savePlanningSession(questions, answers, questions.length, true);
    }

    try {
      const result = await generateGameIdeas(
        formData.learningGoal,
        formData.subject,
        formData.curriculumStandard,
        planningBrief,
      );

      if (result && result.length > 0) {
        const normalized = result
          .map((item) => normalizeIdea(item))
          .filter((item): item is GameIdea => item !== null);

        if (normalized.length > 0) {
          setIdeas(normalized);
          saveIdeas(normalized, planningBrief); // 생성된 아이디어 저장
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
    if (!formData.learningGoal.trim()) return;

    const initializePlanning = async () => {
      try {
        const saved = localStorage.getItem(planningStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            questions?: PlanningQuestion[];
            answers?: string[];
            currentQuestion?: number;
            generated?: boolean;
          };
          const savedQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
          const savedAnswers = Array.isArray(parsed.answers) ? parsed.answers : [];
          if (savedQuestions.length === 4) {
            const nextQuestionIndex = typeof parsed.currentQuestion === 'number'
              ? Math.min(savedQuestions.length, Math.max(0, parsed.currentQuestion))
              : 0;
            setQuestions(savedQuestions);
            setAnswers(savedAnswers);
            setCurrentQuestion(nextQuestionIndex);
            if (parsed.generated) {
              const brief = buildPlanningBrief(savedQuestions, savedAnswers);
              setHasRequestedIdeas(true);
              await loadIdeas(false, brief);
            }
            return;
          }
        }
      } catch (storageError) {
        console.warn('저장된 기획 대화를 불러오지 못했습니다:', storageError);
      }

      setPlanningLoading(true);
      try {
        const generatedQuestions = await generatePlanningQuestions(
          formData.learningGoal,
          formData.subject,
          formData.curriculumStandard,
        );
        setQuestions(generatedQuestions);
        setAnswers(Array(generatedQuestions.length).fill(''));
        savePlanningSession(generatedQuestions, Array(generatedQuestions.length).fill(''), 0, false);
      } catch (requestError) {
        console.warn('맞춤 기획 질문 생성 실패, 기본 질문을 사용합니다:', requestError);
        const fallbackQuestions = getFallbackPlanningQuestions();
        setQuestions(fallbackQuestions);
        setAnswers(Array(fallbackQuestions.length).fill(''));
        savePlanningSession(fallbackQuestions, Array(fallbackQuestions.length).fill(''), 0, false);
      } finally {
        setPlanningLoading(false);
      }
    };

    void initializePlanning();
  }, []);

  const submitAnswer = (answer: string) => {
    const trimmed = answer.trim();
    const question = questions[currentQuestion];
    if (!question || (!trimmed && !question.optional)) return;

    const nextAnswers = [...answers];
    nextAnswers[currentQuestion] = trimmed;
    const nextQuestionIndex = currentQuestion + 1;
    setAnswers(nextAnswers);
    setCurrentQuestion(nextQuestionIndex);
    setAnswerDraft(nextAnswers[nextQuestionIndex] || '');
    savePlanningSession(questions, nextAnswers, nextQuestionIndex, false);
  };

  const handleAIRecommendation = () => {
    submitAnswer('구체적인 방향은 AI가 성취기준과 학습 목표에 맞춰 추천해주세요.');
  };

  const restartPlanning = () => {
    setIdeas([]);
    setSelectedIndex(null);
    setHasRequestedIdeas(false);
    setAnswers(Array(questions.length).fill(''));
    setCurrentQuestion(0);
    setAnswerDraft('');
    setError(null);
    updateField('gameConcept', '');
    savePlanningSession(questions, Array(questions.length).fill(''), 0, false);
  };

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
    const gameConceptText = `${selectedIdea.title}

${selectedIdea.gameConcept}

요약:
${selectedIdea.description}

핵심 플레이 루프:
${selectedIdea.coreLoop}

학습 확인:
${selectedIdea.learningEvidence}

주요 특징:
${selectedIdea.keyFeatures.map(f => `- ${f}`).join('\n')}

구현 방식:
- 표현: ${selectedIdea.rendering}
- 기술: ${selectedIdea.techApproach}
- 난이도: ${selectedIdea.complexity}
- 위험: ${selectedIdea.risk}
- 간소화 대안: ${selectedIdea.fallback}${curriculumBlock}${classroomValueBlock}`;
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
        <p className="text-slate-600 text-lg">AI와 짧게 이야기한 뒤 우리 수업에 맞는 게임 아이디어를 만들어보세요.</p>
      </div>

      {/* 선택한 학습 목표 표시 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl border-2 border-blue-100 shadow-sm">
        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">선택한 학습 목표</h4>
        <p className="text-slate-700 text-lg leading-relaxed">"{formData.learningGoal || '아직 입력된 내용이 없습니다.'}"</p>
      </div>

      {/* 게임 기획 대화 */}
      {ideas.length === 0 && !hasRequestedIdeas && (
        <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <Icons.Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">AI 게임 기획 대화</h3>
                <p className="text-xs text-slate-500">예시를 고쳐 쓰거나 자유롭게 답할 수 있어요.</p>
              </div>
            </div>
            {questions.length > 0 && currentQuestion < questions.length && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {currentQuestion + 1} / {questions.length}
              </span>
            )}
          </div>

          {planningLoading && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="font-bold text-slate-600">성취기준에 어울리는 질문을 준비하고 있어요...</p>
            </div>
          )}

          {!planningLoading && questions.length > 0 && currentQuestion < questions.length && (
            <div className="space-y-6 p-5 md:p-7">
              {answers.slice(0, currentQuestion).map((answer, index) => answer && (
                <div key={questions[index].id} className="space-y-2">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                    {questions[index].question}
                  </div>
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-blue-600 px-4 py-3 text-sm text-white">
                    {answer}
                  </div>
                </div>
              ))}

              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-4 text-slate-800">
                <p className="font-bold leading-relaxed">{questions[currentQuestion].question}</p>
                {questions[currentQuestion].optional && (
                  <p className="mt-1 text-xs text-slate-500">선택 질문이에요. 떠오르는 것이 없다면 건너뛰어도 괜찮아요.</p>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">이런 식으로 답해보세요</p>
                <div className="flex flex-wrap gap-2">
                  {questions[currentQuestion].suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setAnswerDraft(suggestion)}
                      className={`rounded-full border px-4 py-2 text-left text-sm font-semibold transition-colors ${
                        answerDraft === suggestion
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitAnswer(answerDraft);
                }}
              >
                <textarea
                  value={answerDraft}
                  onChange={(event) => setAnswerDraft(event.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="예시를 선택하거나 자유롭게 적어주세요…"
                  className="w-full resize-none rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleAIRecommendation}
                    className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    잘 모르겠어요, AI가 추천해줘
                  </button>
                  <div className="flex gap-2">
                    {questions[currentQuestion].optional && (
                      <button
                        type="button"
                        onClick={() => submitAnswer('')}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                      >
                        건너뛰기
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!answerDraft.trim()}
                      className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition ${
                        answerDraft.trim()
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'cursor-not-allowed bg-slate-300'
                      }`}
                    >
                      {currentQuestion === questions.length - 1 ? '대화 마치기' : '답하고 다음'}
                    </button>
                  </div>
                </div>
              </form>

              {currentQuestion === 0 && (
                <div className="border-t border-slate-100 pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => loadIdeas(true, '')}
                    className="text-sm font-bold text-slate-400 underline decoration-slate-300 underline-offset-4 hover:text-slate-600"
                  >
                    대화 없이 바로 아이디어 만들기
                  </button>
                </div>
              )}
            </div>
          )}

          {!planningLoading && questions.length > 0 && currentQuestion >= questions.length && (
            <div className="space-y-5 p-5 md:p-7">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Icons.Check className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">원하는 게임의 모습이 잡혔어요</h3>
                <p className="mt-1 text-sm text-slate-500">이 대화를 학습 목표와 성취기준에 함께 반영할게요.</p>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 md:p-5">
                {questions.map((question, index) => answers[index]?.trim() && (
                  <div key={question.id} className="flex gap-3 text-sm">
                    <span className="mt-0.5 text-blue-500">●</span>
                    <div>
                      <p className="font-bold text-slate-700">{question.question}</p>
                      <p className="mt-0.5 leading-relaxed text-slate-600">{answers[index]}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswerDraft(answers[0] || '');
                  }}
                  className="rounded-2xl border-2 border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50"
                >
                  답변 수정하기
                </button>
                <button
                  type="button"
                  onClick={() => loadIdeas(true, buildPlanningBrief())}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700 hover:scale-105"
                >
                  <Icons.Sparkles className="h-5 w-5" />
                  이 내용으로 게임 컨셉 만들기
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div role="alert" className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* 게임 아이디어 카드들 */}
      {ideas.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-blue-900">기획 대화를 반영한 게임 컨셉이에요.</p>
              <p className="text-sm text-blue-700">마음에 드는 아이디어를 하나 선택해주세요.</p>
            </div>
            <button
              type="button"
              onClick={restartPlanning}
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100"
            >
              기획 대화 다시 하기
            </button>
          </div>
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

                {/* 게임 컨셉 */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[64px]">
                  {idea.gameConcept}
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
      {!loading && !planningLoading && hasRequestedIdeas && ideas.length === 0 && !error && formData.learningGoal.trim() && (
        <div className="text-center py-20">
          <p className="text-slate-400">게임 아이디어를 생성하지 못했습니다. 다시 시도해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default Step3;
