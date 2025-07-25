# Play Math Archive 🎮📐

현직 교사들이 만든 **디지털 수학 콘텐츠 아카이브**입니다. 게임을 통해 수학을 재미있게 배우고, 개념을 확실히 이해할 수 있는 인터랙티브한 학습 플랫폼입니다.

## ✨ 주요 특징

- 🎮 **게임형 학습**: 다양한 수학 게임을 통해 개념을 자연스럽게 익힐 수 있습니다.
- 🧠 **개념 이해**: 시각적이고 인터랙티브한 방식으로 추상적인 수학 개념을 구체화합니다.
- 📱 **모바일 제한 안내**: 모든 게임 카드에 '모바일 제한' 마크가 표시되어, 모바일 지원 여부를 한눈에 확인할 수 있습니다.
- 🖥️ **반응형 UI**: 모바일, 태블릿, 데스크탑에서 자동으로 카드와 그리드 크기가 조정되어 쾌적한 사용성을 제공합니다.
- 🏷️ **난이도/검색/필터**: 난이도별(초급/중급/고급) 필터와 검색 기능으로 원하는 게임을 쉽게 찾을 수 있습니다.
- 🏆 **추천/인기 게임**: 추천 게임, 인기 게임, 최근 플레이 게임을 별도 섹션에서 한눈에 확인할 수 있습니다.
- 🗂️ **탭 기반 분류**: 중학/고등/특수(뇌풀기, 학급운영) 등 탭과 서브탭으로 체계적으로 분류되어 있습니다.
- 📈 **실시간 통계**: 각 게임별 플레이 횟수, 인기 순위 등 실시간 통계가 반영됩니다.
- 🪄 **모달 상세 정보**: 카드 클릭 시 게임 상세 정보와 바로가기(모달) 제공
- 👨‍🏫 **교사 제작**: 현직 교사들이 실제 수업 경험을 바탕으로 제작한 콘텐츠입니다.

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

### 기타
- **뇌풀기 게임**: 창의적 사고력, 전략적 사고를 기르는 게임
- **학급운영 도구**: 수업/학급 운영에 활용 가능한 미니 도구

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

### 🆕 최근 UI/UX 변경사항

- **추천/인기/최근 게임 섹션**: 메인에서 추천 게임, 인기 게임, 최근 플레이 게임을 캐러셀로 한눈에 볼 수 있습니다.
- **난이도/검색/필터**: 난이도별 필터와 검색 기능이 추가되어 원하는 게임을 쉽게 찾을 수 있습니다.
- **탭/서브탭 구조**: 중학/고등/특수 등 상단 탭과 세부 과목별 서브탭으로 분류되어 있습니다.
- **모바일 제한 마크**: 모든 게임 카드 상단에 '📱 모바일 제한' 마크가 표시됩니다.
- **카드 클릭 시 모달**: 카드 클릭 시 게임 상세 정보와 바로가기 버튼이 모달로 표시됩니다.
- **반응형 그리드/카드**: 모바일 1열, 태블릿 2열, 데스크탑 3열로 자동 배치, 카드 내부 요소도 화면 크기에 따라 자동 조정됩니다.
- **실시간 통계**: 각 게임별 플레이 횟수, 인기 순위 등 실시간 통계가 반영됩니다.

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   ├── GameCard.tsx    # 게임 카드 컴포넌트 (모바일 제한 마크, 반응형, 모달)
│   ├── GameModal.tsx   # 게임 상세 모달 컴포넌트
│   ├── MainNavigation.tsx # 메인 네비게이션
│   └── NavigationTabs.tsx # 탭/서브탭 네비게이션
├── pages/              # 페이지 컴포넌트
│   ├── Index.tsx       # 메인 페이지 (탭/서브탭, 난이도/검색/필터, 반응형 그리드)
│   ├── Main.tsx        # 랜딩/소개/추천/인기/통계/CTA 등 메인 랜딩
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
- **Cards**: 호버 효과와 그림자로 인터랙티브한 경험, 모바일 제한 마크, 모달 연동
- **Navigation**: 탭/서브탭, 드롭다운 메뉴, 반응형 디자인
- **Buttons**: 그라데이션과 애니메이션 효과

## 📊 통계

- **총 게임 수**: 20+ 개
- **교육 과정**: 10개 (중학교~고등학교)
- **제작 교사**: 5+ 명
- **학습 시간**: 500+ 시간의 콘텐츠
- **실시간 인기/플레이 통계**: 각 게임별 실시간 플레이 횟수, 인기 순위 제공

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

---

## 1. `<title>` 태그 최적화

- **각 페이지마다 고유하고 명확한 제목**을 사용하세요.
- 제목에는 “수학 게임”, “연산 게임”, “중등 수학”, “고등 수학”, “무료”, “인터랙티브” 등  
  사용자가 검색할 만한 핵심 키워드를 포함하세요.
- 너무 길지 않게(50자 이내), 브랜드명도 함께 넣으면 좋습니다.

**예시**
```html
<code_block_to_apply_changes_from>
```

---

## 2. 메타 디스크립션(Meta Description) 작성

- **150~160자 이내**로, 페이지의 핵심 내용을 간결하게 요약합니다.
- 사용자가 클릭하고 싶게 만드는 문구(혜택, 특징, 차별점 등)를 넣으세요.
- 각 페이지마다 고유하게 작성하세요.

**예시**
```html
<!-- 메인 페이지 -->
<meta name="description" content="현직 교사들이 만든 다양한 수학 게임을 무료로 즐기세요. 연산, 논리, 사고력, 중등·고등 수학까지! 재미와 학습을 동시에 잡는 인터랙티브 수학 게임 플랫폼입니다.">

<!-- 사과 게임 상세 페이지 -->
<meta name="description" content="사과를 옮기며 연산력을 키우는 재미있는 수학 게임! 초등·중등 학생에게 추천하는 무료 학습 게임, 지금 바로 플레이해보세요.">
```

---

## 3. 적용 방법 (React/Vite 기준)

- `index.html` 또는 각 페이지 컴포넌트에서  
  [react-helmet-async](https://www.npmjs.com/package/react-helmet-async) 같은 라이브러리를 사용하면  
  동적으로 `<title>`과 `<meta>` 태그를 관리할 수 있습니다.

**설치**
```bash
npm install react-helmet-async
```

**사용 예시 (페이지 컴포넌트 상단)**
```tsx
import { Helmet } from 'react-helmet-async';

export default function AppleGamePage() {
  return (
    <>
      <Helmet>
        <title>사과 게임 - 연산력 키우는 재미있는 수학 게임 | Play Math Archive</title>
        <meta name="description" content="사과를 옮기며 연산력을 키우는 재미있는 수학 게임! 초등·중등 학생에게 추천하는 무료 학습 게임, 지금 바로 플레이해보세요." />
      </Helmet>
      {/* ...나머지 컴포넌트 */}
    </>
  );
}
```

---

## 4. 추가 팁

- **Open Graph 태그**도 함께 작성하면 SNS 공유 시에도 예쁘게 노출됩니다.
- **키워드 남용은 피하고**, 자연스럽게 핵심 키워드를 포함하세요.
- **중복된 title/description**이 없도록 주의하세요.

---

### 요약
- 각 페이지마다 `<title>`과 `<meta name="description">`을 고유하게 작성
- 핵심 키워드, 매력적인 문구, 50자/150
