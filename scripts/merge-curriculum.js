import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 데이터 읽기
const jsonPath = path.join(__dirname, '../apps/edugame_builder/curriculum-data.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 기존 curriculum.tsx 읽기
const curriculumPath = path.join(__dirname, '../apps/edugame_builder/curriculum.tsx');
const curriculumContent = fs.readFileSync(curriculumPath, 'utf-8');

// JSON 데이터를 TypeScript 형식으로 변환
function formatStandards(standards) {
  return standards.map(s => {
    // 텍스트 정리: 해설 부분 제거, 실제 성취기준만 추출
    let cleanText = s.text;
    
    // 해설 부분 제거 (•[] 로 시작하는 부분)
    if (cleanText.includes('•[]')) {
      cleanText = cleanText.split('•[]')[0].trim();
    }
    
    // (가) 성취기준 해설 제거
    if (cleanText.includes('(가) 성취기준 해설')) {
      cleanText = cleanText.split('(가) 성취기준 해설')[0].trim();
    }
    
    // (나) 성취기준 적용 시 고려 사항 제거
    if (cleanText.includes('(나) 성취기준 적용 시 고려 사항')) {
      cleanText = cleanText.split('(나) 성취기준 적용 시 고려 사항')[0].trim();
    }
    
    // [] 로 시작하는 실제 성취기준만 추출
    const match = cleanText.match(/\[([^\]]+)\]\s*([^\[]+)/);
    if (match) {
      cleanText = match[2].trim();
    }
    
    // 여러 성취기준이 합쳐진 경우 첫 번째만 추출
    if (cleanText.includes('[') && cleanText.indexOf('[') > 0) {
      cleanText = cleanText.substring(0, cleanText.indexOf('[')).trim();
    }
    
    return {
      id: s.id,
      text: cleanText || s.text.substring(0, 200), // 최대 200자로 제한
      domain: s.domain || '기타',
      majorUnit: s.majorUnit || undefined
    };
  }).filter(s => s.text.length > 0); // 빈 텍스트 제거
}

// TypeScript 코드 생성
let tsCode = `export interface Standard {
  id: string;
  text: string;
  domain: string; // 중단원
  majorUnit?: string; // 대단원 (선택사항)
  schoolLevel?: string; // 학교급 (자동 계산)
  subject?: string; // 교과명 (자동 계산)
}

// 학교급별 학년군 매핑
export const SCHOOL_LEVELS = {
  '초등학교': ['초등 3-4학년', '초등 5-6학년'],
  '중학교': ['중학교'],
  '고등학교': ['고등학교']
} as const;

export type SchoolLevel = keyof typeof SCHOOL_LEVELS;

// 교과별 성취기준 데이터 (학교급 -> 학년군 -> 성취기준)
export const CURRICULUM_DATA: Record<string, Record<string, Standard[]>> = {
`;

// JSON 데이터를 TypeScript 형식으로 변환
for (const [subject, gradeData] of Object.entries(jsonData)) {
  tsCode += `  '${subject}': {\n`;
  
  for (const [grade, standards] of Object.entries(gradeData)) {
    const formatted = formatStandards(standards);
    if (formatted.length > 0) {
      tsCode += `    '${grade}': [\n`;
      formatted.forEach(s => {
        const text = s.text.replace(/'/g, "\\'").substring(0, 300); // 최대 300자
        tsCode += `      { id: '${s.id}', text: '${text}', domain: '${s.domain}'${s.majorUnit ? `, majorUnit: '${s.majorUnit}'` : ''} },\n`;
      });
      tsCode += `    ],\n`;
    }
  }
  
  tsCode += `  },\n`;
}

tsCode += `};`;

// 파일 저장
fs.writeFileSync(curriculumPath, tsCode, 'utf-8');
console.log('✅ curriculum.tsx 파일이 업데이트되었습니다!');

