import mathCurriculumJson from './mathcurriculum.json';

export interface MathStandard {
  id: string;
  text: string;
  domain: string;
  course?: string;
  schoolLevel?: string;
}

export const MATH_SCHOOL_LEVELS = {
  '초등학교': ['초등 1-2학년', '초등 3-4학년', '초등 5-6학년'],
  '중학교': ['중학교'],
  '고등학교': ['고등학교'],
} as const;

export type MathSchoolLevel = keyof typeof MATH_SCHOOL_LEVELS;

function convertGrade(schoolLevel: string, grade: string): string {
  if (schoolLevel === '초등학교') {
    if (grade === '1-2학년') return '초등 1-2학년';
    if (grade === '3-4학년') return '초등 3-4학년';
    if (grade === '5-6학년') return '초등 5-6학년';
  } else if (schoolLevel === '중학교') {
    if (grade === '1-3학년') return '중학교';
  } else if (schoolLevel === '고등학교') {
    if (grade === '1-3학년') return '고등학교';
  }
  return schoolLevel;
}

function cleanStandardId(code: string): string {
  return code.replace(/[\[\]]/g, '').trim();
}

function transformJsonData(
  jsonData: Record<string, Array<Record<string, string>>>
): Record<string, Record<string, MathStandard[]>> {
  const result: Record<string, Record<string, MathStandard[]>> = {};

  for (const items of Object.values(jsonData)) {
    for (const item of items) {
      const grade = convertGrade(item.학교급, item.학년);
      const course = item.과목 || '수학';
      const domain = item.영역 || '기타';
      const id = cleanStandardId(item.성취기준코드 || '');
      const text = item.성취기준명 || '';

      if (!id || !text || text.length < 5) continue;

      if (!result[course]) {
        result[course] = {};
      }
      if (!result[course][grade]) {
        result[course][grade] = [];
      }

      result[course][grade].push({
        id,
        text: text.trim(),
        domain,
        course,
        schoolLevel: item.학교급,
      });
    }
  }

  return result;
}

const jsonMathData = transformJsonData(mathCurriculumJson);

const SAMPLE_MATH_STANDARDS: Record<string, MathStandard[]> = {
  '초등 3-4학년': [
    { id: '4수01-01', text: '만, 억, 조 단위의 큰 수를 읽고 쓸 수 있다.', domain: '수와 연산', course: '수학' },
    { id: '4수01-02', text: '세 자리 수의 덧셈과 뺄셈의 원리를 이해한다.', domain: '수와 연산', course: '수학' },
    { id: '4수01-03', text: '곱셈과 나눗셈의 원리를 이해하고 계산을 수행한다.', domain: '수와 연산', course: '수학' },
    { id: '4수03-01', text: '여러 가지 삼각형의 성질을 이해한다.', domain: '도형', course: '수학' },
    { id: '4수03-02', text: '사각형의 성질과 평면도형의 밀기, 뒤집기, 돌리기를 이해한다.', domain: '도형', course: '수학' },
  ],
  '초등 5-6학년': [
    { id: '6수01-01', text: '분수의 덧셈과 뺄셈의 원리를 이해하고 계산한다.', domain: '수와 연산', course: '수학' },
    { id: '6수01-02', text: '소수의 나눗셈 계산 원리를 이해한다.', domain: '수와 연산', course: '수학' },
    { id: '6수02-01', text: '각기둥과 각뿔의 특징을 이해한다.', domain: '도형', course: '수학' },
    { id: '6수04-01', text: '비와 비율의 개념을 이해하고 활용한다.', domain: '변화와 관계', course: '수학' },
  ],
  중학교: [
    { id: '9수01-01', text: '소인수분해의 뜻을 알고 자연수를 소인수분해한다.', domain: '수와 연산', course: '수학' },
    { id: '9수02-01', text: '일차방정식의 해를 구하고 활용 문제를 해결한다.', domain: '문자와 식', course: '수학' },
    { id: '9수03-01', text: '피타고라스 정리를 이해하고 삼각형의 변의 길이를 구한다.', domain: '기하', course: '수학' },
  ],
  고등학교: [
    { id: '고수01-01', text: '다항식의 연산을 이해하고 수행한다.', domain: '수와 연산', course: '수학' },
    { id: '고수02-01', text: '이차방정식과 이차함수의 관계를 이해한다.', domain: '방정식과 부등식', course: '수학' },
    { id: '고수03-01', text: '삼각함수의 개념과 성질을 이해한다.', domain: '기하', course: '수학' },
    { id: '고수04-01', text: '미분의 개념을 이해하고 활용한다.', domain: '미적분', course: '수학' },
  ],
};

function mergeMathCurriculum(
  fromJson: Record<string, Record<string, MathStandard[]>>,
  samples: Record<string, MathStandard[]>
): Record<string, Record<string, MathStandard[]>> {
  const merged = { ...fromJson };
  if (!merged['수학']) merged['수학'] = {};

  for (const [grade, standards] of Object.entries(samples)) {
    const existing = merged['수학'][grade] ?? [];
    const ids = new Set(existing.map((s) => s.id));
    const extras = standards.filter((s) => !ids.has(s.id));
    merged['수학'][grade] = [...existing, ...extras];
  }

  return merged;
}

/** 수학 성취기준 — 과목 → 학년군 → 성취기준 목록 */
export const MATH_CURRICULUM_DATA = mergeMathCurriculum(jsonMathData, SAMPLE_MATH_STANDARDS);

/** 고등 수학 과목 목록 (공통수학1, 대수, 미적분Ⅰ 등) */
export const HIGH_SCHOOL_MATH_COURSES = Object.entries(jsonMathData)
  .filter(([course, grades]) => course !== '수학' && grades['고등학교'])
  .map(([course]) => course)
  .sort();
