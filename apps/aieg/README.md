# 📞 AI Phone English

AI 전화영어 앱 - Gemini Live API 기반 실시간 음성 대화 영어 학습 도구

## 실행 방법

### 1. Node.js 설치 확인
```bash
node -v   # v18 이상 필요
npm -v
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 으로 자동 열립니다.

### 4. 배포용 빌드
```bash
npm run build
```
`dist/` 폴더가 생성되며, 이 폴더를 정적 호스팅(Netlify, Vercel, GitHub Pages 등)에 업로드하면 됩니다.

## 배포 방법 (Vercel 추천)

1. [vercel.com](https://vercel.com)에서 GitHub 연동
2. 이 폴더를 GitHub 저장소에 push
3. Vercel에서 Import → 자동 배포 완료

또는 CLI로:
```bash
npm i -g vercel
vercel
```

## 주의사항

- **마이크 권한**: 브라우저에서 마이크 접근을 허용해야 합니다
- **HTTPS 필수**: 배포 시 반드시 HTTPS 환경이어야 마이크가 작동합니다 (localhost는 예외)
- **API Key**: `src/App.jsx` 상단의 `API_KEY` 값을 교체하세요
- **Gemini Live API**: Preview 단계이므로 실시간 자막(transcription) 기능이 불안정할 수 있습니다

## 프로젝트 구조

```
ai-phone-english/
├── index.html          # 진입점 HTML
├── package.json        # 의존성 및 스크립트
├── vite.config.js      # Vite 설정
├── README.md
└── src/
    ├── main.jsx        # React 마운트
    └── App.jsx         # 메인 앱 (설정/통화/피드백 화면)
```

## 기술 스택

- **Frontend**: React 18 + Vite
- **음성 엔진**: Gemini Live API (WebSocket 양방향 오디오 스트리밍)
- **피드백 분석**: Gemini 2.5 Flash REST API
- **폰트**: Pretendard (한글 최적화)
