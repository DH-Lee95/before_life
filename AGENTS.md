# 프로젝트: 전생서랍

## 기술 스택
- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS
- Vitest + React Testing Library

## 아키텍처 규칙
- CRITICAL: 모든 서버 API 로직은 `src/app/api/` 라우트 핸들러에서 처리한다.
- CRITICAL: 클라이언트 컴포넌트에서 OpenAI, Supabase service role, PG secret 등 외부 비밀 API를 직접 호출하지 않는다.
- CRITICAL: 동일 입력은 동일 `soul_hash`와 동일 `SoulProfile`을 생성해야 한다.
- CRITICAL: 화면 표시용 `display_soul_id`만으로 결과를 조회하게 만들지 않는다.
- Soul Engine은 `src/lib/soul/`의 순수 함수 중심으로 유지한다.
- 질문, 콘텐츠 타입, 가격은 `src/config/`에 분리한다.
- 컴포넌트는 `src/components/`, 도메인 타입은 `src/types/`에 둔다.

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성한다.
- 커밋 메시지는 conventional commits 형식을 따른다. 예: `feat: add soul engine`

## 명령어
```bash
npm run dev
npm run build
npm run lint
npm run test
```
