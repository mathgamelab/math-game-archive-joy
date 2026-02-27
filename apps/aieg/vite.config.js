import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포 및 모노레포 워크플로우 연동을 위한 설정
export default defineConfig({
  base: '/aieg/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // 다른 앱과 동일하게 public/ 아래에 빌드 결과를 둠
    outDir: '../../public/aieg',
    emptyOutDir: true,
  },
})
