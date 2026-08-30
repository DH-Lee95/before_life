# Phase 1 구현 상태

최종 갱신: 2026-08-31

## 구현 완료
- Next.js App Router 기반 앱 골격
- 모바일 우선 랜딩 페이지: `/`
- 무료 테스트 페이지: `/test`
- 분석 중 페이지: `/analyzing`
- 결과 페이지: `/result/[profileId]` (공유 토큰은 서버에 전송되지 않는 fragment 사용)
- 7개 비유도형 질문 config
- 이름, 양력 생년월일, 선택 출생시간/모름 입력
- 입력 정규화와 Unicode normalization
- SHA-256 기반 `soul_hash`와 표시용 `displaySoulId`
- deterministic Soul Engine
- 답변 의미별 trait 가중치와 5개 archetype 기반 전생 생성
- 닉네임 변경에도 핵심 전생 결과가 유지되는 reading seed
- 대표 전생 기록 1개 + 희미한 추가 기록 2개
- 무료 결과 생성과 cached content 저장
- 생년월일 기반 `BirthProfile` feature 계산
- deterministic `NatureSummary` 생성과 무료 결과 연결
- API 입력 검증과 warm drawer 테마 적용
- 사랑, 마지막 날, 재산, 업보, 현생 영향, 두 번째 전생의 무료 심화 기록
- 익명 세션 cookie
- 긴 `result_token` 또는 익명 세션 소유권 기반 결과 조회
- 결과 토큰의 query URL 노출 제거와 header 기반 공유 조회
- Toss Payments 결제위젯 기반 소울 충전 주문·승인 UI/API
- 서버 가격 검증, 승인 멱등성, payment transaction·soul ledger 원장
- 작성 중 답변 `sessionStorage` 복구
- 결과 API 공개 DTO와 analytics 입력 검증
- analytics event 수집용 API
- TDD 기준 unit/component test
- Supabase Postgres migration과 비동기 repository 계약
- result token hash·익명 세션을 별도 접근권한 행으로 저장하는 Supabase repository
- 환경 변수 완전 설정 시 Supabase, 미설정 시 로컬 memory를 선택하는 서버 provider
- 카카오 OAuth 로그인과 익명 결과의 계정 claim
- OAuth provider가 callback query를 보존하지 않아도 안전한 결과 복귀 경로 유지
- 로그인 계정의 소울 잔액 기반 유료 장문 생성·캐시·잠금 해제 API
- 계정별 `soul_content_unlocks` 권한과 사용자 단위 동시 차감 직렬화
- 새로고침 후 로그인 계정의 열린 기록 복원
- Supabase `before_life` 프로젝트에 계정별 unlock 스키마 배포
- Analytics API의 Supabase 영속 저장과 cookie 기반 익명 세션 연결

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

## 검증 결과
```bash
npm run test -- --run
# 84 test files / 171 tests passed, 1 integration test skipped without credentials

npm run build
# production build passed

npm run lint
# no ESLint warnings or errors
```

## 운영 전 필수 보완
- 현재 구현은 `Warm Drawer Archive` 팔레트와 `전생 서랍` 표기를 사용한다.
- `SoulProfile`과 무료 결과 타입에 성향 요약을 포함하고, 결과 화면에서 대표 전생보다 먼저 표시한다.
- 실제 입력 JSON은 서버 검증을 거친다. 닉네임, 날짜, 시간, 답변 ID가 유효하지 않으면 요청을 거부한다.
- `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 함께 설정하고 migration을 적용하면 결과가 영속 저장된다. 둘 다 없을 때만 로컬 memory 저장소를 사용한다.
- `analytics_events`는 Supabase 설정 환경에서 영속 저장하고 anon/authenticated의 테이블 직접 접근은 차단한다.
- 무료 결과는 deterministic local writer가 생성한다. 유료 장문은 로그인 계정의 unlock 시점에 OpenAI 서버 provider로 생성하고 결정적 generation key로 캐시한다.
- 콘텐츠 캐시는 동일 입력에서 재사용하지만, 열람 권한은 계정별 행으로 분리해 다른 계정이나 공유 토큰 조회자에게 유료 본문을 노출하지 않는다.
- `npm audit --omit=dev --strict-ssl=false` 결과 Next 15 계열 하위 의존성에서 high 취약점이 보고됐다. 자동 수정은 Next 16 breaking upgrade를 요구하므로, 운영 배포 전 Next/ESLint 업그레이드 계획을 별도 작업으로 처리해야 한다.

## 다음 단계
1. 실제 계정 2개로 로그인→충전→unlock→새로고침, 동시 요청 1회 차감, 교차 계정/공유 토큰 격리를 수동 검증
2. 실제 모바일 브라우저 E2E 테스트
3. archetype·문장 풀에 대한 실제 사용자 결과 품질 검증
