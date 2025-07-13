# Play Math Archive 🎮📐

현직 교사들이 만든 **디지털 수학 콘텐츠 아카이브**입니다. 게임을 통해 수학을 재미있게 배우고, 개념을 확실히 이해할 수 있는 인터랙티브한 학습 플랫폼입니다.

## ✨ 주요 특징

- 🎮 **게임형 학습**: 재미있는 게임을 통해 수학 개념을 자연스럽게 익힐 수 있습니다
- 🧠 **개념 이해**: 시각적이고 인터랙티브한 방식으로 추상적인 수학 개념을 구체화합니다
- 📈 **단계별 학습**: 초급부터 고급까지 난이도별로 체계적인 학습이 가능합니다
- 👨‍🏫 **교사 제작**: 현직 교사들이 실제 수업 경험을 바탕으로 제작한 콘텐츠입니다

## 📚 교육 과정

### 중학교 수학
- **중학교 1학년**: 정수, 유리수, 문자와 식, 일차방정식
- **중학교 2학년**: 연립방정식, 일차함수, 확률과 통계
- **중학교 3학년**: 이차방정식, 이차함수, 원의 성질

### 고등학교 수학
- **공통수학**: 고등학교 공통수학 과정
- **대수**: 다항식, 방정식과 부등식
- **미적분 I**: 극한, 미분
- **미적분 II**: 적분
- **확률과 통계**: 확률과 통계 개념
- **기하**: 평면기하, 공간기하
- **인공지능 수학**: AI와 수학을 결합한 미래형 게임

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: TanStack Query

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <YOUR_GIT_URL>
cd math-game-archive-joy

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── GameCard.tsx    # 게임 카드 컴포넌트
│   ├── GameModal.tsx   # 게임 모달 컴포넌트
│   ├── MainNavigation.tsx # 메인 네비게이션
│   └── NavigationTabs.tsx # 탭 네비게이션
├── pages/              # 페이지 컴포넌트
│   ├── Index.tsx       # 메인 페이지 (중학/고등수학)
│   ├── About.tsx       # 소개 페이지
│   └── NotFound.tsx    # 404 페이지
├── data/               # 데이터 파일
│   └── gamesData.ts    # 게임 데이터
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 함수
└── App.tsx             # 메인 앱 컴포넌트
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue gradient (#667eea → #764ba2)
- **Secondary**: Purple gradient (#f093fb → #f5576c)
- **Background**: Light gradient (blue-50 → white → purple-50)

### 컴포넌트
- **Cards**: 호버 효과와 그림자로 인터랙티브한 경험
- **Navigation**: 드롭다운 메뉴와 반응형 디자인
- **Buttons**: 그라데이션과 애니메이션 효과

## 📊 통계

- **총 게임 수**: 20+ 개
- **교육 과정**: 10개 (중학교~고등학교)
- **제작 교사**: 5+ 명
- **학습 시간**: 500+ 시간의 콘텐츠

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍🏫 제작자

**행복한윤쌤** | [블로그](https://blog.naver.com/happy_yoonssam)

---

**행복한 수학, 함께 만들어요 😊**
