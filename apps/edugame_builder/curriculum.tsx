import curriculumJson from './curriculum.json';

export interface Standard {
  id: string;
  text: string;
  domain: string; // 중단원
  majorUnit?: string; // 대단원 (선택사항)
  schoolLevel?: string; // 학교급 (자동 계산)
  subject?: string; // 교과명 (자동 계산)
}

// 학교급별 학년군 매핑
export const SCHOOL_LEVELS = {
  '초등학교': ['초등 1-2학년', '초등 3-4학년', '초등 5-6학년'],
  '중학교': ['중학교'],
  '고등학교': ['고등학교']
} as const;

export type SchoolLevel = keyof typeof SCHOOL_LEVELS;

// 학년 변환 함수: JSON의 학년 형식을 curriculum.tsx 형식으로 변환
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
  // 기본값: 학교급만 반환
  return schoolLevel;
}

// 성취기준코드에서 대괄호 제거
function cleanStandardId(code: string): string {
  return code.replace(/[\[\]]/g, '').trim();
}

// 교과명 정규화: 교과명을 통합 및 변환
function normalizeSubject(교과: string, 과목: string): string {
  let subject = 교과 || 과목 || '기타';
  
  // 기술·가정을 기술가정으로 변환
  if (subject === '기술·가정' || subject.includes('기술·가정')) {
    return '기술가정';
  }
  
  // 도덕을 사회로 통합
  if (subject === '도덕') {
    return '사회';
  }
  
  // 한문을 제2외국어로 통합
  if (subject === '한문') {
    return '제2외국어';
  }
  
  // 역사, 지리, 사회탐구 관련 과목들을 '사회'로 통합
  if (subject === '역사' || subject === '지리' || 
      subject.includes('사회탐구') ||
      과목?.includes('역사') || 과목?.includes('지리') || 과목?.includes('사회탐구')) {
    return '사회';
  }
  
  // 교과가 이미 '사회'인 경우 그대로 유지
  if (subject === '사회') {
    return '사회';
  }
  
  return subject;
}

// JSON 데이터를 Standard 형식으로 변환
function transformJsonData(jsonData: any): Record<string, Record<string, Standard[]>> {
  const result: Record<string, Record<string, Standard[]>> = {};
  
  // 학교급별로 순회
  for (const [schoolLevel, items] of Object.entries(jsonData)) {
    const standards = items as any[];
    
    // 각 항목을 교과별, 학년별로 그룹화
    for (const item of standards) {
      const subject = normalizeSubject(item.교과 || '', item.과목 || '');
      const grade = convertGrade(item.학교급, item.학년);
      const domain = item.영역 || '기타';
      const id = cleanStandardId(item.성취기준코드 || '');
      const text = item.성취기준명 || '';
      
      // 빈 데이터는 제외
      if (!id || !text || text.length < 5) {
        continue;
      }
      
      // 교과가 없으면 생성
      if (!result[subject]) {
        result[subject] = {};
      }
      
      // 학년이 없으면 생성
      if (!result[subject][grade]) {
        result[subject][grade] = [];
      }
      
      // Standard 객체 생성
      const standard: Standard = {
        id,
        text: text.trim(),
        domain,
        schoolLevel: item.학교급,
        subject
      };
      
      result[subject][grade].push(standard);
    }
  }
  
  return result;
}

// JSON 데이터를 변환하여 사용
const jsonCurriculumData = transformJsonData(curriculumJson);

