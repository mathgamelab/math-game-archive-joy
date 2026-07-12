# Play Math Archive — AI·개발 에이전트 온보딩

> **대상 독자**: Cursor, Claude, ChatGPT 등 코드 편집 AI 및 개발자  
> **사람용 소개**: [README.md](./README.md)  
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
│   └── edugame_builder/   # 🪄 Gemini 기반 수학 게임 기획·프롬프트 생성기
├── public/                # 정적 자산 + HTML 게임 + 서브앱 빌드 산출물
│   ├── *.html             # 개별 수학/도구 게임 (배포 시 dist 루트에 복사)
│   ├── images/, videos/
│   └── edugame_builder/   # edugame_builder 빌드 결과
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

**메인 탭** (`gradeTabs`):

- `middle` — 중학수학
- `high` — 고등수학
- `break-game` — 뇌풀기 게임
- `math-experience` — 수학 체험 (교과 밖 체험형; 구 `mathday` URL은 `math-experience`로 정규화)
- `class-management` — 학급운영 (`gamesData` 항목 현재 비어 있음)

**서브 탭** (중학): `middle1`, `middle2`, `middle3`  
**서브 탭** (고등): `common-math`, `algebra`, `calculus1`, `calculus2`, `probability`, `geometry`, `ai-math`  
**서브 탭** (수학 체험): `math-experience`

탭 ID는 `gamesData`의 **키**와 1:1 대응해야 카드가 표시됩니다.

### 4.2 게임 카드 UI 흐름

1. `data/gamesData.ts` — 게임 메타데이터 (카테고리별 배열)
2. `components/GameCard.tsx` — 카드 UI, `GameData` 타입·클레이 아이콘 맵
3. `components/GameModal.tsx` — 상세 모달 + 플레이 버튼
4. `hooks/useGameStats.ts` / `lib/playCount` — Supabase `play_counts` 조회·증가
5. 플레이 시 `url`이 있으면 `window.open(game.url, '_blank')` + `incrementPlayCount`

카드 배지:

- **플레이 가능** 태그는 쓰지 않음 (`status: 'development'`일 때만 `개발 중` 표시)
- **모바일 가능**은 `mobile: '지원'`(반응형 설계된 게임)에만 표시. `제한`이면 태그 자체를 붙이지 않음

### 4.3 `GameData` 필드 (편집 시 참고)

```ts
{
  id: string;           // Supabase game_id, 추천 JSON·클레이 아이콘 키와 일치 권장
  title, description, icon, summary;
  status: 'playable' | 'development';
  difficulty: '초급' | '중급' | '고급';
  estimatedTime: string;
  url?: string;         // 예: '/apple_game.html' (루트 상대 경로)
  mobile?: '지원' | '제한';  // '지원'일 때만 카드에 "모바일 가능" 표시
  clayIcon?: string;    // 예: '/images/clay/games/foo.png' (없으면 CLAY_ICONS[id] 사용)
  category?, content?, terms?, standard?, type?;
}
```

**추천 게임** 목록: `data/recommendedGames.json` (id 배열) — `Main.tsx` 캐러셀용

### 4.4 게임 카드 아이콘 — 클레이모피즘 (필수)

카탈로그·모달 썸네일은 **클레이모피즘(claymorphism)** 스타일만 사용합니다.  
저장 위치: `public/images/clay/games/<game-id>.png`  
등록: `GameCard.tsx`의 `CLAY_ICONS` 맵 및/또는 `gamesData`의 `clayIcon` 필드.

참고 에셋: `public/images/clay/games/pi-draw.png`, `pi-bulloon.png`, `number-flow.png` 등.

#### 스타일 정의

| 항목 | 지침 |
|------|------|
| 스타일명 | **클레이모피즘** / soft 3D clay / hand-sculpted matte clay |
| 재질 | 무광(matte) 점토·플레이도우. **광택·유리·메탈·플랫 벡터 금지** |
| 형태 | 두툼하고 둥근(squircle)·부푼(puffy) 실루엣. 날카로운 모서리 없음 |
| 조명 | 부드러운 탑-레프트 디퓨즈 라이트, **안쪽 그림자(inner shadow)** 로 볼륨, 은은한 drop shadow |
| 배경 | 최종 파일은 **투명 PNG**. 생성기는 보통 흰/회색 배경을 붙이므로 **저장 전 반드시 배경 제거** |
| 구도 | 게임 핵심 모티프 1~2개만. 텍스트 로고·한글 문구 넣지 않음(숫자·π·기호는 점토 오브젝트로 OK) |
| 비율 | **1:1** 정사각, 여백 넉넉히(카드 crop에 잘리지 않게) |
| 포맷 | **PNG** (알파 채널 포함) |

