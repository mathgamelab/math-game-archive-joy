
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FormData } from '../../types';
import { generateFinalPromptWithAI } from '../../services/geminiService';
import { Icons } from '../../constants';

interface Step6Props {
  formData: FormData;
  updateField: (field: string, value: any) => void;
  onReset: () => void;
}

const createDefaultPrompt = (formData: FormData): string => {
  const isAdvanced = formData.promptLevel === 'advanced';
  return `# 최종 개발 프롬프트 번들 (${isAdvanced ? '고급자용 3단계' : '초급자용 2단계'})

아래 순서대로 붙여넣어 실행하세요.

## 1차 붙여넣기 프롬프트 (게임 시스템 + UI/UX + Level 1)
\`\`\`md
당신은 시니어 프론트엔드 게임 개발자입니다.
아래 기획 정보를 누락 없이 반영해 React + Tailwind 기반의 교육용 웹게임을 구현하세요.

[반드시 반영할 입력]
- 교과/학년/성취기준/학습 목표: ${formData.subject} / ${formData.grade} / ${formData.curriculumStandard} / ${formData.learningGoal}
- 게임 컨셉: ${formData.gameConcept}
- 게임 설계: ${formData.mechanics}
- 디자인 및 분위기: ${formData.vibe}
- 핵심 로직 및 보상 체계: ${formData.structuredData.gameLogic}
- 학습 흐름 및 단계 구성: ${formData.structuredData.learningFlow}
- UI 에셋 및 시각화 계획: ${formData.structuredData.uiAssets}
- 기술 규칙: ${formData.structuredData.rules || formData.rules}

[1차 구현 목표]
1) 핵심 UI/UX 화면 구성 (시작, 플레이, 결과)
2) Level 1을 끝까지 플레이 가능한 게임 루프 구현
3) 기본 점수/보상 처리와 피드백(정답/오답/클리어) 구현
4) 데이터는 프론트엔드 코드 내 JSON 구조로 관리
${!isAdvanced ? '\nHTML 웹앱 만들어서 여기서 실행해줘' : ''}
\`\`\`

## 2차 붙여넣기 프롬프트 (보상 강화 + 다음 레벨 + 미반영 보완)
\`\`\`md
이전 결과물(1차)을 기반으로 확장 개발을 진행하세요.

[2차 구현 목표]
1) 보상 체계 강화: 콤보, 배수, 보너스, 성취 보상
2) 다음 레벨(Level 2+) 추가 및 난이도 곡선 설계
3) 1차에서 반영되지 않았던 요구사항(특히 Game Logic/UI Assets)을 모두 보완
4) 밸런싱 파라미터를 상수/설정 객체로 분리해 수정 가능하게 구성
\`\`\`${isAdvanced ? `

## 3차 붙여넣기 프롬프트 (백엔드 구성 및 연동)
\`\`\`md
이전 결과물(1차, 2차)에 얹어 백엔드 구조를 설계/구현하세요.

[3차 구현 목표]
1) 백엔드 아키텍처 제안 (예: Node.js + Express + DB)
2) API 엔드포인트 설계: 진행 저장, 점수 기록, 통계 조회
3) 데이터 스키마 설계: 사용자/세션/레벨/기록
4) 프론트엔드와의 연동 포인트 및 요청/응답 예시 제시
5) 로컬 개발/배포를 위한 최소 실행 가이드 포함
\`\`\`` : ''}

