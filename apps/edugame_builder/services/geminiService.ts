import { FormData } from "../types";

const SOLAR_ENDPOINT = 'https://asia-northeast3-math-reading.cloudfunctions.net/callSolar';
const SOLAR_MODEL = 'solar-pro3';
const SOLAR_TIMEOUT_MS = 180_000;

export const stripMarkdownFormatting = (value: string): string => value
  .replace(/```(?:\w+)?\s*([\s\S]*?)```/g, '$1')
  .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/^>\s?/gm, '')
  .replace(/^\s*[-*+]\s+/gm, '• ')
  .replace(/(\*\*|__)(.*?)\1/g, '$2')
  .replace(/~~(.*?)~~/g, '$1')
  .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
  .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1$2')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/[ \t]+$/gm, '')
  .trim();

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
      throw new Error('Solar 요청 시간이 180초를 초과했습니다.');
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

export const improveContentWithAI = async (
  type: string,
  toolType: string,
  currentValue: string,
  curriculumStandard?: string,
  gameConcept?: string,
  refinement?: 'shorter' | 'alternative'
): Promise<string | null> => {
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
마크다운 기호(별표, 제목 기호, 코드 블록)를 사용하지 말고 개선된 학습 목표만 일반 텍스트로 반환해주세요.`;
  } else if (type === 'mechanics' || type === 'vibe') {
    // Step4의 mechanics나 vibe는 생성 모드
    // currentValue가 비어있으면 gameConcept를 기반으로 생성
    const baseContent = currentValue.trim() || gameConcept || '';
    
    if (!baseContent.trim()) return null;
    
    if (type === 'mechanics') {
      prompt = `교과: "${toolType}"
게임 컨셉: "${gameConcept || ''}"
${currentValue.trim() ? `현재 핵심 기능:\n${currentValue}` : ''}

위 게임 컨셉을 한 번에 구현 가능한 교육용 웹 게임의 핵심 기능으로 정리하세요.
- 350~650자, 최대 5개 항목
- 핵심 플레이 루프, 입력과 반응, 점수/완료 조건, 학습 피드백만 포함
- 선택 학년을 벗어나는 콘텐츠와 로그인, 서버, 교사용 대시보드, AR, 다국어, 멀티플레이는 추가하지 않음
- 디자인 설명, 확장 아이디어, 인사말, 추가 제안은 작성하지 않음
- 구체적인 기본값을 정하고 TODO나 선택지를 남기지 않음
${refinement === 'shorter' ? '- 이전 결과보다 절반 정도 짧게 핵심만 다시 작성' : ''}
${refinement === 'alternative' ? '- 같은 학습 목표를 유지하면서 핵심 상호작용을 다른 방식으로 제안' : ''}

짧은 제목과 목록을 사용한 한국어 마크다운만 반환하세요.`;
    } else {
      prompt = `교과: "${toolType}"
게임 컨셉: "${gameConcept || ''}"
${currentValue.trim() ? `현재 디자인 및 분위기:\n${currentValue}` : ''}

위 게임 컨셉을 한 번에 구현 가능한 디자인 명세로 정리하세요.
- 300~600자, 최대 5개 항목
- 시각 스타일, 핵심 색상 3~5개, 화면 배치, 피드백 효과, 접근성만 포함
- 외부 이미지·3D 모델 없이 CSS, SVG, 기본 도형으로 구현 가능한 방향
- 교사용 대시보드, 별도 URL, Figma 파일, AR, 다국어 등 요청하지 않은 기능은 추가하지 않음
- 핵심 기능과 게임 규칙을 반복하지 않음
- 구체적인 기본값을 정하고 TODO나 선택지를 남기지 않음
${refinement === 'shorter' ? '- 이전 결과보다 절반 정도 짧게 핵심만 다시 작성' : ''}
${refinement === 'alternative' ? '- 같은 컨셉을 유지하면서 색상과 분위기를 다른 방향으로 제안' : ''}

짧은 제목과 목록을 사용한 한국어 마크다운만 반환하세요.`;
    }
  } else {
    if (!currentValue.trim()) return null;
    prompt = `교수학습용 게임 기획 도구의 "${type}" 내용입니다. 교과는 "${toolType}"입니다.
내용: "${currentValue}"

이 기획을 교육적으로 더 효과적이고, 학생들에게 흥미로운 게임 형태가 되도록 개선해주세요. 마크다운 기호 없이 개선된 내용만 일반 텍스트 한국어로 반환해주세요.`;
  }

  let result = await callSolar(prompt);
  if ((type === 'mechanics' || type === 'vibe') && result.length > 900) {
    result = await callSolar(`아래 교육용 게임 명세를 핵심 요구사항을 유지하면서 600자 이내, 최대 5개 항목의 한국어 마크다운으로 압축하세요.
새로운 기능이나 설명을 추가하지 말고 인사말과 마무리 문장을 제거하세요.

${result}`);
  }
  return type === 'mechanics' || type === 'vibe'
    ? result.trim()
    : stripMarkdownFormatting(result);
};

export interface GameIdea {
  category: 'safe' | 'immersive' | 'experimental';
  title: string;
  gameConcept: string;
  description: string;
  coreLoop: string;
  learningEvidence: string;
  keyFeatures: string[];
  curriculumAlignment: string[];
  classroomValue: string;
  rendering: '2D' | '2.5D' | '3D';
  techApproach: string;
  complexity: '낮음' | '중간' | '높음';
  risk: string;
  fallback: string;
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

위 정보를 바탕으로 실제 수업과 웹 브라우저에서 구현 가능한 교육용 게임 아이디어를 정확히 3개 제시하세요.

중요 품질 기준:
1) safe: 수업에서 바로 쓸 수 있는 낮은 구현 위험의 2D 아이디어
2) immersive: 시뮬레이션, 2.5D 또는 3D가 학습 이해에 실제로 도움이 되는 아이디어
3) experimental: 새로운 상호작용을 사용하되 간소화 대안을 함께 제시하는 아이디어
4) 세 아이디어의 핵심 플레이 행동은 서로 달라야 합니다.
5) 3D는 공간 조작 자체가 학습에 도움이 될 때만 사용하세요. 장식 목적의 3D는 금지합니다.
6) 외부 3D 모델, 유료 에셋, 로그인, 서버, 멀티플레이 없이 구현 가능한 범위로 제한하세요.
7) 모든 제목과 설명은 자연스러운 한국어로 작성하세요.
8) description은 2문장 이내, 나머지 문자열 필드는 각각 1문장으로 간결하게 작성하세요.
9) 유치하거나 과하게 장난스러운 톤을 피하고 선택 학년의 난이도와 사고 과정을 반영하세요.
10) 각 아이디어의 gameConcept에는 게임의 배경, 목표, 학습이 일어나는 방식을 구체적으로 설명하세요.
11) 선택된 모든 성취기준을 curriculumAlignment에 빠짐없이 넣고, 원문을 그대로 쓴 뒤 '->' 다음에 게임 행동과 피드백을 연결하세요.
12) 웹 브라우저에서 실제 구현 가능한 상호작용으로 설계하세요.

반드시 아래 JSON 배열 스키마만 반환하세요 (설명 문장/코드블록/마크다운 강조 기호 금지):
[
  {
    "category": "safe",
    "title": "게임 제목 (간결한 한국어)",
    "gameConcept": "게임의 배경, 목표, 학습이 일어나는 방식",
    "description": "핵심 컨셉과 학습 방식 (2문장 이내)",
    "coreLoop": "학생이 반복하는 핵심 행동",
    "learningEvidence": "학습 목표 달성을 확인하는 구체적인 행동이나 결과",
    "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
    "curriculumAlignment": [
      "성취기준 문구 -> 게임 내 학습 행동과 피드백 방식"
    ],
    "classroomValue": "수업 활용 및 평가 포인트",
    "rendering": "2D",
    "techApproach": "SVG 또는 Canvas 등 구현 방식",
    "complexity": "낮음",
    "risk": "가장 큰 구현 위험",
    "fallback": "위험 발생 시 적용할 간소화 버전"
  },
  {
    "category": "immersive",
    "title": "게임 제목",
    "gameConcept": "게임의 배경, 목표, 학습이 일어나는 방식",
    "description": "핵심 컨셉과 학습 방식",
    "coreLoop": "학생이 반복하는 핵심 행동",
    "learningEvidence": "학습 목표 달성을 확인하는 행동이나 결과",
    "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
    "curriculumAlignment": ["성취기준 문구 -> 학습 행동과 피드백"],
    "classroomValue": "수업 활용 및 평가 포인트",
    "rendering": "2D",
    "techApproach": "구현 방식",
    "complexity": "중간",
    "risk": "가장 큰 구현 위험",
    "fallback": "간소화 버전"
  },
  {
    "category": "experimental",
    "title": "게임 제목",
    "gameConcept": "게임의 배경, 목표, 학습이 일어나는 방식",
    "description": "핵심 컨셉과 학습 방식",
    "coreLoop": "학생이 반복하는 핵심 행동",
    "learningEvidence": "학습 목표 달성을 확인하는 행동이나 결과",
    "keyFeatures": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
    "curriculumAlignment": ["성취기준 문구 -> 학습 행동과 피드백"],
    "classroomValue": "수업 활용 및 평가 포인트",
    "rendering": "2.5D",
    "techApproach": "구현 방식",
    "complexity": "높음",
    "risk": "가장 큰 구현 위험",
    "fallback": "간소화 버전"
  }
]

검증 규칙:
- 배열 항목은 정확히 3개이며 category 순서는 safe, immersive, experimental
- keyFeatures는 정확히 3개
- keyFeatures와 curriculumAlignment는 반드시 JSON 문자열 배열이어야 하며, 단일 문자열로 반환하지 마세요.
- curriculumAlignment는 최소 1개
- 각 curriculumAlignment 항목은 '->'를 포함
- rendering은 2D, 2.5D, 3D 중 하나
- complexity는 낮음, 중간, 높음 중 하나
- "새로움"보다 학습 정렬성과 한 번에 구현 가능한 범위를 우선하세요.`;

  const normalizeStringArray = (value: unknown): string[] => {
    const splitLooseString = (text: string): string[] => {
      const trimmed = text.trim();
      if (!trimmed) return [];
      if (/[\n•]/.test(trimmed) || /^\s*[-*+]\s+/m.test(trimmed) || /^\s*\d+[.)]\s+/m.test(trimmed)) {
        return trimmed
          .split(/\n+/)
          .map((line) => line.replace(/^\s*(?:[-*+•]|\d+[.)])\s*/, '').trim())
          .filter(Boolean);
      }
      return [trimmed];
    };

    const values = Array.isArray(value)
      ? value.flatMap((item) => (typeof item === 'string' ? splitLooseString(item) : []))
      : typeof value === 'string'
        ? splitLooseString(value)
        : [];

    return values
      .map((item) => stripMarkdownFormatting(item))
      .filter((item) => item.length > 0);
  };

  const pickString = (raw: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const value = raw[key];
      if (typeof value === 'string' && value.trim()) {
        return stripMarkdownFormatting(value);
      }
    }
    return '';
  };

  const pickArray = (raw: Record<string, unknown>, keys: string[]): string[] => {
    for (const key of keys) {
      if (raw[key] !== undefined) {
        return normalizeStringArray(raw[key]);
      }
    }
    return [];
  };

  const extractIdeasArray = (payload: unknown): unknown[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    const record = payload as Record<string, unknown>;
    for (const key of ['ideas', 'gamesIdeas', 'games_ideas', 'results', 'data', 'items']) {
      if (Array.isArray(record[key])) return record[key] as unknown[];
    }

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && value.some((item) => item && typeof item === 'object')) {
        return value;
      }
    }
    return [];
  };

  const normalizeIdea = (item: unknown): GameIdea | null => {
    if (!item || typeof item !== 'object') return null;
    const raw = item as Record<string, unknown>;

    const categoryValue = pickString(raw, ['category', 'type', '유형']);
    const category = categoryValue === 'safe' || categoryValue === 'immersive' || categoryValue === 'experimental'
      ? categoryValue
      : null;
    const title = pickString(raw, ['title', 'name', 'gameTitle', 'game_title', '제목']);
    const gameConcept = pickString(raw, ['gameConcept', 'game_concept', 'concept', '게임컨셉']);
    const description = pickString(raw, ['description', 'summary', 'concept', 'desc', '설명']);
    const coreLoop = pickString(raw, ['coreLoop', 'core_loop', '핵심루프']);
    const learningEvidence = pickString(raw, ['learningEvidence', 'learning_evidence', '학습증거']);
    let keyFeatures = pickArray(raw, ['keyFeatures', 'key_features', 'features', '주요특징', '주요기능']).slice(0, 5);
    const curriculumAlignment = pickArray(raw, ['curriculumAlignment', 'curriculum_alignment', 'alignment', '성취기준']);
    const classroomValue = pickString(raw, ['classroomValue', 'classroom_value', 'value', '교육효과', '수업활용']);
    const renderingValue = pickString(raw, ['rendering', 'renderType', '렌더링']);
    const rendering = renderingValue === '2D' || renderingValue === '2.5D' || renderingValue === '3D'
      ? renderingValue
      : '2D';
    const complexityValue = pickString(raw, ['complexity', 'difficulty', '구현난이도']);
    const complexity = complexityValue === '낮음' || complexityValue === '중간' || complexityValue === '높음'
      ? complexityValue
      : '중간';
    const techApproach = pickString(raw, ['techApproach', 'tech_approach', 'technology', '기술방식']);
    const risk = pickString(raw, ['risk', 'implementationRisk', '구현위험']);
    const fallback = pickString(raw, ['fallback', 'fallbackPlan', '간소화대안']);

    if (keyFeatures.length === 0 && description) {
      keyFeatures = description
        .split(/[.。!?]\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 8)
        .slice(0, 3);
    }

    if (!category || !title || !/[가-힣]/.test(title) || !gameConcept || !description || !coreLoop
      || !learningEvidence || keyFeatures.length === 0 || curriculumAlignment.length === 0
      || !techApproach || !risk || !fallback) {
      return null;
    }

    while (keyFeatures.length < 3) {
      keyFeatures.push(keyFeatures[keyFeatures.length - 1]);
    }

    return {
      category,
      title,
      gameConcept,
      description,
      coreLoop,
      learningEvidence,
      keyFeatures: keyFeatures.slice(0, 3),
      curriculumAlignment,
      classroomValue: classroomValue || '수업에서 학습 목표 달성 여부를 바로 확인할 수 있습니다.',
      rendering,
      techApproach,
      complexity,
      risk,
      fallback,
    };
  };

  const parseIdeasFromText = (text: string): GameIdea[] => {
    let parsed: unknown;
    try {
      parsed = extractJsonValue<unknown>(text, 'array');
    } catch {
      parsed = extractJsonValue<unknown>(text, 'object');
    }

    return extractIdeasArray(parsed)
      .map(normalizeIdea)
      .filter((idea): idea is GameIdea => idea !== null);
  };

  let text = await callSolar(prompt);
  let normalizedIdeas = parseIdeasFromText(text);

  const hasRequiredCategories = (ideas: GameIdea[]) =>
    ideas.length === 3
    && ideas[0].category === 'safe'
    && ideas[1].category === 'immersive'
    && ideas[2].category === 'experimental';

  if (!hasRequiredCategories(normalizedIdeas)) {
    const repairPrompt = `아래 응답을 교육용 웹 게임 아이디어 JSON 배열로만 다시 작성하세요.
설명 문장, 코드블록, 마크다운 없이 JSON 배열만 출력하세요.
정확히 3개를 safe, immersive, experimental 순서로 작성하세요.
각 항목은 category, title(한국어), gameConcept, description, coreLoop, learningEvidence, keyFeatures(문자열 3개),
curriculumAlignment(문자열 배열), classroomValue, rendering, techApproach, complexity, risk, fallback을 포함해야 합니다.
문장 내부의 쉼표를 배열 구분으로 바꾸지 마세요.
선택된 성취기준 원문을 curriculumAlignment 각 항목의 '->' 앞에 그대로 보존하세요.

원본 응답:
${text}`;
    text = await callSolar(repairPrompt);
    normalizedIdeas = parseIdeasFromText(text);
  }

  if (!hasRequiredCategories(normalizedIdeas)) {
    throw new Error('서로 다른 유형의 게임 아이디어 3개를 생성하지 못했습니다.');
  }

  return normalizedIdeas;
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

