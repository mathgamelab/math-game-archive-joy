# AI English Phone Tutor

AI 기반 영어 회화 연습 앱입니다. 실시간 음성 대화와 AI 튜터의 피드백을 제공합니다.

## 기능

- 실시간 음성 대화: 마이크로 말하고 AI 튜터가 음성으로 응답
- 다양한 튜터 페르소나: 세라(친절), 제이크(캐주얼), 톰슨(전문적)
- 난이도 조절: Easy, Medium, Hard
- 대화 모드: 자유 대화 또는 시나리오 기반
- 실시간 STT/TTS: 음성 인식 및 합성
- 피드백 제공: 대화 후 문법 교정 및 개선점 제공

## 사용 기술

- React 19 + TypeScript
- Vite
- Google Gemini API (`gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-3-flash-preview`)
- Web Audio API

## 로컬 개발

**필수 사항:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```

2. API 키 설정:
   `services/geminiService.ts` 파일 상단에 있는 `GEMINI_API_KEY`를 배포용 키로 변경하세요.
   
   **보안 권장사항:**
   - Google Cloud Console에서 HTTP referrer 제한을 설정하세요
   - 배포 도메인(`https://mathgame.kr/*`)만 허용하도록 제한하는 것을 권장합니다

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```

4. 빌드:
   ```bash
   npm run build
   ```

## 배포

이 앱은 `mathgame.kr/airing/` 경로에 배포됩니다.

빌드된 파일은 `../../public/airing/` 디렉토리에 생성됩니다.

## API 키 설정

### Google Cloud Console에서 API 키 제한 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. "API 및 서비스" > "사용자 인증 정보" 이동
3. 해당 API 키 클릭
4. "애플리케이션 제한사항" 섹션에서:
   - "HTTP 리퍼러(웹사이트)" 선택
   - "웹사이트 제한사항"에 다음 추가:
     * `https://mathgame.kr/*`
     * `https://mathgame.kr`
     * `http://localhost:3000/*`
     * `http://localhost:3000`
     * `http://127.0.0.1:3000/*`
5. 저장

이렇게 설정하면 `mathgame.kr` 도메인에서만 API 키가 사용됩니다.
