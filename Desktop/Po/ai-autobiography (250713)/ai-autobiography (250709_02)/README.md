# 프로젝트 규칙 및 개발 가이드라인 (init_project_rules)

## 1. 코드 스타일 & 포맷팅
- Prettier, ESLint 사용 필수
- 커밋 전 `npm run lint` 및 `npm run format` 권장
- 파일명, 컴포넌트명은 일관된 케이스 사용(카멜/케밥 혼용 금지)

## 2. 폴더 구조
- `app/` : Next.js 라우트 및 페이지
- `components/` : 재사용 가능한 UI/로직 컴포넌트
- `lib/` : 외부 API, 유틸리티 함수
- `hooks/` : 커스텀 훅
- `public/` : 정적 파일(이미지 등)
- `styles/` : 글로벌/커스텀 CSS

## 3. 커밋 메시지 규칙
- [타입] 요약 (예: `feat: 자서전 생성 기능 추가`)
- 타입 예시: feat, fix, refactor, style, docs, chore, test

## 4. 브랜치 전략
- `main`(또는 `master`)은 항상 배포 가능한 상태 유지
- 기능 개발은 `feature/`, 버그 수정은 `fix/` 브랜치에서 작업

## 5. PR(풀리퀘스트) 규칙
- PR에는 변경 요약, 테스트 방법, 스크린샷(필요시) 포함
- 리뷰어 1명 이상 승인 후 머지

## 6. 환경 변수 관리
- `.env.local`에 민감 정보(키 등) 저장, `.env.example`로 템플릿 제공
- API 키 등은 코드에 직접 노출 금지

## 7. 이미지 생성/출력 규칙
- 이미지는 반드시 백엔드 API를 통해 생성
- 프론트엔드는 API 호출만 담당, 직접 이미지 생성 금지
- 이미지 프롬프트에는 이름, 나이, 성별 필수 포함
- 일본/중국 스타일 금지, 한국 스타일만 허용

## 8. UI/UX
- 자서전/블로그 화면은 “고전 성경책” 느낌의 디자인 유지
- 모든 출력은 반응형(모바일/PC) 지원

## 9. 기타
- 외부 라이브러리 추가 시 사전 논의
- 코드/문서/디자인 등 모든 변경은 기록 및 공유

---

아래는 기존 README 내용입니다. 