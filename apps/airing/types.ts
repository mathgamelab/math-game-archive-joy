
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum ConversationMode {
  FREE = 'free',
  CHOICE = 'choice'
}

export interface Persona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  voice: string;
  systemPrompt: string;
  greeting: string;
}

export interface StructuredMessageContent {
  english_response: string;
  korean_translation: string;
  korean_explanation: string;
  suggestions: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  options?: string[];
  structuredContent?: StructuredMessageContent; // 구조화된 응답 (번역, 설명, 제안 포함)
  isHistory?: boolean; // 히스토리 메시지인지 여부
}

export interface AppState {
  screen: 'main' | 'call' | 'feedback';
  persona: Persona;
  difficulty: Difficulty;
  mode: ConversationMode;
  scenario: string;
  history: Message[];
  feedback: string;
}
