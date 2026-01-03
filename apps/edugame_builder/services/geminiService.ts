
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
}

export const generateGameIdeas = async (apiKey: string | undefined, learningGoal: string, subject: string, curriculumStandard?: string): Promise<GameIdea[] | null> => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

  const standardsText = curriculumStandard 
    ? `\n선택한 성취기준:\n${curriculumStandard.split('\n').filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : '';

  const prompt = `교과: "${subject}"
구체적인 학습 목표: "${learningGoal}"${standardsText}

위의 학습 목표를 달성하기 위한 교육용 웹 게임 아이디어를 3개 제시해주세요.

각 아이디어는 다음 형식의 JSON 배열로 반환해주세요:
[
  {
    "title": "게임 제목",
    "description": "게임의 핵심 컨셉과 학습 목표 달성 방법을 간결하게 설명 (2-3문장)",
    "keyFeatures": ["주요 특징 1", "주요 특징 2", "주요 특징 3"]
  },
  ...
]

요구사항:
- 각 게임은 학습 목표를 효과적으로 달성할 수 있어야 함
- 학생들에게 흥미롭고 재미있는 게임플레이
- 웹 브라우저에서 실행 가능한 형태
- 교육적 가치와 게임의 재미가 균형있게 결합

JSON 형식만 반환하고, 다른 설명은 포함하지 마세요.`;

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
      const ideas = JSON.parse(jsonText) as GameIdea[];
      
      // 3개 아이디어가 있는지 확인
      if (Array.isArray(ideas) && ideas.length >= 3) {
        return ideas.slice(0, 3);
      }
      
      // 배열이 아니거나 개수가 부족한 경우
      console.warn('Invalid game ideas format:', ideas);
      return null;
    } catch (parseError) {
      console.error('Failed to parse game ideas JSON:', parseError);
      console.error('Response text:', text);
      return null;
    }
  } catch (error: any) {
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

  // 레벨별 가이드라인
  const beginnerGuidelines = `# Role
당신은 교육용 웹 게임 전문 개발자입니다. 사용자가 제공한 게임 설계 내용을 충실히 반영하여, Cursor/Windsurf AI 에디터에 바로 붙여넣을 수 있는 완전한 개발 프롬프트를 작성해주세요.

# Goal
프론트엔드만으로 작동하는 교육용 웹 게임을 개발할 수 있는 프롬프트를 작성하세요. 사용자가 Step5에서 입력한 모든 상세 내용(게임 메커니즘, 플레이어 행동, 단계별 플레이 흐름, 디자인 및 분위기 등)을 빠짐없이 반영해야 합니다.

# Writing Guidelines (초급용 - 게임 특화)
1. **프론트엔드 전용 (Frontend Only):**
   - 백엔드 서버나 데이터베이스 연동 없이 브라우저에서만 작동하는 게임으로 설계하세요.
   - 모든 게임 데이터는 코드 내 JSON 객체나 배열로 관리하세요.
   - React, Tailwind CSS, useState/useEffect 같은 기본 훅만 사용하세요.

2. **사용자 입력 내용 충실히 반영:**
   - 사용자가 제공한 "게임 설계" 섹션의 모든 내용(핵심 메커니즘, 플레이어 행동, 단계별 플레이 흐름 등)을 상세하게 프롬프트에 포함하세요.
   - "디자인 및 분위기" 섹션의 모든 내용(시각적 스타일, 색상 팔레트, UI/UX 디자인 요소, 분위기 등)을 구체적으로 반영하세요.
   - "게임 로직"과 "UI 에셋" 섹션의 내용도 빠짐없이 포함하세요.
   - 절대 내용을 축약하거나 생략하지 마세요. 사용자가 입력한 모든 세부사항을 그대로 반영해야 합니다.

3. **구체적인 구현 지시:**
   - 게임의 각 단계, 화면 전환, 인터랙션 방식을 구체적으로 설명하세요.
   - 드래그 앤 드롭, 클릭, 입력 등의 사용자 조작 방식을 명확히 기술하세요.
   - 시각적 효과(글로우, 애니메이션, 색상 등)를 구체적으로 지시하세요.

4. **데이터 구조 명시:**
   - 게임 데이터를 관리할 JSON 구조를 예시와 함께 제시하세요.
   - 선생님이 쉽게 수정할 수 있도록 주석을 상세히 달아주세요.

# Output Format
- 프롬프트 앞뒤에 불필요한 안내사항이나 설명을 추가하지 마세요.
- 순수한 개발 프롬프트만 작성하세요. (예: "제공해주신 정보를 바탕으로..." 같은 서두나 "Cursor/Windsurf 사용 방법" 같은 결론 제거)
- 마크다운 형식으로 작성하되, 코드 블록은 실제 코드 예시가 필요한 경우에만 사용하세요.`;

  const advancedGuidelines = `# Role
당신은 LLM 시스템 설계를 담당하는 '시니어 게임 프롬프트 엔지니어'입니다. 사용자의 모호한 요구사항을 분석하여, 프로덕션 환경에서도 오류 없이 작동하는 고성능의 '고급 게임 프롬프트'를 설계해야 합니다.

# Goal
백엔드 연동이 가능한 구조화된 템플릿을 기반으로, **극도로 구체적이고 섬세한 지시사항**이 포함된 교육용 게임 개발 프롬프트를 작성하세요.