마크다운 강조 기호 없이 JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else if (currentStep === 4) {
    // Step 4: 게임 설계 개선 아이디어
    prompt = `교과: "${formData.subject}"
학습 목표: "${formData.learningGoal}"
게임 컨셉: "${formData.gameConcept}"
게임 설계: "${formData.mechanics}"
디자인 및 분위기: "${formData.vibe}"

위의 게임 기획 내용을 분석하여, 게임 설계나 디자인을 개선할 수 있는 간단한 아이디어 3-5개를 제시해주세요.
각 아이디어는 한 문장으로 간결하고 실용적으로 작성해주세요.

마크다운 강조 기호 없이 JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
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

마크다운 강조 기호 없이 JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else {
    return null;
  }

  const text = await callSolar(prompt);

  try {
    const ideas = extractJsonValue<unknown[]>(text, 'array');
    const normalized = ideas
      .map((idea) => (typeof idea === 'string' ? stripMarkdownFormatting(idea) : ''))
      .filter((idea) => idea.length > 0)
      .slice(0, 5);
    if (normalized.length > 0) return normalized;
  } catch {
    // JSON이 아닌 목록 응답은 기존 줄바꿈 기반 정규화를 사용합니다.
  }

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^[\[\],"]+$/))
    .map(line => stripMarkdownFormatting(line.replace(/^[-•*]\s*/, '').replace(/^["']|["']$/g, '').trim()))
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('Solar 응답에서 개선 아이디어를 찾을 수 없습니다.');
  }
  return lines.slice(0, 5);
};

export const generateFinalPromptWithAI = async (formData: FormData): Promise<string> => {
  const isAdvanced = formData.promptLevel === 'advanced';
  const compact = (value: string, maxLength: number) => {
    const normalized = value.replace(/\n{3,}/g, '\n\n').trim();
    return normalized.length > maxLength
      ? `${normalized.slice(0, maxLength).trim()}\n[이하 중복·부가 설명 생략]`
      : normalized;
  };

  const spec = {
    subject: compact(formData.subject, 100),
    grade: compact(formData.grade, 100),
    standard: compact(formData.curriculumStandard, 900),
    goal: compact(formData.learningGoal, 500),
    concept: compact(formData.gameConcept, 1400),
    mechanics: compact(formData.mechanics, 1200),
    vibe: compact(formData.vibe, 900),
    gameLogic: compact(formData.structuredData.gameLogic, 900),
    learningFlow: compact(formData.structuredData.learningFlow, 900),
    uiAssets: compact(formData.structuredData.uiAssets, 900),
    rules: compact(formData.structuredData.rules || formData.rules, 900),
  };

  const primaryPrompt = `당신은 시니어 프론트엔드 게임 개발자입니다. 아래 명세에 맞는 교육용 웹 게임을 질문이나 TODO 없이 끝까지 구현하고 직접 실행해 검증하세요.

# 결과물
- React + TypeScript 기반의 실제 플레이 가능한 완성형 MVP
- 시작 화면 → 전체 미션 플레이 → 결과 화면 → 다시하기까지 하나의 완전한 게임 루프
- 필요한 의존성만 설치하고 기존 프로젝트가 있으면 그 구조와 실행 방식을 우선 존중
- 로그인, 서버, 데이터베이스, 관리자 페이지, 다국어, AR, 멀티플레이는 명세에 명시된 경우가 아니면 구현 금지

# 학습 명세
- 교과/학년: ${spec.subject} / ${spec.grade}
- 성취기준: ${spec.standard}
- 학습 목표: ${spec.goal}

# 게임 명세
## 컨셉
${spec.concept}

## 핵심 기능과 플레이 흐름
${spec.mechanics}

## 점수·보상·완료 조건
${spec.gameLogic}

## 학습 단계와 문제 구성
${spec.learningFlow}

## 디자인과 UI
${spec.vibe}
${spec.uiAssets}

## 기술 규칙
${spec.rules}

# 구현 원칙
1. 샘플 문제와 콘텐츠를 코드에 포함해 첫 실행 즉시 전체 게임을 플레이할 수 있게 하세요.
2. 정답·오답·점수·진행도·완료 상태를 명시적인 상태로 관리하고 새 게임 시 완전히 초기화하세요.
3. 입력값의 공백, 숫자 범위, 중복 제출을 검증하고 오류 원인과 다음 행동을 화면에 알려주세요.
4. 외부 에셋이 없어도 동작하도록 CSS, SVG, Canvas 또는 기본 도형을 우선 사용하세요.
5. 3D가 명세에 포함되면 카메라 조작 범위, 조명, 좌표축, 저사양 기기 대응과 2D 대체 표현을 함께 구현하세요.
6. 데스크톱과 태블릿/모바일에서 핵심 조작이 가능하게 하고 키보드 포커스, 레이블, 색상 외 피드백을 제공하세요.
7. 선택지를 나열하거나 사용자에게 되묻지 말고 명세 안에서 가장 단순하고 안정적인 기본값을 결정하세요.

# 완료 조건
- 개발 서버와 프로덕션 빌드가 성공하고 콘솔 오류가 없음
- 시작부터 결과·다시하기까지 핵심 시나리오를 직접 확인
- 모든 샘플 문제가 풀리며 점수와 진행 상태가 정확함
- 좁은 화면에서 버튼과 입력 영역이 겹치거나 잘리지 않음
- 구현 후 변경 파일, 실행 방법, 검증 결과를 짧게 보고

지금 전체 게임을 구현하고 실행해서 검증하세요.`;

  const enhancementPrompt = `앞서 완성한 교육용 게임의 핵심 동작과 학습 목표는 유지하면서 품질을 개선하세요.

# 개선 범위
1. 반복 플레이가 지루하지 않도록 기존 데이터 구조 안에서 문제 변형과 난이도 곡선을 보강
2. 정답·오답·완료 피드백의 모션과 시각적 명료성을 개선하되 과한 효과는 금지
3. 모바일 조작, 키보드 접근성, 렌더링 성능을 점검하고 발견한 문제 수정
4. 중복 코드를 정리하고 점수·문제·UI 설정값을 수정하기 쉬운 상수 또는 설정 객체로 분리
5. 기존 전체 플레이 흐름에 대한 회귀 검증 수행

새로운 로그인, 서버, 관리자 페이지, AR, 다국어, 멀티플레이 기능은 추가하지 마세요.
작업 후 변경 사항과 검증 결과만 간결하게 보고하세요.`;

  const backendPrompt = `앞서 완성한 프론트엔드 게임의 동작을 바꾸지 않고 선택적인 저장·통계 백엔드를 추가하세요.

- 먼저 실제 수업 운영에 서버가 필요한 데이터만 식별
- 진행 저장, 점수 기록, 교사용 집계에 필요한 최소 API와 데이터 스키마만 구현
- 개인정보는 최소 수집하고 학생 식별자는 익명화
- 로컬 개발 환경, 환경 변수 예시, 오류·오프라인 처리 포함
- 프론트엔드의 기존 localStorage 동작은 네트워크 실패 시 대체 수단으로 유지
- 인증·배포 서비스는 현재 저장소의 기술 스택이 정한 방식이 있을 때만 사용

구현 후 API 계약, 마이그레이션 방법, 실행 및 검증 결과를 보고하세요.`;

  type PromptBundle = {
    prompt1: string;
    prompt2: string;
    prompt3: string;
  };

  const fallbackBundle: PromptBundle = {
    prompt1: primaryPrompt,
    prompt2: enhancementPrompt,
    prompt3: isAdvanced ? backendPrompt : '',
  };

  const parseMarkedBundle = (text: string): PromptBundle | null => {
    const readSection = (name: string) => {
      const match = text.match(new RegExp(`<<<${name}>>>\\s*([\\s\\S]*?)\\s*<<<END_${name}>>>`));
      return match?.[1]?.trim() || '';
    };
    const bundle = {
      prompt1: readSection('PRIMARY_PROMPT'),
      prompt2: readSection('ENHANCEMENT_PROMPT'),
      prompt3: readSection('BACKEND_PROMPT'),
    };
    return bundle.prompt1 && bundle.prompt2 && (!isAdvanced || bundle.prompt3) ? bundle : null;
  };

  const validateBundle = (bundle: PromptBundle) => {
    const primaryChecks = [
      /시작/,
      /플레이|게임/,
      /결과/,
      /다시하기|재시작/,
      /완료 조건|검증/,
      /반응형|모바일/,
      /접근성|키보드/,
    ];
    return primaryChecks.every((pattern) => pattern.test(bundle.prompt1))
      && !/\bTODO\b|확인 필요|선택하세요/.test(bundle.prompt1)
      && bundle.prompt1.length <= 6500
      && bundle.prompt2.length <= 2500;
  };

  const aiRequest = `아래 초안을 Cursor 같은 코딩 에이전트가 한 번에 구현할 수 있는 실행 프롬프트로 다듬으세요.
내용을 장황하게 늘리지 말고 중복과 충돌을 제거하세요. 1차 프롬프트만으로 완성형 게임이 실행되어야 하며 2차는 선택적 개선입니다.
TODO, 질문, 여러 선택지를 남기지 마세요. 요청하지 않은 기능을 추가하지 마세요.
PRIMARY_PROMPT는 6,500자, ENHANCEMENT_PROMPT는 2,500자를 넘기지 마세요.
JSON이나 코드블록을 사용하지 말고 아래 구분자 형식만 반환하세요.

<<<PRIMARY_PROMPT>>>
${primaryPrompt}
<<<END_PRIMARY_PROMPT>>>

<<<ENHANCEMENT_PROMPT>>>
${enhancementPrompt}
<<<END_ENHANCEMENT_PROMPT>>>
${isAdvanced ? `
<<<BACKEND_PROMPT>>>
${backendPrompt}
<<<END_BACKEND_PROMPT>>>` : ''}`;

  let bundle = fallbackBundle;
  try {
    const firstResponse = await callSolar(aiRequest);
    const firstBundle = parseMarkedBundle(firstResponse);
    if (firstBundle && validateBundle(firstBundle)) {
      bundle = firstBundle;
    } else {
      const repairResponse = await callSolar(`아래 응답을 구분자 형식에 맞게 복구하세요. 내용을 늘리지 말고 누락된 완료 조건만 보완하세요.

${aiRequest}

# 복구할 응답
${firstResponse}`);
      const repairedBundle = parseMarkedBundle(repairResponse);
      if (repairedBundle && validateBundle(repairedBundle)) bundle = repairedBundle;
    }
  } catch (error) {
    console.warn('AI 프롬프트 정리 실패, 검증된 로컬 템플릿을 사용합니다.', error);
  }

  const section3 = isAdvanced && bundle.prompt3
    ? `\n## 3차 선택 프롬프트 (백엔드 저장·통계)\n\`\`\`md\n${bundle.prompt3}\n\`\`\`\n`
    : '';

  return `# 최종 개발 프롬프트 (${isAdvanced ? '고급자용' : '기본형'})

1차만으로 완성형 게임을 구현할 수 있습니다. 2차는 결과를 확인한 뒤 필요할 때만 사용하세요.

## 1차 원샷 프롬프트 (완성형 MVP)
\`\`\`md
${bundle.prompt1}
\`\`\`

## 2차 선택 프롬프트 (품질 개선)
\`\`\`md
${bundle.prompt2}
\`\`\`${section3}`;
};
