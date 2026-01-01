
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FormData } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const improveContentWithAI = async (type: string, toolType: string, currentValue: string): Promise<string | null> => {
  if (!currentValue.trim()) return null;
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

  const prompt = `교수학습용 게임 기획 도구의 "${type}" 내용입니다. 교과는 "${toolType}"입니다.
내용: "${currentValue}"

이 기획을 교육적으로 더 효과적이고, 학생들에게 흥미로운 게임 형태가 되도록 개선해주세요. 개선된 내용만 한국어로 반환해주세요.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error('AI improvement failed:', error);
    return null;
  }
};

export const generateFinalPromptWithAI = async (formData: FormData): Promise<string | null> => {
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return null;
  }

  const promptInput = `
다음 정보를 바탕으로 Cursor/Windsurf AI 에디터에서 실행 가능한 교육용 웹 게임(Learning Game) 개발 프롬프트를 작성해주세요.

# 교과 및 학습 목표
교과: ${formData.subject}
학년: ${formData.grade}
성취기준: ${formData.curriculumStandard}
학습 목표: ${formData.learningGoal}

# 게임 컨셉 및 메카닉
게임 명칭/컨셉: ${formData.gameConcept}
핵심 게임 규칙: ${formData.mechanics}

# 디자인 및 기술 요구사항
분위기(Vibe): ${formData.vibe}
기술 규칙: ${formData.rules}

출력 요구사항:
1. React, Tailwind CSS 또는 Canvas API를 활용한 원페이지 웹 게임 구조 제안.
2. 학습 요소(문제 세트, 정답 데이터)가 코드 내 JSON 데이터 객체로 관리되도록 설계.
3. 게임 시작 -> 플레이 -> 게임오버/결과 확인 루프를 명확히 포함.
4. 교육용이므로 가독성 좋은 폰트와 직관적인 UI가 반영되도록 작성.
5. 마크다운 형식으로 전문적인 개발 프롬프트 생성.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: promptInput,
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error('Final prompt generation failed:', error);
    return null;
  }
};