// 기존 하드코딩된 데이터와 JSON 데이터 병합
export const CURRICULUM_DATA: Record<string, Record<string, Standard[]>> = {
  '국어': {
    '초등 3-4학년': [
      { id: '4국01-01', text: '대화의 즐거움을 알고 상황에 적절한 대화를 나눈다.', domain: '듣기·말하기' },
      { id: '4국01-02', text: '회의에서 원활하게 의견을 주고받는다.', domain: '듣기·말하기' },
      { id: '4국02-01', text: '읽기 목적에 따라 알맞은 읽기 방법으로 글을 읽는다.', domain: '읽기' },
      { id: '4국02-02', text: '글의 종류에 따른 읽기 방법을 알고 내용을 요약한다.', domain: '읽기' },
      { id: '4국03-01', text: '자신의 생각을 문장으로 정확하게 표현한다.', domain: '쓰기' },
      { id: '4국04-01', text: '낱말의 분류와 품사의 기초를 익힌다.', domain: '문법' },
      { id: '4국05-01', text: '문학 작품에서 인물, 사건, 배경을 파악한다.', domain: '문학' }
    ],
    '초등 5-6학년': [
      { id: '6국01-01', text: '구어 의사소통의 특성을 바탕으로 하여 적절하게 대화한다.', domain: '듣기·말하기' },
      { id: '6국01-02', text: '의견과 근거의 적절성을 판단하며 듣는다.', domain: '듣기·말하기' },
      { id: '6국02-01', text: '읽기의 가치와 중요성을 알고 읽기를 생활화하는 태도를 지닌다.', domain: '읽기' },
      { id: '6국04-01', text: '언어의 본질과 국어의 특징을 이해한다.', domain: '문법' },
      { id: '6국05-01', text: '문학 작품에 나타난 비유적 표현의 특성과 효과를 파악한다.', domain: '문학' }
    ],
    '중학교': [
      { id: '9국01-01', text: '청중의 반응을 살피며 적절한 비언어적 표현을 사용하여 발표한다.', domain: '듣기·말하기' },
      { id: '9국04-01', text: '품사의 종류와 특성을 이해하고 단어를 분류한다.', domain: '문법' },
      { id: '9국05-01', text: '문학 작품의 구성 요소와 그 유기적 관계를 파악한다.', domain: '문학' },
      { id: '9국02-01', text: '설명 방식의 특징을 파악하며 읽는다.', domain: '읽기' }
    ],
    '고등학교': [
      { id: '고국01-01', text: '사회적 쟁점에 대해 비판적으로 이해하고 논리적으로 말한다.', domain: '화법과 작문' },
      { id: '고국04-01', text: '국어의 역사적 변천 과정과 특징을 이해한다.', domain: '언어와 매체' }
    ]
  },
  '수학': {
    '초등 3-4학년': [
      { id: '4수01-01', text: '만, 억, 조 단위의 큰 수를 읽고 쓸 수 있다.', domain: '수와 연산' },
      { id: '4수01-02', text: '세 자리 수의 덧셈과 뺄셈의 원리를 이해한다.', domain: '수와 연산' },
      { id: '4수01-03', text: '곱셈과 나눗셈의 원리를 이해하고 계산을 수행한다.', domain: '수와 연산' },
      { id: '4수03-01', text: '여러 가지 삼각형의 성질을 이해한다.', domain: '도형' },
      { id: '4수03-02', text: '사각형의 성질과 평면도형의 밀기, 뒤집기, 돌리기를 이해한다.', domain: '도형' }
    ],
    '초등 5-6학년': [
      { id: '6수01-01', text: '분수의 덧셈과 뺄셈의 원리를 이해하고 계산한다.', domain: '수와 연산' },
      { id: '6수01-02', text: '소수의 나눗셈 계산 원리를 이해한다.', domain: '수와 연산' },
      { id: '6수02-01', text: '각기둥과 각뿔의 특징을 이해한다.', domain: '도형' },
      { id: '6수04-01', text: '비와 비율의 개념을 이해하고 활용한다.', domain: '변화와 관계' }
    ],
    '중학교': [
      { id: '9수01-01', text: '소인수분해의 뜻을 알고 자연수를 소인수분해한다.', domain: '수와 연산' },
      { id: '9수02-01', text: '일차방정식의 해를 구하고 활용 문제를 해결한다.', domain: '문자와 식' },
      { id: '9수03-01', text: '피타고라스 정리를 이해하고 삼각형의 변의 길이를 구한다.', domain: '기하' }
    ],
    '고등학교': [
      { id: '고수01-01', text: '다항식의 연산을 이해하고 수행한다.', domain: '수와 연산' },
      { id: '고수02-01', text: '이차방정식과 이차함수의 관계를 이해한다.', domain: '방정식과 부등식' },
      { id: '고수03-01', text: '삼각함수의 개념과 성질을 이해한다.', domain: '기하' },
      { id: '고수04-01', text: '미분의 개념을 이해하고 활용한다.', domain: '미적분' }
    ]
  },
  '과학': {
    '초등 3-4학년': [
      { id: '4과01-01', text: '동물의 생김새와 생활 방식이 환경과 관련되어 있음을 이해한다.', domain: '생물의 세계' },
      { id: '4과04-01', text: '식물의 한살이 관찰을 통해 자람의 특징을 파악한다.', domain: '식물의 자람' },
      { id: '4과07-01', text: '소리의 발생과 전달 과정을 관찰하고 설명한다.', domain: '소리의 성질' },
      { id: '4과11-01', text: '화산 활동의 특징을 관찰하고 지진 발생 원리를 파악한다.', domain: '지구의 변화' }
    ],
    '초등 5-6학년': [
      { id: '6과01-01', text: '전구의 연결 방법에 따른 밝기 변화를 비교한다.', domain: '전기의 이용' },
      { id: '6과03-01', text: '온도계의 올바른 사용법을 알고 열의 이동을 이해한다.', domain: '열과 에너지' },
      { id: '6과11-01', text: '지구와 달의 운동으로 나타나는 현상을 설명한다.', domain: '우주' }
    ],
    '중학교': [
      { id: '9과05-01', text: '식물의 광합성과 증산 작용의 원리를 실험으로 확인한다.', domain: '생물의 구성' },
      { id: '9과12-01', text: '전류, 전압, 저항 사이의 관계를 이해하고 오옴의 법칙을 활용한다.', domain: '전기와 자기' }
    ]
  },
  '정보': {
    '중학교': [
      { id: '9정02-01', text: '문제 해결을 위한 핵심 요소를 추출하여 추상화 모델을 만든다.', domain: '추상화' },
      { id: '9정03-01', text: '프로그래밍의 순차, 선택, 반복 구조를 이해한다.', domain: '프로그래밍' },
      { id: '9정03-02', text: '리스트와 함수를 사용하여 효율적인 프로그램을 작성한다.', domain: '프로그래밍' },
      { id: '9정04-01', text: '인공지능의 기본 개념과 동작 원리를 이해한다.', domain: '인공지능' }
    ],
    '고등학교': [
      { id: '고정02-01', text: '데이터 분석을 통해 실생활의 문제를 발견하고 해결한다.', domain: '데이터 과학' },
      { id: '고정03-01', text: '기계학습 모델을 구축하고 성능을 평가한다.', domain: '인공지능 기획' }
    ]
  },
  '사회': {
    '중학교': [
      { id: '9사05-01', text: '민주주의의 기본 원리와 권력 분립의 필요성을 이해한다.', domain: '정치' },
      { id: '9사08-01', text: '수요와 공급의 원리에 따른 시장 가격의 결정 과정을 이해한다.', domain: '경제' }
    ]
  },
  '영어': {
    '초등 3-4학년': [
      { id: '4영01-01', text: '일상생활과 관련된 쉬운 낱말이나 대화를 듣고 이해한다.', domain: '듣기' },
      { id: '4영02-01', text: '자신의 이름, 나이 등 기초적인 정보를 말한다.', domain: '말하기' }
    ]
  },
  '체육': {
    '초등 5-6학년': [
      { id: '6체01-01', text: '건강 유지 및 증진을 위한 신체 활동의 중요성을 안다.', domain: '건강' },
      { id: '6체02-01', text: '경쟁 활동에서 전술을 적용하여 게임을 수행한다.', domain: '경쟁' }
    ]
  },
  '음악': {
    '중학교': [
      { id: '9음01-01', text: '음악의 구성 요소와 원리를 파악하여 노래하거나 연주한다.', domain: '표현' }
    ]
  },
  '미술': {
    '중학교': [
      { id: '9미02-01', text: '다양한 매체와 기법을 활용하여 창의적으로 표현한다.', domain: '표현' }
    ]
  },
  '기술가정': {
    '중학교': [
      { id: '9기가02-01', text: '제조 기술의 발달 과정을 이해하고 시제품을 제작한다.', domain: '기술' }
    ]
  },
  '제2외국어': {
    '중학교': [
      { id: '9외01-01', text: '일상적인 상황에서 필요한 기초적인 의사소통 표현을 익힌다.', domain: '의사소통' }
    ]
  },
  '기타': {
    '창의적 체험활동': [
      { id: '창체01-01', text: '자아 정체성을 확립하고 자신의 진로를 탐구한다.', domain: '진로' }
    ]
  },
  // JSON 파일에서 가져온 데이터 병합
  ...jsonCurriculumData
};