#### 이미지 생성 프롬프트 템플릿

새 게임 아이콘을 생성할 때 아래를 기본으로 쓰고, `[게임 모티프]`만 바꿉니다.  
(`transparent background`는 남겨 두되, **생성 결과만으로 투명을 기대하지 말 것**.)

```
Claymorphism 3D game icon, soft matte modeling-clay texture, puffy rounded forms,
gentle inner shadows and soft diffused drop shadow, pastel friendly colors,
hand-sculpted toy-like look, no gloss, no flat vector, no sharp edges,
square composition with generous padding, transparent background,
subject: [게임 모티프 — 예: five chunky clay bit cards showing 1 and 0 with a soft clay magnifying glass]
```

#### 배경 제거 (필수)

이미지 생성 도구는 프롬프트에 투명을 적어도 **단색 배경(흰색·밝은 회색 등)을 넣는 경우가 대부분**입니다.  
때로는 진짜 투명이 아니라 **체커보드(회색·흰 격자)를 배경에 그려 넣는 경우**도 있습니다. 이 격자는 미리보기용 표시가 아니라 **불투명 픽셀**이므로, 사이트 카드에 그대로 노출됩니다.

`public/images/clay/games/`에 넣기 **전에** 배경을 알파 0으로 지웁니다.

권장 방법 (Pillow):

1. RGBA로 연다
2. 네 모서리·변 중앙·**도넛 구멍 등 내부 빈 영역**까지 시드로 flood-fill
3. 흰(~253)과 회색(~225) **격자 양쪽**을 모두 배경으로 취급 (한쪽만 지우면 체커보드가 남음)
4. 저장 후 모서리·중앙 빈 곳 `alpha == 0`인지 확인. 카드 UI에 올렸을 때 격자가 보이면 실패

```python
# 개념 예시: 모서리 flood-fill → 밝은 단색 배경을 투명 처리
from PIL import Image
from collections import deque

img = Image.open("generated.png").convert("RGBA")
w, h = img.size
px = img.load()

def is_bg(r, g, b, a):
    return a > 0 and min(r, g, b) >= 200 and max(r, g, b) <= 255 and abs(r - g) < 20 and abs(g - b) < 20

visited = [[False] * w for _ in range(h)]
q = deque()
for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2)]:
    q.append((x, y))
    visited[y][x] = True
while q:
    x, y = q.popleft()
    r, g, b, a = px[x, y]
    if not is_bg(r, g, b, a):
        continue
    px[x, y] = (r, g, b, 0)
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
            visited[ny][nx] = True
            if is_bg(*px[nx, ny]):
                q.append((nx, ny))
img.save("public/images/clay/games/<id>.png", "PNG")
```

#### 등록 체크리스트

- [ ] 클레이모피즘으로 생성
- [ ] **배경 제거 후** `public/images/clay/games/<id>.png` 저장 (모서리 투명 확인)
- [ ] `GameCard.tsx` `CLAY_ICONS`에 `id → 경로` 추가 (또는 `clayIcon` 지정)
- [ ] 플랫/벡터/다른 테마 아이콘을 clay 폴더에 넣지 않음
- [ ] HTML 게임 헤더용 별도 마스코트(`images/sutam.png` 등)와 혼동하지 않음 — **카드 썸네일 ≠ 인게임 마스코트**

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

1. `public/새게임.html` 작성 (반응형·푸터 등 기존 체험 게임 패턴 참고)
2. `apps/main/src/data/gamesData.ts` 해당 탭 키에 항목 추가 (`status: 'playable'`, `url: '/새게임.html'`)
3. **클레이모피즘** 카드 아이콘 생성 → `public/images/clay/games/<id>.png` + `CLAY_ICONS`/`clayIcon` 등록 (§4.4)
4. 모바일 대응 완료 시에만 `mobile: '지원'`
5. (선택) `recommendedGames.json`에 id 추가
6. 로컬 확인 후 `main` 브랜치 푸시 → CI 배포

