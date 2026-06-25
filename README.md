# Play Math Archive — AI 온보딩 메모

> **대상 독자**: Cursor, Claude, ChatGPT 등 코드 편집 AI  
> **프로젝트**: 현직 교사 제작 수학 게임·교육 도구 아카이브  
> **운영 도메인**: `mathgame.kr` (GitHub Pages + 커스텀 도메인)

이 문서는 저장소 구조, 페이지 구성, 배포 파이프라인, 자주 하는 작업을 한 번에 파악하기 위한 **기술 온보딩**입니다.

---

## 1. 한 줄 요약

| 구분 | 내용 |
|------|------|
| 형태 | npm **workspaces** 모노레포 (`apps/*`) |
| 메인 앱 | React 18 + TypeScript + Vite + shadcn/ui + Tailwind |
| 게임 본체 | 대부분 `public/*.html` **단일 파일** (React 밖) |
| 배포 | `main` 푸시 → GitHub Actions → `docs/` 갱신 → Pages |
| 백엔드 | Supabase (플레이 카운트), Google Apps Script (문의 폼) |

---

## 2. 저장소 지도

```
math-game-archive-joy/
├── apps/
│   ├── main/              # 🏠 포털 (랜딩 + 게임 카탈로그) — 기본 dev 대상
│   ├── edugame_builder/   # 🪄 Gemini 기반 수학 게임 기획·프롬프트 생성기
│   ├── airing/            # 🎙️ 영어 회화 연습 (AI persona)
│   └── aieg/              # 📄 PDF + Gemini 영어 회화 (Live API)
├── public/                # 정적 자산 + HTML 게임 + 서브앱 빌드 산출물
│   ├── *.html             # 개별 수학/도구 게임 (배포 시 dist 루트에 복사)
│   ├── images/, videos/
│   ├── airing/            # airing 빌드 결과 (npm run build:airing)
│   ├── edugame_builder/   # edugame_builder 빌드 결과
│   └── aieg/              # aieg 빌드 결과
├── docs/                  # ⚠️ 배포 산출물 (CI가 자동 생성·커밋) — 수동 편집 비권장
├── dist/                  # 로컬 빌드 중간 산출물
├── scripts/               # PDF 파싱, curriculum 병합 등 유틸
├── .github/workflows/deploy.yml
├── CNAME                  # mathgame.kr
└── package.json           # 루트 workspace 스크립트
```

---

## 3. 앱별 역할과 빌드 출력

| 앱 | 경로 | dev 명령 | 빌드 출력 | URL base |
|----|------|----------|-----------|----------|
| **main** | `apps/main` | `npm run dev` (포트 **8080**) | `dist/main/` → 배포 시 `docs/` 루트 | `/`, `/main`, `/games` |
| **edugame_builder** | `apps/edugame_builder` | `npm run dev:edugame-builder` | `public/edugame_builder/` | `/edugame_builder/` |
| **airing** | `apps/airing` | `npm run dev:airing` | `public/airing/` | `/airing/` |
| **aieg** | `apps/aieg` | `npm run dev:aieg` | `public/aieg/` | `/aieg/` |

루트 스크립트:

```bash
npm install          # 전체 workspace 설치
npm run dev          # main만 (8080)
npm run build        # 전 앱 순차 빌드
npm run build:main   # main만
```

**main의 Vite 설정** (`apps/main/vite.config.ts`):

- `publicDir`: `../../public` — dev 시 public 정적 파일 서빙
- `build.outDir`: `../../dist/main`

---

## 4. 페이지·라우팅 구조 (main 앱)

라우팅은 `apps/main/src/App.tsx`에 정의됩니다.

| URL | 컴포넌트 | 역할 |
|-----|----------|------|
| `/`, `/main` | `pages/Main.tsx` | 랜딩, 추천/인기 게임 캐러셀, CTA |
| `/games` | `pages/Index.tsx` | 게임 카탈로그 (탭·필터·검색·모달) |
| `*` | `pages/NotFound.tsx` | 404 |

상단 네비: `components/MainNavigation.tsx` — `메인` / `게임하기` / `문의하기`

### 4.1 게임 카탈로그 (`Index.tsx`) 탭 구조

**메인 탭** (`mainTabs`):

- `middle` — 중학수학
- `high` — 고등수학
- `break-game` — 뇌풀기 게임
- `class-management` — 학급운영 (`gamesData` 항목 현재 비어 있음)

**서브 탭** (중학): `middle1`, `middle2`, `middle3`  
**서브 탭** (고등): `common-math`, `algebra`, `calculus1`, `calculus2`, `probability`, `geometry`, `ai-math`

탭 ID는 `gamesData`의 **키**와 1:1 대응해야 카드가 표시됩니다.

### 4.2 게임 카드 UI 흐름

