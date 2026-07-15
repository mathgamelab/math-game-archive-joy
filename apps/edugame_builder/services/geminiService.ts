import { FormData } from "../types";

const SOLAR_ENDPOINT = 'https://asia-northeast3-math-reading.cloudfunctions.net/callSolar';
const SOLAR_MODEL = 'solar-pro2';
const SOLAR_TIMEOUT_MS = 60_000;

const getCallableErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const error = record.error;
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (error && typeof error === 'object') {
    const errorRecord = error as Record<string, unknown>;
    if (typeof errorRecord.message === 'string' && errorRecord.message.trim()) {
      return errorRecord.message.trim();
    }
    if (typeof errorRecord.details === 'string' && errorRecord.details.trim()) {
      return errorRecord.details.trim();
    }
  }

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  return null;
};

export const callSolar = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    throw new Error('Solar 요청 프롬프트가 비어 있습니다.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SOLAR_TIMEOUT_MS);

  try {
    const response = await fetch(SOLAR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          prompt,
          model: SOLAR_MODEL,
        },
      }),
      signal: controller.signal,
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Solar 응답을 JSON으로 해석할 수 없습니다. (HTTP ${response.status})`);
    }

    const callableError = getCallableErrorMessage(payload);
    if (!response.ok || callableError) {
      throw new Error(callableError || `Solar 요청이 실패했습니다. (HTTP ${response.status})`);
    }

    const result = (payload as Record<string, unknown>)?.result;
    const reply = result && typeof result === 'object'
      ? (result as Record<string, unknown>).reply
      : undefined;

    if (typeof reply !== 'string' || !reply.trim()) {
      throw new Error('Solar 응답의 result.reply가 비어 있습니다.');
    }

    return reply.trim();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Solar 요청 시간이 60초를 초과했습니다.');
    }
    if (error instanceof Error) throw error;
    throw new Error('Solar 요청 중 알 수 없는 오류가 발생했습니다.');
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const extractJsonValue = <T>(text: string, expected: 'array' | 'object'): T => {
  const cleaned = text
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    const direct = JSON.parse(cleaned) as unknown;
    if ((expected === 'array' && Array.isArray(direct))
      || (expected === 'object' && direct !== null && typeof direct === 'object' && !Array.isArray(direct))) {
      return direct as T;
    }
  } catch {
    // 부가 텍스트가 포함된 경우 아래에서 JSON 경계를 찾아 다시 파싱합니다.
  }

  const opening = expected === 'array' ? '[' : '{';
  const closing = expected === 'array' ? ']' : '}';

  for (let start = cleaned.indexOf(opening); start !== -1; start = cleaned.indexOf(opening, start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleaned.length; index += 1) {
      const character = cleaned[index];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }

      if (character === '"') {
        inString = true;
      } else if (character === opening) {
        depth += 1;
      } else if (character === closing) {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(start, index + 1)) as T;
          } catch {
            break;
          }
        }
      }
    }
  }

  throw new Error(`Solar 응답에서 유효한 JSON ${expected === 'array' ? '배열' : '객체'}을 찾을 수 없습니다.`);
};

export const improveContentWithAI = async (type: string, toolType: string, currentValue: string, curriculumStandard?: string, gameConcept?: string): Promise<string | null> => {
  // Step 2의 "구체적인 학습 목표"는 간결하게 두 문장 정도로 압축
  let prompt: string;
  if (type === 'learningGoal') {
    if (!currentValue.trim()) return null;
    const standardsText = curriculumStandard 
      ? `\n선택한 성취기준:\n${curriculumStandard.split('\n').filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : '';
    
    prompt = `교과: "${toolType}"
현재 학습 목표: "${currentValue}"${standardsText}

위의 선택한 성취기준들을 참고하여, 이들을 아우르는 핵심 학습 목표를 간결하게 두 문장 정도로 표현해주세요. 
너무 상세하거나 긴 설명 없이, 게임의 핵심 학습 목표만 명확하고 간단하게 작성해주세요.
개선된 학습 목표만 한국어로 반환해주세요.`;
  } else if (type === 'mechanics' || type === 'vibe') {
    // Step4의 mechanics나 vibe는 생성 모드
    // currentValue가 비어있으면 gameConcept를 기반으로 생성
    const baseContent = currentValue.trim() || gameConcept || '';
    
    if (!baseContent.trim()) return null;
    
    if (type === 'mechanics') {
      prompt = `교과: "${toolType}"
게임 컨셉: "${gameConcept || ''}"

위의 게임 컨셉을 바탕으로, 교육용 웹 게임의 핵심 게임 설계(플레이 방식, 규칙, 상호작용)를 상세하게 작성해주세요.
- 게임이 어떻게 작동하는지
- 플레이어가 어떤 행동을 하는지
- 학습 목표를 달성하기 위한 게임 메커니즘
- 단계별 플레이 흐름

게임 설계 내용만 한국어로 반환해주세요.`;
    } else {
      prompt = `교과: "${toolType}"
게임 컨셉: "${gameConcept || ''}"

위의 게임 컨셉을 바탕으로, 교육용 웹 게임의 디자인 및 분위기를 상세하게 작성해주세요.
- 게임의 시각적 스타일
- 색상, 그래픽, UI 디자인 방향
- 게임의 전체적인 분위기와 느낌
- 사용자 경험(UX) 고려사항

디자인 및 분위기 내용만 한국어로 반환해주세요.`;
    }
  } else {
    if (!currentValue.trim()) return null;
    prompt = `교수학습용 게임 기획 도구의 "${type}" 내용입니다. 교과는 "${toolType}"입니다.
내용: "${currentValue}"

이 기획을 교육적으로 더 효과적이고, 학생들에게 흥미로운 게임 형태가 되도록 개선해주세요. 개선된 내용만 한국어로 반환해주세요.`;
  }

  return callSolar(prompt);
};