## 반영 체크리스트
- Step5의 핵심 로직 및 보상 체계 반영
- Step5의 학습 흐름 및 단계 구성 반영
- Step5의 UI 에셋 및 시각화 계획 반영
- Step5의 기술 규칙 및 제약 반영
- 성취기준/학습 목표가 게임 플레이 루프에 연결됨
- 1차/2차 순차 적용으로 점진적 완성 가능
${isAdvanced ? '- 3차 적용으로 백엔드 확장 가능' : ''}`;
};

const Step6: React.FC<Step6Props> = ({ formData, updateField, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<'all' | '1' | '2' | '3' | null>(null);
  const [lastPromptLevel, setLastPromptLevel] = useState<string | undefined>(undefined);
  const requestIdRef = useRef(0);

  useEffect(() => () => {
    requestIdRef.current += 1;
  }, []);

  const generatePrompt = async () => {
    if (!formData.promptLevel || loading) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    try {
      const result = await generateFinalPromptWithAI(formData);
      if (requestId !== requestIdRef.current) return;
      updateField('geminiPrompt', result);
      updateField('editedPrompt', result);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;
      console.error('프롬프트 생성 실패:', requestError);
      const defaultPrompt = createDefaultPrompt(formData);
      updateField('geminiPrompt', defaultPrompt);
      updateField('editedPrompt', defaultPrompt);
      setError(requestError instanceof Error
        ? requestError.message
        : '프롬프트 생성에 실패했습니다. 기본 초안을 제공했습니다.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    // promptLevel이 변경되었거나 새로 설정되었고, 프롬프트가 없을 때만 생성
    if (formData.promptLevel && formData.promptLevel !== lastPromptLevel && !loading && !formData.geminiPrompt) {
      setLastPromptLevel(formData.promptLevel);
      void generatePrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.promptLevel]);

  const extractPromptSection = (sectionNumber: '1' | '2' | '3', fullText: string): string | null => {
    const headingRegex = new RegExp(
      `##\\s*${sectionNumber}차 붙여넣기 프롬프트[\\s\\S]*?\\\`\\\`\\\`md\\n([\\s\\S]*?)\\n\\\`\\\`\\\``,
      'm'
    );
    const match = fullText.match(headingRegex);
    const content = match?.[1]?.trim();
    return content && content.length > 0 ? content : null;
  };

  const copyWithFeedback = async (text: string, target: 'all' | '1' | '2' | '3') => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  const currentPrompt = formData.editedPrompt || formData.geminiPrompt || '';
  const prompt1 = extractPromptSection('1', currentPrompt);
  const prompt2 = extractPromptSection('2', currentPrompt);
  const prompt3 = extractPromptSection('3', currentPrompt);

  return (
    <div className="space-y-8 animate-in pb-20">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">최종 프롬프트 생성 <span className="text-green-600">(Result)</span></h2>
        <p className="text-slate-600 text-lg">
          {loading
            ? 'Solar AI가 단계별 프롬프트를 생성 중입니다...'
            : error
              ? '기본 초안을 제공했습니다. 다시 생성하거나 직접 편집할 수 있습니다.'
              : '1차 → 2차(고급은 3차) 순서대로 붙여넣어 사용하세요.'}
        </p>
      </div>

      {loading ? (
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-20 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-800 font-semibold text-lg">AI가 최적화된 프롬프트를 생성하고 있습니다...</p>
        </div>
      ) : (
        <>
          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="mb-4 font-semibold text-red-700">{error}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => void generatePrompt()} className="primary-button px-5 py-2.5">
                  다시 생성
                </button>
                <button onClick={onReset} className="secondary-button px-5 py-2.5">
                  새로 시작
                </button>
              </div>
            </div>
          )}
          <div className="rounded-2xl border-2 border-slate-400 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '300px' }}>
            <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-b-2 border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-semibold text-slate-400">prompt.md</span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {isEditing ? '마크다운 편집' : '마크다운 미리보기'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditing((editing) => !editing)}
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-700 px-3 text-xs font-bold text-slate-100 transition-all hover:bg-slate-600"
                >
                  {isEditing ? '미리보기' : '편집'}
                </button>
                <button
                  onClick={() => prompt1 && copyWithFeedback(prompt1, '1')}
                  disabled={!prompt1}
                  className="inline-flex items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all bg-slate-700 hover:bg-slate-600 text-slate-100 h-8 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="1차 프롬프트만 복사"
                >
                  {copiedTarget === '1' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                  {copiedTarget === '1' ? '1차 복사됨' : '1차만'}
                </button>
                <button
                  onClick={() => prompt2 && copyWithFeedback(prompt2, '2')}
                  disabled={!prompt2}
                  className="inline-flex items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all bg-slate-700 hover:bg-slate-600 text-slate-100 h-8 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="2차 프롬프트만 복사"
                >
                  {copiedTarget === '2' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                  {copiedTarget === '2' ? '2차 복사됨' : '2차만'}
                </button>
                {prompt3 && (
                  <button
                    onClick={() => copyWithFeedback(prompt3, '3')}
                    className="inline-flex items-center justify-center gap-1 rounded-lg text-xs font-bold transition-all bg-slate-700 hover:bg-slate-600 text-slate-100 h-8 px-3"
                    title="3차 프롬프트만 복사"
                  >
                    {copiedTarget === '3' ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                    {copiedTarget === '3' ? '3차 복사됨' : '3차만'}
                  </button>
                )}
                <button 
                  onClick={() => copyWithFeedback(currentPrompt, 'all')}
                  disabled={!currentPrompt.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg text-base font-bold transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl h-10 px-6 transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="전체 프롬프트 복사"
                >
                  {copiedTarget === 'all' ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                  {copiedTarget === 'all' ? '마크다운 복사 완료!' : '마크다운 전체 복사'}
                </button>
              </div>
            </div>
            
            {isEditing ? (
              <textarea
                aria-label="마크다운 프롬프트 편집"
                className="flex-1 w-full p-8 text-sm font-mono leading-relaxed whitespace-pre-wrap text-slate-200 bg-slate-900 border-0 focus:outline-none resize-none custom-scrollbar"
                style={{ minHeight: '250px' }}
                value={currentPrompt}
                onChange={(e) => updateField('editedPrompt', e.target.value)}
                placeholder="프롬프트를 편집하세요..."
              />
            ) : (
              <div className="markdown-preview custom-scrollbar min-h-[250px] flex-1 overflow-y-auto bg-white p-6 text-slate-800 sm:p-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentPrompt}</ReactMarkdown>
              </div>
            )}
          </div>

          {currentPrompt && !error && (
            <div className="flex flex-col items-center justify-center pt-6 pb-4 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icons.Check className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2">프롬프트 생성이 완료되었습니다! 🎉</h3>
                <p className="text-slate-600 text-lg">이제 생성된 프롬프트를 사용하여 선생님만의 멋진 게임을 개발해보세요.</p>
              </div>
              <button 
                onClick={onReset}
                className="inline-flex items-center justify-center rounded-lg text-base font-semibold transition-all border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900 h-12 px-8 py-3 shadow-md hover:shadow-lg"
              >
                처음으로 돌아가기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Step6;
