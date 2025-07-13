import { GameData } from '@/components/GameCard';

// Sample game data - you can expand this with real game information
export const gamesData: Record<string, GameData[]> = {
  'middle1': [
    {
      id: 'integers-game',
      title: '정수 게임',
      description: '양수와 음수의 사칙연산을 게임처럼 연습해보세요',
      icon: '🔢',
      status: 'development',
      difficulty: '초급',
      estimatedTime: '10분',
      category: '수와 연산',
      content: '정수의 사칙연산',
      terms: '양수, 음수, 절댓값',
      standard: '7수01-01',
      type: '연산 게임'
    },
    {
      id: 'divisibility-puzzle',
      title: '일차방정식 퍼즐',
      description: '방정식을 풀어 숨겨진 그림을 완성하세요',
      icon: '🧩',
      status: 'development',
      difficulty: '중급',
      estimatedTime: '15분',
      category: '문자와 식',
      content: '일차방정식의 해',
      terms: '방정식, 해, 등식의 성질',
      standard: '7수02-02',
      type: '퍼즐 게임'
    },
    {
      id: 'angle-shooter',
      title: '문자와 식 매칭',
      description: '같은 값을 가진 식들을 찾아 매칭하세요',
      icon: '🎯',
      status: 'development',
      difficulty: '초급',
      estimatedTime: '8분',
      category: '문자와 식',
      content: '식의 계산',
      terms: '동류항, 분배법칙',
      standard: '7수02-01',
      type: '매칭 게임'
    }
  ],
  'middle2': [
    {
      id: 'rational-numbers',
      title: '유리수 어드벤처',
      description: '유리수의 세계를 탐험하며 개념을 익혀보세요',
      icon: '🗺️',
      status: 'development',
      difficulty: '중급',
      estimatedTime: '20분'
    },
    {
      id: 'linear-functions',
      title: '일차함수 그래프',
      description: '일차함수 그래프를 그리며 함수를 이해해보세요',
      icon: '📊',
      status: 'playable',
      difficulty: '중급',
      estimatedTime: '15분',
      url: 'https://example.com/linear-functions'
    }
  ],
  'middle3': [
    {
      id: 'quadratic-functions',
      title: '이차함수 시뮬레이터',
      description: '이차함수의 그래프 변화를 시각적으로 학습하세요',
      icon: '📈',
      status: 'development',
      difficulty: '고급',
      estimatedTime: '25분'
    },
    {
      id: 'circle-geometry',
      title: '원의 성질 탐구',
      description: '원의 다양한 성질들을 게임을 통해 발견하세요',
      icon: '⭕',
      status: 'playable',
      difficulty: '중급',
      estimatedTime: '18분',
      url: 'https://example.com/circle-geometry'
    }
  ],
  'common-math': [
    {
      id: 'math-basics',
      title: '수학 기초 다지기',
      description: '기본적인 수학 개념들을 재미있게 복습하세요',
      icon: '🏗️',
      status: 'playable',
      difficulty: '초급',
      estimatedTime: '12분',
      url: 'https://example.com/math-basics'
    }
  ],
  'algebra': [
    {
      id: 'polynomial-puzzle',
      title: '다항식 퍼즐',
      description: '다항식의 연산을 퍼즐로 해결해보세요',
      icon: '🧮',
      status: 'development',
      difficulty: '중급',
      estimatedTime: '20분'
    }
  ],
  'calculus1': [
    {
      id: 'limit-explorer',
      title: '극한 탐험가',
      description: '함수의 극한을 시각적으로 탐구해보세요',
      icon: '🔍',
      status: 'development',
      difficulty: '고급',
      estimatedTime: '30분'
    }
  ],
  'calculus2': [
    {
      id: 'integration-game',
      title: '적분 게임',
      description: '적분을 이용한 넓이 계산 게임입니다',
      icon: '📐',
      status: 'development',
      difficulty: '고급',
      estimatedTime: '25분'
    }
  ],
  'probability': [
    {
      id: 'probability-dice',
      title: '확률 주사위',
      description: '주사위를 굴리며 확률의 개념을 익혀보세요',
      icon: '🎲',
      status: 'playable',
      difficulty: '중급',
      estimatedTime: '15분',
      url: 'https://example.com/probability-dice'
    }
  ],
  'geometry': [
    {
      id: 'shape-constructor',
      title: '도형 건설자',
      description: '다양한 도형들을 만들며 기하학을 배워보세요',
      icon: '📐',
      status: 'development',
      difficulty: '중급',
      estimatedTime: '20분'
    }
  ],
  'ai-math': [
    {
      id: 'ai-pattern',
      title: 'AI 패턴 인식',
      description: '인공지능과 함께 수학적 패턴을 찾아보세요',
      icon: '🤖',
      status: 'development',
      difficulty: '고급',
      estimatedTime: '35분'
    }
  ]
};
