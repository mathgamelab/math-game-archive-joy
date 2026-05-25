
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FormData } from "../types";

const getAI = (apiKey?: string) => {
  if (!apiKey || apiKey.trim() === '') {
    console.warn('Gemini API key is not set. Please enter your API key in settings.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const improveContentWithAI = async (apiKey: string | undefined, type: string, toolType: string, currentValue: string, curriculumStandard?: string, gameConcept?: string): Promise<string | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

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

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    // 현재 도메인 감지
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '알 수 없음';
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/*` : '';
    
    console.error('AI improvement failed:', error);
    console.error('Error details:', {
      status: error?.status,
      code: error?.code,
      message: error?.message,
      response: error?.response,
      currentOrigin
    });
    
    // API_KEY_HTTP_REFERRER_BLOCKED 에러인 경우 사용자에게 안내
    if (error?.status === 403 || error?.code === 403) {
      const errorMessage = error?.message || '';
      if (errorMessage.includes('referer') || errorMessage.includes('REFERRER')) {
        console.error(`
⚠️ API 키 HTTP referrer 제한 문제입니다.

현재 도메인: ${currentOrigin}}

해결 방법:
1. Google Cloud Console (https://console.cloud.google.com/) 접속
2. "API 및 서비스" > "사용자 인증 정보" 이동
3. 해당 API 키 클릭
4. "애플리케이션 제한사항" 섹션에서:
   - "HTTP 리퍼러(웹사이트)" 선택
   - "웹사이트 제한사항"에 다음 추가:
     * ${currentUrl}
     * ${currentOrigin}/*
     * ${currentOrigin}
     * http://localhost:3000/*
     * http://localhost:3000
     * http://127.0.0.1:3000/*
5. 저장 후 페이지 새로고침

또는 "제한 없음"으로 설정하세요.
        `);
      } else {
        console.error(`
⚠️ API 키 인증 실패 (403 에러)

에러 메시지: ${errorMessage}
현재 도메인: ${currentOrigin}

가능한 원인:
1. API 키가 유효하지 않음
2. API 키에 필요한 권한이 없음
3. API 키 사용량 초과
4. API 키가 비활성화됨

해결 방법:
1. Google Cloud Console에서 API 키 상태 확인
2. Gemini API가 활성화되어 있는지 확인
3. API 키를 재생성해보세요
        `);
      }
    } else if (error?.status === 401 || error?.code === 401) {
      console.error(`
⚠️ API 키 인증 실패 (401 에러)

에러 메시지: ${error?.message || '알 수 없는 에러'}

가능한 원인:
1. API 키가 잘못되었거나 만료됨
2. API 키가 삭제됨

해결 방법:
1. .env 파일에서 GEMINI_API_KEY 확인
2. Google Cloud Console에서 API 키 재생성
      `);
    } else {
      console.error(`
⚠️ AI 개선 요청 실패

에러 코드: ${error?.status || error?.code || '알 수 없음'}
에러 메시지: ${error?.message || '알 수 없는 에러'}
현재 도메인: ${currentOrigin}

전체 에러 정보:
${JSON.stringify(error, null, 2)}
      `);
    }
    
    return null;
  }
};

export interface GameIdea {
  title: string;
  description: string;
  keyFeatures: string[];
  curriculumAlignment: string[];
  classroomValue: string;
}

export const generateGameIdeas = async (apiKey: string | undefined, learningGoal: string, subject: string, curriculumStandard?: string): Promise<GameIdea[] | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

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

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text?.trim() || null;
    if (!text) return null;

    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonText) as unknown;

    if (!Array.isArray(parsed)) {
      console.warn('Game ideas response is not an array:', parsed);
      return null;
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
      console.warn('No valid game ideas after normalization:', parsed);
      return null;
    }

    return normalizedIdeas.slice(0, 3);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse game ideas JSON:', error);
      return null;
    }
    console.error('Game ideas generation failed:', error);
    return null;
  }
};

export const generateImprovementIdeas = async (apiKey: string | undefined, formData: FormData, currentStep: number): Promise<string[] | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

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
UI 에셋: "${formData.structuredData.uiAssets}"

위의 전체 게임 기획 내용을 분석하여, 게임 로직이나 구조를 개선할 수 있는 간단한 아이디어 3-5개를 제시해주세요.
각 아이디어는 한 문장으로 간결하고 실용적으로 작성해주세요.

JSON 배열 형식으로만 반환해주세요: ["아이디어1", "아이디어2", "아이디어3"]`;
  } else {
    return null;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text?.trim() || null;
    if (!text) return null;

    // JSON 파싱 시도
    try {
      // JSON 코드 블록이 있는 경우 제거
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const ideas = JSON.parse(jsonText) as string[];
      
      if (Array.isArray(ideas) && ideas.length > 0) {
        return ideas.filter(idea => idea && idea.trim().length > 0);
      }
      
      return null;
    } catch (parseError) {
      // JSON 파싱 실패 시 줄바꿈으로 구분된 텍스트로 파싱 시도
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^[\[\],"]+$/))
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0);
      
      return lines.length > 0 ? lines.slice(0, 5) : null;
    }
  } catch (error: any) {
    console.error('Improvement ideas generation failed:', error);
    return null;
  }
};

export const generateFrontendPrompt = async (apiKey: string | undefined, formData: FormData): Promise<string | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

  const promptInput = `
다음 정보를 바탕으로 Gemini AI에서 즉시 사용 가능한 수준의 정교한 프론트엔드 개발 프롬프트를 작성해주세요. 이 프롬프트는 게임의 단계별 로직, 시각적 스타일, 기술적 구조를 모두 포함하고 있어 AI가 완성도 높은 코드를 생성하도록 유도합니다.

# 교과 및 학습 목표
교과: ${formData.subject}
학년: ${formData.grade}
성취기준: ${formData.curriculumStandard}
학습 목표: ${formData.learningGoal}

# 게임 컨셉 및 게임 설계
게임 명칭/컨셉: ${formData.gameConcept}
핵심 게임 설계: ${formData.mechanics}

# 디자인 및 기술 요구사항
분위기(Vibe): ${formData.vibe}
게임 로직: ${formData.structuredData.gameLogic}
UI 에셋: ${formData.structuredData.uiAssets}
기술 규칙: ${formData.rules}

출력 요구사항:
1. React, Tailwind CSS 또는 Canvas API를 활용한 프론트엔드 구조 제안.
2. 학습 요소(문제 세트, 정답 데이터)가 코드 내 JSON 데이터 객체로 관리되도록 설계.
3. 게임 시작 -> 플레이 -> 게임오버/결과 확인 루프를 명확히 포함.
4. 교육용이므로 가독성 좋은 폰트와 직관적인 UI가 반영되도록 작성.
5. 반응형 디자인 고려.
6. 마크다운 형식으로 전문적인 개발 프롬프트 생성.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptInput,
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    console.error('Frontend prompt generation failed:', error);
    return null;
  }
};

export const generateBackendPrompt = async (apiKey: string | undefined, formData: FormData): Promise<string | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

  const promptInput = `
다음 정보를 바탕으로 Cursor/Windsurf AI 에디터에서 실행 가능한 교육용 웹 게임의 백엔드 개발 프롬프트를 작성해주세요.

# 교과 및 학습 목표
교과: ${formData.subject}
학년: ${formData.grade}
성취기준: ${formData.curriculumStandard}
학습 목표: ${formData.learningGoal}

# 게임 컨셉 및 게임 설계
게임 명칭/컨셉: ${formData.gameConcept}
핵심 게임 설계: ${formData.mechanics}

# 기술 요구사항
게임 로직: ${formData.structuredData.gameLogic}
기술 규칙: ${formData.rules}

출력 요구사항:
1. RESTful API 또는 GraphQL을 활용한 백엔드 구조 제안.
2. 학습 데이터 관리, 사용자 진행 상황 저장, 점수/통계 관리 등 필요한 API 엔드포인트 설계.
3. 데이터베이스 스키마 설계 (필요한 경우).
4. 인증/인가 시스템 (필요한 경우).
5. 마크다운 형식으로 전문적인 개발 프롬프트 생성.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptInput,
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    console.error('Backend prompt generation failed:', error);
    return null;
  }
};

export const generateFinalPromptWithAI = async (apiKey: string | undefined, formData: FormData): Promise<string | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

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
UI 에셋 및 시각화 계획 (UI Assets): ${formData.structuredData.uiAssets}
기술 규칙: ${formData.rules}

# 절대 규칙 (중요)
1) "핵심 로직 및 보상 체계", "UI 에셋 및 시각화 계획"을 절대 축약/생략하지 말고 프롬프트 본문에 직접 반영하세요.
2) 모호하면 내용을 버리지 말고 "TODO(확인 필요)" 형태로 남기되, 왜 필요한지 근거를 함께 적으세요.
3) 프롬프트 1, 2는 항상 프론트엔드 전용(React + Tailwind + 브라우저 실행)으로 작성하세요.
4) 데이터는 프론트엔드 코드 내 JSON/배열 기반으로 관리하도록 지시하세요.
5) 출력은 반드시 JSON 객체 하나만 반환하세요. (코드블록/설명 문장 금지)

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

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptInput,
    });

    const rawText = response.text?.trim() || null;
    if (!rawText) return null;

    const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Final prompt response does not contain JSON object:', rawText);
        return null;
      }
      parsed = JSON.parse(match[0]) as Record<string, unknown>;
    }

    const prompt1 = typeof parsed.prompt1 === 'string' ? parsed.prompt1.trim() : '';
    const prompt2 = typeof parsed.prompt2 === 'string' ? parsed.prompt2.trim() : '';
    const prompt3 = typeof parsed.prompt3 === 'string' ? parsed.prompt3.trim() : '';
    const checklist = Array.isArray(parsed.coverageChecklist)
      ? parsed.coverageChecklist
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0)
      : [];

    if (!prompt1 || !prompt2) {
      console.warn('Final prompt bundle missing prompt1/prompt2:', parsed);
      return null;
    }

    if (isAdvanced && !prompt3) {
      console.warn('Advanced prompt bundle missing prompt3:', parsed);
      return null;
    }

    return formatFinalPromptBundle(
      prompt1,
      prompt2,
      isAdvanced ? prompt3 : null,
      checklist,
      isAdvanced
    );
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse final prompt bundle JSON:', error);
      return null;
    }
    console.error('Final prompt generation failed:', error);
    return null;
  }
};