1. `data/gamesData.ts` — 게임 메타데이터 (카테고리별 배열)
2. `components/GameCard.tsx` — 카드 UI, `GameData` 타입 정의
3. `components/GameModal.tsx` — 상세 모달 + 플레이 버튼
4. `hooks/useGameStats.ts` — Supabase `play_counts` 조회·증가
5. 플레이 시 `url`이 있으면 `window.open(game.url, '_blank')` + `incrementPlayCount`

### 4.3 `GameData` 필드 (편집 시 참고)

```ts
{
  id: string;           // Supabase game_id, 추천 JSON과 일치 권장
  title, description, icon, summary;
  status: 'playable' | 'development';
  difficulty: '초급' | '중급' | '고급';
  estimatedTime: string;
  url?: string;         // 예: '/apple_game.html' (루트相対 경로)
  mobile?: '지원' | '제한';
  category?, content?, terms?, standard?, type?;
}
```

**추천 게임** 목록: `data/recommendedGames.json` (id 배열) — `Main.tsx` 캐러셀용

---

## 5. 게임 콘텐츠 두 가지 유형

### A. standalone HTML (`public/*.html`)

실제 플레이 가능한 게임 대부분. React와 분리된 단일(또는 소수) HTML 파일.

현재 `public/` HTML 예시:

- `apple_game.html`, `number_flow.html`, `number_flow_integer.html`
- `shape_scanner.html`, `math_city.html`, `domineering.html`, `animal_shogi.html`
- `3D_tictactoe.html`, `ult_tictactoe.html`, `ult_3d_tictactoe.html`
- `polynomial_duel.html`, `coordinate_chess.html`, `set_master.html`
- `number_of_cases_challenge.html`
- `eduapp_builder.html`, `teacher_type.html`, `AI_Exam_Reviewer.html` (카탈로그 미등록 가능)

**새 HTML 게임 추가 절차**:

1. `public/새게임.html` 작성
2. `apps/main/src/data/gamesData.ts` 해당 탭 키에 항목 추가 (`status: 'playable'`, `url: '/새게임.html'`)
3. (선택) `recommendedGames.json`에 id 추가
4. 로컬 확인 후 `main` 브랜치 푸시 → CI 배포

### B. React 서브앱 (`apps/airing`, `apps/aieg`, `apps/edugame_builder`)

별도 Vite 앱으로 빌드 후 `public/<앱명>/`에 산출 → 배포 시 `docs/<앱명>/`로 복사.

- **edugame_builder**: 6단계 폼(Step1~6), Gemini API로 게임 기획·프롬프트 생성
- **airing**: persona 기반 영어 회화 UI
- **aieg**: PDF 업로드 + Gemini Live/REST 영어 회화

---

## 6. edugame_builder 구조 (자주 수정되는 영역)

```
apps/edugame_builder/
├── App.tsx                 # 스텝 네비, formData 상태
├── types.ts                # FormData 타입
├── constants.tsx           # STEP_NAMES, Icons
├── curriculum.json         # 교육과정 데이터
├── services/geminiService.ts
└── components/
    ├── steps/Step1.tsx ~ Step6.tsx
    ├── IdeaBooster.tsx, AICoach.tsx
    ├── Header.tsx, FooterNav.tsx, SettingsModal.tsx
```

- API 키: 루트 `.env.local`의 `GEMINI_API_KEY` 또는 앱 내 Settings + `localStorage('geminiApiKey')`
- `vite.config.ts`의 `loadEnv(mode, '../../', '')` — **env 파일은 저장소 루트**에 둠

---

## 7. 데이터·외부 서비스

### Supabase (플레이 카운트)

- 클라이언트: `apps/main/src/integrations/supabase/client.ts`
- 훅: `hooks/useGameStats.ts`
- 테이블: `play_counts` (`game_id`, `play_count`)
- RPC: `increment_play_count(gid)`
- 마이그레이션: `apps/main/supabase/migrations/`

새 게임 id를 쓰면 RPC/테이블에 해당 id로 카운트가 쌓입니다 (별도 스키마 변경 불필요).

### 문의 폼

- `components/ContactFormModal.tsx` → Google Apps Script Web App URL로 POST
- reCAPTCHA: `react-google-recaptcha`

### UI 컴포넌트

- shadcn/ui: `apps/main/src/components/ui/`
- 설정: `apps/main/components.json`
- 스타일: Tailwind + `src/index.css`
- alias: `@` → `apps/main/src`

---

## 8. 배포 파이프라인 (중요)

**트리거**: `main` 브랜치 push  
**워크플로**: `.github/workflows/deploy.yml`