export interface GameIdea {
  title: string;
  description: string;
  keyFeatures: string[];
  curriculumAlignment: string[];
  classroomValue: string;
}

export const generateGameIdeas = async (learningGoal: string, subject: string, curriculumStandard?: string): Promise<GameIdea[] | null> => {
  const standards = curriculumStandard
    ? curriculumStandard.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const standardsText = standards.length > 0
    ? `\n선택한 성취기준:\n${standards.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '';

  const prompt = `교과: "${subject}"
구체적인 학습 목표: "${learningGoal}"${standardsText}

위 정보를 바탕으로, 실제 수업에서 바로 활용 가능한 "교육용 웹 게임 아이디어"를 정확히 3개 제시해주세요.

중요 품질 기준:
1) 유치하거나 과하게 장난스러운 톤을 피하고, 학년 수준에 맞는 학습 난이도와 사고 과정을 반영하세요.
2) 각 아이디어는 선택된 성취기준을 구체적으로 반영해야 합니다.
3) 세 아이디어는 서로 다른 플레이 구조(예: 전략형, 퍼즐형, 시뮬레이션형 등)로 제안하세요.
4) 웹 브라우저에서 구현 가능한 상호작용으로 설계하세요.

반드시 아래 JSON 배열 스키마만 반환하세요 (설명 문장/코드블록 금지):
[
  {
    "title": "게임 제목 (간결하고 전문적인 표현)",
    "description": "핵심 컨셉 + 학습이 일어나는 방식 (2-3문장)",
    "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
    "curriculumAlignment": [
      "성취기준 문구 A -> 게임 내 학습 행동/피드백 방식",
      "성취기준 문구 B -> 게임 내 학습 행동/피드백 방식"
    ],
    "classroomValue": "수업에서 활용할 때의 교육적 효과와 평가 가능 포인트"
  }
]

검증 규칙:
- keyFeatures는 정확히 3개
- curriculumAlignment는 최소 2개
- 각 curriculumAlignment 항목은 '->'를 포함
- "재미"보다 "학습 정렬성"을 우선하세요.`;

  const text = await callSolar(prompt);
  const parsed = extractJsonValue<unknown>(text, 'array');

  if (!Array.isArray(parsed)) {
    throw new Error('게임 아이디어 응답이 JSON 배열이 아닙니다.');
  }

  const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  };

  const normalizedIdeas = parsed
    .map((item): GameIdea | null => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;

      const title = typeof raw.title === 'string' ? raw.title.trim() : '';
      const description = typeof raw.description === 'string' ? raw.description.trim() : '';
      const keyFeatures = normalizeStringArray(raw.keyFeatures).slice(0, 3);
      const curriculumAlignment = normalizeStringArray(raw.curriculumAlignment);
      const classroomValue = typeof raw.classroomValue === 'string' ? raw.classroomValue.trim() : '';

      const hasEnoughAlignment = standards.length > 0
        ? curriculumAlignment.length >= 2
        : curriculumAlignment.length >= 1;

      if (!title || !description || keyFeatures.length < 3 || !hasEnoughAlignment || !classroomValue) {
        return null;
      }

      return {
        title,
        description,
        keyFeatures,
        curriculumAlignment,
        classroomValue
      };
    })
    .filter((idea): idea is GameIdea => idea !== null);

  if (normalizedIdeas.length === 0) {
    throw new Error('정규화 후 유효한 게임 아이디어가 없습니다.');
  }

  return normalizedIdeas.slice(0, 3);
};

export const generateImprovementIdeas = async (formData: FormData, currentStep: number): Promise<string[] | null> => {
  let prompt: string;

  if (currentStep === 3) {
    // Step 3: 게임 컨셉 개선 아이디어
    prompt = `교과: "${formData.subject}"