### B. React 서브앱 (`apps/edugame_builder`)

별도 Vite 앱으로 빌드 후 `public/edugame_builder/`에 산출 → 배포 시 `docs/edugame_builder/`로 복사.

- **edugame_builder**: 6단계 폼(Step1~6), Gemini API로 게임 기획·프롬프트 생성

---

## 6. edugame_builder 구조 (자주 수정되는 영역)

```
apps/edugame_builder/
├── App.tsx                 # 스텝 네비, formData 상태
├── types.ts                # FormData 타입
├── constants.tsx           # STEP_NAMES, Icons
├── curriculum.json         # 교육과정 데이터 (전 교과)
├── mathcurriculum.json     # 수학 성취기준만 추출
├── mathcurriculum.tsx      # 수학 curriculum 변환
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
5. public/edugame_builder → dist/ 복사
6. rm docs && mv dist docs && cp CNAME docs/
8. git-auto-commit docs/** → "ci(deploy): update GitHub Pages"
```

**배포 후 URL 매핑** (`docs/` = 사이트 루트):

| 경로 | 내용 |
|------|------|
| `https://mathgame.kr/` | main React 앱 |
| `https://mathgame.kr/games` | 게임 카탈로그 |
| `https://mathgame.kr/apple_game.html` | standalone 게임 |
| `https://mathgame.kr/edugame_builder/` | edugame_builder |

⚠️ **`docs/`는 CI 산출물**입니다. 기능 수정은 `apps/`, `public/`에서 하고 푸시하면 CI가 `docs/`를 갱신합니다.

⚠️ **편집 위치**: 게임·정적 파일은 `public/`만 수정. `docs/`, `docs/main/`은 수정하지 않음.
⚠️ **프론트 UI**: 랜딩·목록·네비·카드는 `apps/main/src/`만 수정. `public/*.html` 개별 게임은 UI 리디자인 대상이 아님.

---

## 9. AI가 자주 하는 작업 — 체크리스트

### 새 게임 카탈로그에 등록

- [ ] `public/<game>.html` (또는 기존 HTML 연결)
- [ ] `apps/main/src/data/gamesData.ts` — 올바른 탭 키 아래 항목 추가
- [ ] `id` 고유, `url`은 `/파일명.html` 형식
- [ ] 클레이모피즘 아이콘 `public/images/clay/games/<id>.png` + `CLAY_ICONS`/`clayIcon` (§4.4)
- [ ] 반응형이면 `mobile: '지원'`, 아니면 `제한`(모바일 태그 미표시)
- [ ] (선택) `recommendedGames.json`

### 메인/카탈로그 UI만 수정

- [ ] `pages/Main.tsx`, `pages/Index.tsx`
- [ ] `components/GameCard.tsx`, `GameModal.tsx`, `NavigationTabs.tsx`

### edugame_builder 스텝·프롬프트 수정

- [ ] `components/steps/StepN.tsx`
- [ ] `services/geminiService.ts` (프롬프트 템플릿)
- [ ] `types.ts`, `constants.tsx`

---

## 10. 환경 변수

| 변수 | 위치 | 사용 앱 |
|------|------|---------|
| `GEMINI_API_KEY` | 루트 `.env.local` (git 제외) | edugame_builder |

---

## 11. 기술 스택 요약

- **main**: React 18, TS, Vite 5, React Router 6, TanStack Query, shadcn/ui, Tailwind 3, Lucide
- **edugame_builder**: React, Vite, TS
- **Node**: CI는 24.x, 로컬 18+ 권장

---

## 12. 관련 파일 빠른 참조

| 목적 | 파일 |
|------|------|
| 라우팅 | `apps/main/src/App.tsx` |
| 게임 목록 데이터 | `apps/main/src/data/gamesData.ts` |
| 추천 게임 | `apps/main/src/data/recommendedGames.json` |
| 게임 타입·클레이 아이콘 맵 | `apps/main/src/components/GameCard.tsx` |
| 클레이 아이콘 에셋 | `public/images/clay/games/` |
| 인게임 공통 마스코트 | `public/images/sutam.png` |
| 플레이 통계 | `apps/main/src/hooks/useGameStats.ts` |
| 배포 CI | `.github/workflows/deploy.yml` |
| 도메인 | `CNAME` |
| 루트 스크립트 | `package.json` |
