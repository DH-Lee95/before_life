# Phase 1 구현 상태

작성일: 2026-08-18

## 구현 완료
- Next.js App Router 기반 앱 골격
- 모바일 우선 랜딩 페이지: `/`
- 무료 테스트 페이지: `/test`
- 분석 중 페이지: `/analyzing`
- 결과 페이지: `/result/[profileId]?token=...`
- 7개 비유도형 질문 config
- 닉네임, 양력 생년월일, 선택 출생시간 입력
- 입력 정규화와 Unicode normalization
- SHA-256 기반 `soul_hash`와 표시용 `displaySoulId`
- deterministic Soul Engine
- 대표 전생 기록 1개 + 희미한 추가 기록 2개
- 무료 결과 생성과 cached content 저장
- 생년월일 기반 `BirthProfile` feature 계산
- deterministic `NatureSummary` 생성과 무료 결과 연결
- API 입력 검증과 warm drawer 테마 적용
- 잠긴 콘텐츠 UI와 결제 필요 안내
- 익명 세션 cookie
- 긴 `result_token` 기반 결과 조회
- analytics event 수집용 API
- TDD 기준 unit/component test

## 주요 파일
- `src/app/page.tsx`: 모바일 랜딩
- `src/app/test/page.tsx`: 테스트 진입
- `src/app/result/[profileId]/page.tsx`: 결과 페이지
- `src/components/TestForm.tsx`: 질문 플로우
- `src/components/ResultView.tsx`: 무료 결과와 잠긴 콘텐츠 UI
- `src/lib/soul/createSoulProfile.ts`: deterministic Soul Engine 진입점
- `src/lib/repository/memorySoulRepository.ts`: Phase 1 로컬 저장소
- `src/app/api/soul/create/route.ts`: 결과 생성 API
- `src/app/api/soul/result/[profileId]/route.ts`: 결과 조회 API

## 실행 방법
```bash
npm install --strict-ssl=false
npm run dev
```

현재 개발 서버는 `http://localhost:3001`에서 실행 중이다. 3000번 포트가 이미 사용 중이라 Next.js가 3001번을 선택했다.

## 검증 결과
```bash
npm run test
# 30 test files, 33 tests passed

npm run build
# production build passed

npm run lint
# no ESLint warnings or errors
```

## 운영 전 필수 보완
- 현재 구현은 `Warm Drawer Archive` 팔레트와 `전생 서랍` 표기를 사용한다.
- `SoulProfile`과 무료 결과 타입에 성향 요약을 포함하고, 결과 화면에서 대표 전생보다 먼저 표시한다.
- 실제 입력 JSON은 서버 검증을 거친다. 닉네임, 날짜, 시간, 답변 ID가 유효하지 않으면 요청을 거부한다.
- 잠긴 기록 클릭은 현재 analytics 기록까지만 처리한다. 실제 로그인/결제/unlock API는 Phase 2에서 구현한다.
- Phase 1 저장소는 메모리 기반이라 서버 재시작 시 결과가 사라진다. 운영 전 Supabase 구현이 필요하다.
- 실제 OpenAI 호출은 아직 붙이지 않았다. 현재 무료 결과는 deterministic local writer가 생성한다.
- 실제 로그인, Soul balance, PG 결제, unlock idempotency는 Phase 2 범위다.
- `npm audit --omit=dev --strict-ssl=false` 결과 Next 15 계열 하위 의존성에서 high 취약점이 보고됐다. 자동 수정은 Next 16 breaking upgrade를 요구하므로, 운영 배포 전 Next/ESLint 업그레이드 계획을 별도 작업으로 처리해야 한다.

## 다음 단계
1. Supabase schema와 repository 구현
2. Kakao 또는 이메일 로그인과 익명 결과 claim flow
3. Toss Payments 결제위젯 또는 PortOne 연동
4. `payment_intents`, `transactions`, `soul_ledger` 기반 결제/잔액 처리
5. 유료 콘텐츠 unlock과 OpenAI content provider 캐싱