학습 목표: "${formData.learningGoal}"
${formData.curriculumStandard ? `성취기준: "${formData.curriculumStandard}"` : ''}
${formData.gameConcept ? `현재 게임 컨셉: "${formData.gameConcept}"` : ''}

위의 게임 기획 내용을 분석하여, 게임 컨셉을 개선할 수 있는 간단한 아이디어 3-5개를 제시해주세요.
각 아이디어는 한 문장으로 간결하고 실용적으로 작성해주세요.

JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else if (currentStep === 4) {
    // Step 4: 게임 설계 개선 아이디어
    prompt = `교과: "${formData.subject}"
학습 목표: "${formData.learningGoal}"
게임 컨셉: "${formData.gameConcept}"
게임 설계: "${formData.mechanics}"
디자인 및 분위기: "${formData.vibe}"

위의 게임 기획 내용을 분석하여, 게임 설계나 디자인을 개선할 수 있는 간단한 아이디어 3-5개를 제시해주세요.
각 아이디어는 한 문장으로 간결하고 실용적으로 작성해주세요.

JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else if (currentStep === 5) {
    // Step 5: 전체 기획 개선 아이디어
    prompt = `교과: "${formData.subject}"
학습 목표: "${formData.learningGoal}"
게임 컨셉: "${formData.gameConcept}"
게임 설계: "${formData.mechanics}"
디자인 및 분위기: "${formData.vibe}"
게임 로직: "${formData.structuredData.gameLogic}"
학습 흐름: "${formData.structuredData.learningFlow}"
UI 에셋: "${formData.structuredData.uiAssets}"
기술 규칙: "${formData.structuredData.rules || formData.rules}"

위의 전체 게임 기획 내용을 분석하여, 게임 로직이나 구조를 개선할 수 있는 간단한 아이디어 3-5개를 제시해주세요.
각 아이디어는 한 문장으로 간결하고 실용적으로 작성해주세요.

JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else {
    return null;
  }

  const text = await callSolar(prompt);

  try {
    const ideas = extractJsonValue<unknown[]>(text, 'array');
    const normalized = ideas
      .map((idea) => (typeof idea === 'string' ? idea.trim() : ''))
      .filter((idea) => idea.length > 0)
      .slice(0, 5);
    if (normalized.length > 0) return normalized;
  } catch {
    // JSON이 아닌 목록 응답은 기존 줄바꿈 기반 정규화를 사용합니다.
  }

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^[\[\],"]+$/))
    .map(line => line.replace(/^[-•*]\s*/, '').replace(/^["']|["']$/g, '').trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('Solar 응답에서 개선 아이디어를 찾을 수 없습니다.');
  }
  return lines.slice(0, 5);
};

export const generateFinalPromptWithAI = async (formData: FormData): Promise<string> => {
  const isAdvanced = formData.promptLevel === 'advanced';
  const modeLabel = isAdvanced ? '고급자용(프론트+백엔드)' : '초급자용(프론트엔드)';

  const promptInput = `
당신은 교육용 게임 기획 문서를 Cursor/Windsurf용 실행 프롬프트로 변환하는 시니어 프롬프트 엔지니어입니다.
아래 입력을 분석해 "${modeLabel}" 최종 프롬프트 번들을 생성하세요.

# 입력 데이터
교과: ${formData.subject}
학년: ${formData.grade}
성취기준: ${formData.curriculumStandard}
학습 목표: ${formData.learningGoal}
게임 컨셉: ${formData.gameConcept}
게임 설계: ${formData.mechanics}
디자인 및 분위기: ${formData.vibe}
핵심 로직 및 보상 체계 (Game Logic): ${formData.structuredData.gameLogic}
학습 흐름 및 단계 구성 (Learning Flow): ${formData.structuredData.learningFlow}
UI 에셋 및 시각화 계획 (UI Assets): ${formData.structuredData.uiAssets}
기술 규칙: ${formData.structuredData.rules || formData.rules}

# 절대 규칙 (중요)
1) "핵심 로직 및 보상 체계", "학습 흐름 및 단계 구성", "UI 에셋 및 시각화 계획", "기술 규칙"을 절대 축약/생략하지 말고 프롬프트 본문에 직접 반영하세요.
2) 모호하면 내용을 버리지 말고 "TODO(확인 필요)" 형태로 남기되, 왜 필요한지 근거를 함께 적으세요.
3) 프롬프트 1, 2는 항상 프론트엔드 전용(React + Tailwind + 브라우저 실행)으로 작성하세요.
4) 데이터는 프론트엔드 코드 내 JSON/배열 기반으로 관리하도록 지시하세요.
5) 출력은 반드시 JSON 객체 하나만 반환하세요. (코드블록/설명 문장 금지)
6) prompt1, prompt2${isAdvanced ? ', prompt3' : ''}, coverageChecklist는 모두 한국어로 작성하세요. (기술 키워드/라이브러리명만 예외적으로 영어 허용)

# 프롬프트 설계 목표
- prompt1(1차 붙여넣기): 게임 시스템의 기본 UI/UX, 핵심 루프, Level 1 완성까지 구현.
- prompt2(2차 붙여넣기): 보상 체계 강화, 다음 레벨 확장, prompt1에서 미반영되었거나 보완할 내용 구현.
${isAdvanced ? '- prompt3(3차 붙여넣기): prompt1/2에 얹는 백엔드 구성도 + API/DB/연동 구현 프롬프트.' : ''}

# JSON 출력 스키마
{
  "prompt1": "string",
  "prompt2": "string",
  ${isAdvanced ? '"prompt3": "string",' : ''}
  "coverageChecklist": [
    "입력 데이터 항목 -> 어느 프롬프트에서 어떻게 반영했는지"
  ]
}

# 품질 검증
- prompt1, prompt2${isAdvanced ? ', prompt3' : ''}는 모두 비어 있으면 안 됩니다.
- prompt1에는 Level 1의 승/패 조건, 점수/보상 기본 루프, 핵심 UI 화면 정의가 포함되어야 합니다.
- prompt2에는 레벨 확장 계획과 보상 체계 고도화가 반드시 포함되어야 합니다.
${isAdvanced ? '- prompt3에는 백엔드 아키텍처, 엔드포인트, 데이터 스키마, 프론트 연동 포인트가 포함되어야 합니다.' : ''}
- coverageChecklist는 최소 6개 이상 작성하세요.
- 모든 문장은 한국어 중심으로 작성하세요.
`;

  const formatFinalPromptBundle = (
    prompt1: string,
    prompt2: string,
    prompt3: string | null,
    checklist: string[],
    isAdvancedMode: boolean
  ): string => {
    const section3 = isAdvancedMode && prompt3
      ? `\n## 3차 붙여넣기 프롬프트 (백엔드 구성 및 연동)\n\`\`\`md\n${prompt3}\n\`\`\`\n`
      : '';
    const checklistText = checklist.length > 0
      ? checklist.map((item) => `- ${item}`).join('\n')
      : '- 반영 체크리스트를 생성하지 못했습니다. Step5 입력값 반영 여부를 수동 확인하세요.';

    return `# 최종 개발 프롬프트 번들 (${isAdvancedMode ? '고급자용 3단계' : '초급자용 2단계'})

아래 순서대로 붙여넣어 실행하세요.

## 1차 붙여넣기 프롬프트 (게임 시스템 + UI/UX + Level 1)
\`\`\`md
${prompt1}
\`\`\`

## 2차 붙여넣기 프롬프트 (보상 강화 + 다음 레벨 + 미반영 보완)
\`\`\`md
${prompt2}
\`\`\`${section3}
## 반영 체크리스트
${checklistText}
`;
  };

  const rawText = await callSolar(promptInput);
  const parsed = extractJsonValue<Record<string, unknown>>(rawText, 'object');

  const prompt1 = typeof parsed.prompt1 === 'string' ? parsed.prompt1.trim() : '';
  const prompt2 = typeof parsed.prompt2 === 'string' ? parsed.prompt2.trim() : '';
  const prompt3 = typeof parsed.prompt3 === 'string' ? parsed.prompt3.trim() : '';
  const checklist = Array.isArray(parsed.coverageChecklist)
    ? parsed.coverageChecklist
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0)
    : [];

  if (!prompt1 || !prompt2) {
    throw new Error('최종 프롬프트 번들에 prompt1 또는 prompt2가 없습니다.');
  }

  if (isAdvanced && !prompt3) {
    throw new Error('고급자용 최종 프롬프트 번들에 prompt3가 없습니다.');
  }

  return formatFinalPromptBundle(
    prompt1,
    prompt2,
    isAdvanced ? prompt3 : null,
    checklist,
    isAdvanced
  );
};
