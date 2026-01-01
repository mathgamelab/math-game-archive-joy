
export type SubjectType = '국어' | '수학' | '사회' | '과학' | '영어' | '체육' | '음악' | '미술' | '기술가정' | '정보' | '제2외국어' | '기타' | '';

export interface StructuredData {
  gameLogic: string;
  learningFlow: string;
  uiAssets: string;
  rules: string;
}

export interface FormData {
  subject: SubjectType;
  grade: string;
  curriculumStandard: string;
  gameConcept: string;
  learningGoal: string;
  mechanics: string;
  vibe: string;
  rules: string;
  structuredData: StructuredData;
  geminiPrompt: string;
  editedPrompt: string;
}

export interface GameExample {
  curriculumStandard: string;
  learningGoal: string;
  gameConcept: string;
  mechanics: string;
  vibe: string;
  rules: string;
}

export type GameExamplesMap = Record<Exclude<SubjectType, ''>, GameExample>;
