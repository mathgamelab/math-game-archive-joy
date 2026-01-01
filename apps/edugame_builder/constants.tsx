
import React from 'react';
import { GameExamplesMap, GameExample } from './types';

// Define a base example for reuse
const BASE_GAME: GameExample = {
  curriculumStandard: '창의적 체험활동 및 자율 주제',
  learningGoal: '선택한 주제에 대한 지식을 퀴즈와 탐험으로 익힌다.',
  gameConcept: '주제 탐험대: 던전을 탐험하며 몬스터가 내는 문제를 맞혀 승리하는 RPG',
  mechanics: '- 턴제 전투 방식\n- 공격 기술이 학습 퀴즈 문제로 구성\n- 보스전은 복합적인 고난도 문제',
  vibe: '판타지 세계관, 도트 그래픽',
  rules: '확장성을 고려한 데이터 구조 설계'
};

export const GAME_EXAMPLES: GameExamplesMap = {
  '수학': {
    curriculumStandard: '소인수분해의 원리를 이해하고 활용하기',
    learningGoal: '합성수를 소수의 곱으로 분해하는 과정을 자연스럽게 익힌다.',
    gameConcept: '소수 탐사대: 우주 공간에서 합성수 소행성을 소수 미사일로 쪼개는 슈팅 게임',
    mechanics: '- 화면에 합성수 숫자가 적힌 소행성 등장\n- 사용자는 하단의 소수(2, 3, 5, 7) 미사일을 선택해 발사\n- 올바른 소수로 나누면 소행성이 작아지고 점수 획득',
    vibe: '네온 컬러의 사이버틱한 우주 배경, 긴박한 사운드, 레트로 게임 느낌',
    rules: 'React Canvas 사용, 한글 폰트 적용, 모바일 터치 지원 필수'
  },
  '국어': {
    curriculumStandard: '단어의 품사 분류 및 특징 파악',
    learningGoal: '명사, 동사, 형용사 등 품사의 차이를 문장 속에서 구분한다.',
    gameConcept: '품사 분류 알바생: 컨베이어 벨트에 지나가는 단어들을 올바른 품사 바구니에 담기',
    mechanics: '- 단어가 적힌 박스가 빠르게 지나감\n- 3개의 바구니(체언, 용언, 수식언 등)에 드래그 앤 드롭\n- 연속 성공 시 피버 타임 발생',
    vibe: '아기자기한 픽셀 아트 스타일, 밝고 경쾌한 배경음악',
    rules: 'Framer Motion 활용, 드래그 앤 드롭 라이브러리 사용'
  },
  '사회': {
    curriculumStandard: '민주 정치의 원리와 권력 분립 이해',
    learningGoal: '입법부, 행정부, 사법부의 역할을 게임을 통해 직접 체험한다.',
    gameConcept: '3권 분립 도시 건설: 도시의 위기를 각 기관의 카드를 써서 해결하는 전략 카드 게임',
    mechanics: '- 법 제정, 집행, 판결 카드 사용\n- 각 기관의 에너지가 균형을 이루어야 도시가 발전\n- 불균형 시 독재 혹은 무법지대 엔딩 발생',
    vibe: '깔끔한 보드게임 스타일, 전문적이고 진지한 톤',
    rules: '상태 관리(Zustand/Context API) 중요, 애니메이션 효과 강조'
  },
  '과학': {
    curriculumStandard: '전기 에너지의 발생과 이용',
    learningGoal: '회로의 직렬과 병렬 연결 차이에 따른 전구의 밝기 변화를 이해한다.',
    gameConcept: '빛을 밝혀라! 회로 퍼즐: 전구가 모두 켜지도록 전선과 스위치를 연결하는 퍼즐',
    mechanics: '- 그리드 위에 전선, 배터리, 전구 배치\n- 전류의 흐름을 시각화하여 표현\n- 최소 전선을 사용하여 효율적으로 연결하면 별 3개 획득',
    vibe: '공학적인 느낌의 다크 모드 UI, 부드러운 인터랙션',
    rules: 'SVG 기반 회로 표현, 알고리즘 최적화 필요'
  },
  '영어': {
    curriculumStandard: '상황에 맞는 필수 표현 및 어휘 활용',
    learningGoal: '대화의 맥락을 파악하고 적절한 영어 응답을 선택한다.',
    gameConcept: '공항 탈출 대작전: 입국 심사대에서 NPC의 영어 질문에 올바른 답변 카드를 제출하여 통과하기',
    mechanics: '- NPC가 텍스트와 음성으로 영어 질문 제시\n- 3개의 답변 카드 중 상황에 맞는 하나 선택\n- 연속 통과 시 비행기 티켓 등급 상승',
    vibe: '활기찬 여행 가방 테마, 밝은 색감의 아이소메트릭 뷰',
    rules: '웹 음성 합성(Web Speech API) 지원, 카드 애니메이션 강조'
  },
  '정보': {
    curriculumStandard: '효율적인 문제 해결 절차 설계(알고리즘)',
    learningGoal: '반복문과 조건문을 사용하여 미로를 탈출하는 경로를 최적화한다.',
    gameConcept: '알고-봇 미로 탈출: 명령 블록을 드래그하여 로봇을 목적지까지 이동시키는 퍼즐',
    mechanics: '- 이동, 회전, 반복, 만약~라면 블록 제공\n- 블록을 조합한 후 [실행] 버튼 클릭\n- 최단 블록 수로 해결 시 보너스 스타 획득',
    vibe: '테크니컬한 그리드 배경, 블루/시안 톤의 미래형 UI',
    rules: '블록 프로그래밍 시뮬레이터 로직 구현'
  },
  '기타': BASE_GAME,
  '체육': BASE_GAME,
  '음악': BASE_GAME,
  '미술': BASE_GAME,
  '기술가정': BASE_GAME,
  '제2외국어': BASE_GAME,
};

export const STEP_NAMES = [
  '교과 선택',
  '학습 설계',
  '게임 컨셉',
  '규칙 설계',
  '로직 구성',
  '최종 결과'
];

export const Icons = {
  Joystick: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m10 4a2 2 0 100-4m0 4a2 2 0 110-4M6 20h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
    </svg>
  ),
  Puzzle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Bot: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Lightbulb: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
};