```
1. public/*.html, images, videos, robots.txt → dist/ 복사
2. build:edugame-builder  → public/edugame_builder/
3. build:main             → dist/main/
4. dist/main/index.html, assets → dist/ 루트 병합
5. build:airing, build:aieg
6. public/airing, edugame_builder, aieg → dist/ 복사
7. rm docs && mv dist docs && cp CNAME docs/
8. git-auto-commit docs/** → "ci(deploy): update GitHub Pages"
```

**배포 후 URL 매핑** (`docs/` = 사이트 루트):

| 경로 | 내용 |
|------|------|
| `https://mathgame.kr/` | main React 앱 |
| `https://mathgame.kr/games` | 게임 카탈로그 (SPA — Pages에서 fallback 설정 확인) |
| `https://mathgame.kr/apple_game.html` | standalone 게임 |
| `https://mathgame.kr/edugame_builder/` | edugame_builder |
| `https://mathgame.kr/airing/` | airing |
| `https://mathgame.kr/aieg/` | aieg |

⚠️ **`docs/`는 CI 산출물**입니다. 기능 수정은 `apps/`, `public/`에서 하고 푸시하면 CI가 `docs/`를 갱신합니다.

---

## 9. AI가 자주 하는 작업 — 체크리스트

### 새 게임 카탈로그에 등록

- [ ] `public/<game>.html` (또는 기존 HTML 연결)
- [ ] `apps/main/src/data/gamesData.ts` — 올바른 탭 키 아래 항목 추가
- [ ] `id` 고유, `url`은 `/파일명.html` 형식
- [ ] (선택) `recommendedGames.json`

### 메인/카탈로그 UI만 수정

- [ ] `pages/Main.tsx`, `pages/Index.tsx`
- [ ] `components/GameCard.tsx`, `GameModal.tsx`, `NavigationTabs.tsx`

### edugame_builder 스텝·프롬프트 수정

- [ ] `components/steps/StepN.tsx`
- [ ] `services/geminiService.ts` (프롬프트 템플릿)
- [ ] `types.ts`, `constants.tsx`

### 스타일

- [ ] Tailwind 클래스 (컴포넌트 내)
- [ ] `tailwind.config.ts`, `index.css` (전역)

---

## 10. 환경 변수

| 변수 | 위치 | 사용 앱 |
|------|------|---------|
| `GEMINI_API_KEY` | 루트 `.env.local` (git 제외) | edugame_builder, (aieg는 localStorage도 사용) |

edugame_builder dev 시 루트에 `.env.local` 예시:

```
GEMINI_API_KEY=your_key_here
```

---

## 11. 기술 스택 요약

- **main**: React 18, TS, Vite 5, React Router 6, TanStack Query, shadcn/ui, Tailwind 3, Lucide
- **edugame_builder / airing**: React, Vite, TS (airing/edugame)
- **aieg**: React, Vite, JS, pdfjs-dist, Gemini API
- **Node**: CI는 24.x, 로컬 18+ 권장

---

## 12. 편집 시 주의사항

1. **경로 혼동**: 소스는 `apps/main/src/`, README 구버전의 `src/`는 무시
2. **public vs docs**: 게임 HTML은 `public/`에만 수정
3. **서브앱 base path**: `vite.config`의 `base: '/edugame_builder/'` 등 — 경로 변경 시 빌드·배포 URL 함께 수정
4. **SPA 라우팅**: `/games` 등 클라이언트 라우트는 GitHub Pages 404 처리에 의존 (현재 `index.html` 폴백 여부는 Pages 설정 확인)
5. **모노레포**: 루트 `npm install` 후 workspace 스크립트 사용
6. **lovable-tagger**: main dev 빌드에만 development 모드 플러그인 (무시 가능)

---

## 13. 관련 파일 빠른 참조

| 목적 | 파일 |
|------|------|
| 라우팅 | `apps/main/src/App.tsx` |
| 게임 목록 데이터 | `apps/main/src/data/gamesData.ts` |
| 추천 게임 | `apps/main/src/data/recommendedGames.json` |
| 게임 타입 | `apps/main/src/components/GameCard.tsx` |
| 플레이 통계 | `apps/main/src/hooks/useGameStats.ts` |
| 배포 CI | `.github/workflows/deploy.yml` |
| 도메인 | `CNAME` |
| 루트 스크립트 | `package.json` |

---

## 14. 프로젝트 소개 (사용자용 요약)

현직 교사가 만든 **디지털 수학 게임·교육 도구 아카이브**. 게임형 학습, 교과별 분류, 플레이 통계, 모바일 지원 여부 표시, Gemini 기반 게임 기획 도구(edugame_builder)를 포함합니다.

**제작**: 행복한윤쌤 | [블로그](https://blog.naver.com/happy_yoonssam)

---

*이 문서는 AI·개발 온보딩용입니다. 사용자 마케팅 페이지나 SEO 메타 가이드가 필요하면 별도 `docs/` 문서로 분리하는 것을 권장합니다.*
