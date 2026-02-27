
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, Persona, ConversationMode } from "../types";

// 배포용 API 키 설정
export const GEMINI_API_KEY = 'AIzaSyCR-Ex5kwxxzz7-RJVUeBHyKPIfmghSELI';

const getAI = (apiKey?: string) => {
  if (!apiKey || apiKey.trim() === '') {
    console.warn('Gemini API key is not set. Please check your environment variables.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// 구조화된 응답 타입
export interface StructuredResponse {
  english_response: string;
  korean_translation: string;
  korean_explanation: string;
  suggestions: string[];
}

// 구조화된 텍스트 생성 (JSON 응답)
export const generateStructuredText = async (
  apiKey: string | undefined,
  messages: Message[],
  systemInstruction: string
): Promise<StructuredResponse> => {
  const ai = getAI(apiKey);
  if (!ai) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            english_response: { type: 'STRING' },
            korean_translation: { type: 'STRING' },
            korean_explanation: { type: 'STRING' },
            suggestions: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['english_response', 'korean_translation', 'korean_explanation', 'suggestions']
        },
        temperature: 0.7
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text) as StructuredResponse;
  } catch (error: any) {
    console.error('Structured text generation failed:', error);
    throw error;
  }
};

// TTS: 텍스트를 음성으로 변환 (REST API 직접 호출)
export const generateTTS = async (
  apiKey: string | undefined,
  text: string,
  voiceName: string
): Promise<Blob | null> => {
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }

  try {
    const payload = {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error('음성 생성 실패');
    }

    const data = await response.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return null;

    // Base64를 PCM으로 디코딩
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // PCM을 WAV로 변환
    return pcmToWav(bytes);
  } catch (error: any) {
    console.error('TTS generation failed:', error);
    return null;
  }
};

// PCM을 WAV로 변환하는 유틸리티
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + pcmData.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
  
  return new Blob([buffer], { type: 'audio/wav' });
}

export const generateFeedback = async (apiKey: string | undefined, history: Message[]) => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. AI features are disabled.');
    return "API 키가 설정되지 않았습니다. 환경 변수 GEMINI_API_KEY를 확인해주세요.";
  }

  const log = history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
  const prompt = `Analyze this English conversation and provide feedback in Korean. Include:\n1. Overall Evaluation\n2. Grammar Corrections (Original vs Corrected)\n3. Strengths\n4. Areas for Improvement\n\nConversation Log:\n${log}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a professional English education expert. Provide kind, specific feedback in Korean.",
        temperature: 0.7
      }
    });

    return response.text || "Could not generate feedback.";
  } catch (error: any) {
    console.error('AI feedback generation failed:', error);
    console.error('Error details:', {
      status: error?.status,
      code: error?.code,
      message: error?.message,
      response: error?.response,
      fullError: JSON.stringify(error, null, 2)
    });
    
    // API_KEY_HTTP_REFERRER_BLOCKED 에러인 경우 사용자에게 안내
    if (error?.status === 403 || error?.code === 403) {
      const errorMessage = error?.message || '';
      const errorString = JSON.stringify(error).toLowerCase();
      if (errorMessage.includes('referer') || errorMessage.includes('REFERRER') || 
          errorString.includes('referer') || errorString.includes('referrer')) {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '알 수 없음';
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
     * ${currentOrigin}/*
     * ${currentOrigin}
     * https://mathgame.kr/*
     * https://mathgame.kr
     * http://localhost:3000/*
     * http://localhost:3000
     * http://127.0.0.1:3000/*
5. 저장 후 페이지 새로고침

또는 "제한 없음"으로 설정하세요.
        `);
        return "API 키 HTTP referrer 제한 문제입니다. 콘솔을 확인해주세요.";
      } else {
        console.error(`
⚠️ API 키 인증 실패 (403 에러)

에러 메시지: ${errorMessage}

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
        return "API 키 인증 실패입니다. 콘솔을 확인해주세요.";
      }
    } else if (error?.status === 401 || error?.code === 401) {
      console.error(`
⚠️ API 키 인증 실패 (401 에러)

에러 메시지: ${error?.message || '알 수 없는 에러'}

가능한 원인:
1. API 키가 잘못되었거나 만료됨
2. API 키가 삭제됨

해결 방법:
1. 환경 변수에서 GEMINI_API_KEY 확인
2. Google Cloud Console에서 API 키 재생성
      `);
      return "API 키 인증 실패입니다. 콘솔을 확인해주세요.";
    } else {
      console.error(`
⚠️ AI 피드백 생성 실패

에러 코드: ${error?.status || error?.code || '알 수 없음'}
에러 메시지: ${error?.message || '알 수 없는 에러'}

전체 에러 정보:
${JSON.stringify(error, null, 2)}
      `);
      return "피드백 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.";
    }
  }
};

// --- Live API Utils ---

export function encodePCM(data: Float32Array): string {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clipping 방지 및 정수 변환
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // btoa 스택 오버플로우 방지를 위한 루프 방식 변환
  const bytes = new Uint8Array(int16.buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodePCM(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectLiveSession = async (apiKey: string | undefined, persona: Persona, callbacks: any) => {
  const ai = getAI(apiKey);
  if (!ai) {
    console.warn('Gemini API key is not set. Live session cannot be started.');
    throw new Error('API 키가 설정되지 않았습니다. 환경 변수 GEMINI_API_KEY를 확인해주세요.');
  }

  // Gemini API (AI Studio key)에서는 preview native-audio 모델이 안정적으로 동작한다.
  // 'gemini-live-2.5-flash-native-audio'는 환경에 따라 onopen 후 1008로 즉시 close될 수 있어 제외.
  const modelCandidates = [
    'gemini-2.5-flash-native-audio-preview-12-2025',
  ];

  let lastError: any = null;
  for (const model of modelCandidates) {
    try {
      console.log('Live 모델 연결 시도:', model);
      return await ai.live.connect({
        model,
        callbacks,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } },
          },
          systemInstruction: persona.systemPrompt,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });
    } catch (error: any) {
      lastError = error;
      console.error(`Live session connection failed with model "${model}":`, error);
    }
  }

  const error = lastError;
  console.error('All Live model connection attempts failed.');
  console.error('Error details:', {
    status: error?.status,
    code: error?.code,
    message: error?.message,
    response: error?.response,
    fullError: JSON.stringify(error, null, 2)
  });
  
  // API_KEY_HTTP_REFERRER_BLOCKED 에러인 경우 사용자에게 안내
  if (error?.status === 403 || error?.code === 403) {
    const errorMessage = error?.message || '';
    const errorString = JSON.stringify(error).toLowerCase();
    if (errorMessage.includes('referer') || errorMessage.includes('REFERRER') || 
        errorString.includes('referer') || errorString.includes('referrer')) {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '알 수 없음';
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
     * ${currentOrigin}/*
     * ${currentOrigin}
     * https://mathgame.kr/*
     * https://mathgame.kr
     * http://localhost:3000/*
     * http://localhost:3000
     * http://127.0.0.1:3000/*
5. 저장 후 페이지 새로고침

또는 "제한 없음"으로 설정하세요.
      `);
    }
  }
  throw error;
};