# Writing Guidelines (고급용 심화 기준 - 게임 특화)
1. **엄격한 구조화:** Markdown 헤더(#)와 XML 태그(<Section>)를 사용하여 프롬프트의 각 파트를 시각적/논리적으로 명확히 구분하세요.

2. **고해상도 지시(Concrete & Detailed):**
   - 단순히 "게임을 만들어줘"라고 쓰지 말고, "게임의 난이도 조절 방식, 점수 계산 알고리즘, 게임 오버 조건, 재시작 로직" 등을 현미경으로 보듯 자세하게 서술하세요.
   - AI가 게임 로직을 판단해야 하는 경우, 그 판단의 기준(Criteria)을 명확히 제시하세요.
   - 예: "정답률이 80% 이상이면 다음 단계로 진행" (O) vs "적절한 시점에 다음 단계로 진행" (X)

3. **섬세한 제약(Nuance & Constraints):**
   - '하지 말아야 할 것(Negative Constraints)'을 명시하여 환각(Hallucination)이나 오답을 방지하세요.
   - 예: "절대 하드코딩된 정답을 사용하지 말고, 데이터베이스나 API에서 동적으로 가져오세요"
   - 게임의 어조(Tone)와 매너(Manner)에 대해 구체적인 형용사(예: 친근한, 도전적인, 격려하는)를 사용하여 정의하세요.

4. **변수 및 데이터 처리:**
   - 입력 데이터는 \`{{variable}}\`로 표기하고, 데이터가 비어있거나 이상할 때의 대처법(Edge Case Handling)을 포함하세요.
   - 예: "문제 데이터가 없을 경우 기본 문제 세트를 사용하거나 사용자에게 안내 메시지를 표시하세요"

5. **CoT 및 Few-shot:**
   - 복잡한 게임 로직이 필요한 경우 \`<Steps>\`를 통해 사고 과정을 유도하고, 입력-출력 쌍으로 구성된 \`<Examples>\`를 반드시 포함하세요.
   - 예: "게임 점수 계산 예시: 정답 1개 = 10점, 오답 1개 = -5점, 시간 보너스 = 남은 시간(초) × 0.1점"

6. **백엔드 통합:**
   - 사용자 진행 상황 저장, 점수 기록, 통계 분석 등을 위한 API 엔드포인트 설계를 포함하세요.
   - 데이터베이스 스키마 설계(필요한 경우)를 포함하세요.

# Output Format
- 전체 프롬프트를 복사 가능한 하나의 코드 블록으로 제공하세요.
- 프롬프트 구성:
  - **Role & Objective:** 페르소나와 최종 목표 정의
  - **Context:** 게임의 배경 지식 및 교육적 목적
  - **Critical Rules:** 절대 어겨서는 안 되는 제약 사항 (섬세한 가이드)
  - **Game Flow/Steps:** 구체적이고 단계적인 게임 실행 절차
  - **Examples:** 이상적인 게임 플레이 예시 (Few-shot)
  - **Output Schema:** JSON 포맷 또는 엄격한 출력 양식
  - **Backend Integration:** 백엔드 API 및 데이터베이스 설계 (고급자용)`;

  const selectedGuidelines = formData.promptLevel === 'beginner' ? beginnerGuidelines : 
                             formData.promptLevel === 'advanced' ? advancedGuidelines : '';

  const promptInput = `
다음 정보를 바탕으로 Cursor/Windsurf AI 에디터에서 실행 가능한 교육용 웹 게임 개발 프롬프트를 작성해주세요.

# 교과 및 학습 목표
교과: ${formData.subject}
학년: ${formData.grade}
성취기준: ${formData.curriculumStandard}
학습 목표: ${formData.learningGoal}

# 게임 컨셉
${formData.gameConcept}

# 게임 설계 (상세)
${formData.mechanics}

# 디자인 및 분위기 (상세)
${formData.vibe}

# 게임 로직 (기술적 세부사항)
${formData.structuredData.gameLogic}

# UI 에셋 및 시각화 계획
${formData.structuredData.uiAssets}

# 기술 요구사항
${formData.rules}

${selectedGuidelines ? `\n# 프롬프트 작성 가이드라인\n${selectedGuidelines}\n` : ''}

중요 지시사항:
${formData.promptLevel === 'beginner' ? `
1. 위에서 제공한 "게임 설계", "디자인 및 분위기", "게임 로직", "UI 에셋" 섹션의 모든 내용을 빠짐없이 반영하세요.
2. 프론트엔드만 사용하세요 (React, Tailwind CSS, useState/useEffect). 백엔드나 데이터베이스는 절대 사용하지 마세요.
3. 모든 게임 데이터는 코드 내 JSON 객체로 관리하세요.
4. 프롬프트 앞뒤에 불필요한 안내사항을 추가하지 마세요. 순수한 개발 프롬프트만 작성하세요.
5. 사용자가 입력한 모든 세부사항(게임 메커니즘, 플레이어 행동, 단계별 흐름, 디자인 요소 등)을 상세하게 반영하세요.` : `
1. 위에서 제공한 "게임 설계", "디자인 및 분위기", "게임 로직", "UI 에셋" 섹션의 모든 내용을 빠짐없이 반영하세요.
2. 프론트엔드와 백엔드를 모두 포함한 구조로 설계하세요.
3. 데이터베이스 스키마와 API 엔드포인트를 설계하세요.
4. 프롬프트 앞뒤에 불필요한 안내사항을 추가하지 마세요. 순수한 개발 프롬프트만 작성하세요.
5. 사용자가 입력한 모든 세부사항을 상세하게 반영하세요.`}

${selectedGuidelines ? '\n위 프롬프트 작성 가이드라인을 반드시 준수하여 작성해주세요.' : ''}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptInput,
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    // 현재 도메인 감지
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '알 수 없음';
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/*` : '';
    
    console.error('Final prompt generation failed:', error);
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

현재 도메인: ${currentOrigin}

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
⚠️ 프롬프트 생성 실패

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
