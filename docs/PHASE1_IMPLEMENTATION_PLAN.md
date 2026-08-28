# Phase 1 구현 계획: 전생서랍 MVP

작성일: 2026-08-18  
검토일: 2026-08-22  
범위: 무료 전생 분석, deterministic Soul Engine, 생년월일 기반 성향 요약, 무료 결과, 잠긴 콘텐츠 UI, 이벤트 기록까지 구현한다. Phase 1에서는 실제 결제, 유료 콘텐츠 unlock, OpenAI 호출을 운영 경로에 포함하지 않는다.

운영 리스크 방어 기준:

- `docs/OPERATIONAL_EDGE_CASES_AND_PAYMENT_PLAN.md`를 반드시 함께 따른다.
- 특히 anonymous session, result_token, idempotent create, 결제 전 로그인 필수, payment intent, transaction, soul ledger, unlock idempotency 원칙을 깨지 않는다.

---

## 1. 구현 목표

Phase 1의 완료 기준은 사용자가 다음 흐름을 끝까지 경험하는 것이다.

```text
랜딩 진입
→ 닉네임/생년월일/출생시간 선택 입력
→ 7개 질문 답변
→ 전생서랍 ID 생성
→ 대표 전생 기록 1개 + 희미한 추가 기록 2개 확인
→ 잠긴 기록 preview 확인
→ 잠긴 기록 클릭
→ Soul 필요 안내 또는 결제 준비 화면 진입
```

Phase 1에서 반드시 보장해야 하는 것:

- 동일 입력은 동일 Soul ID를 만든다.
- 동일 Soul ID는 동일 Soul Profile을 만든다.
- LLM은 핵심 전생 설정을 바꾸지 못한다.
- 이미 생성된 무료 결과는 재사용된다.
- 클라이언트는 Soul balance, profile, content unlock 상태를 직접 조작하지 못한다.
- 모바일 화면에서 CTA, 질문, 결과, 잠긴 기록이 자연스럽게 이어진다.
- 짧은 Soul ID만으로 결과를 조회할 수 없게 한다.
- 새로고침/뒤로가기/중복 제출로 profile과 free result가 중복 생성되지 않게 한다.

현재 구현 기준선:

- Soul Engine, 입력 정규화, 메모리 repository, 무료 결과, 결과 token, 기본 화면과 테스트는 구현되어 있다.
- `전생 서랍`의 연한 종이/목재 톤, 성향 요약 패널, 첫 번째 서랍을 여는 시각 흐름은 아직 화면 코드에 완전히 반영되지 않은 보완 항목이다.
- 따라서 아래 계획에서 이미 구현된 항목은 회귀 테스트 대상으로 보고, 컨셉 보완 항목은 별도 구현 단계로 취급한다.

---

## 2. Phase 1에서 하지 않을 것

- 실제 PG 결제
- Soul balance 충전
- 실제 unlock 차감
- 커플/궁합/추천
- 공유 이미지 생성
- 관리자 대시보드
- 출생지, 음력 변환, 정통 만세력
- 사진/얼굴 업로드

---

## 3. 기술 기준

권장 스택:

```text
Next.js App Router
TypeScript strict
Tailwind CSS
Vitest
React Testing Library
Supabase Postgres/Auth 준비
OpenAI API provider interface
```

테스트:

- Soul Engine과 입력 정규화는 unit test 우선
- API route는 repository/LLM provider mock으로 테스트
- 화면은 핵심 컴포넌트 단위 테스트 + 수동 모바일 확인
- Playwright는 Phase 1 말미 또는 Phase 2부터 도입해도 된다.

---

## 4. 아키텍처 원칙

1. 클라이언트 컴포넌트에서 OpenAI API를 직접 호출하지 않는다.
2. 클라이언트 컴포넌트에서 Supabase service role key를 사용하지 않는다.
3. Soul Engine은 순수 함수 중심으로 만든다.
4. Soul Profile 생성은 deterministic해야 한다.
5. LLM 결과는 content cache를 먼저 확인한 뒤 없을 때만 생성한다.
6. 질문/가격/콘텐츠 타입은 config 파일로 분리한다.
7. UI는 `전생서랍`을 전면에 두고 `Soul Archive`는 내부/보조 표현으로만 둔다.
8. 결제, balance, unlock은 Phase 2부터 로그인 사용자에게만 허용한다.
9. `display_soul_id`는 표시용이다. 조회 권한에는 `result_token`, `anonymous_session_id`, `user_id`를 사용한다.
10. 모든 생성/결제/unlock API는 중복 호출에 안전해야 한다.

---

## 5. 구현 단계

### Step 0. 문서 기준 정리

목표:

- placeholder 상태인 `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/UI_GUIDE.md`, `docs/ADR.md`를 현재 기획에 맞게 업데이트한다.

산출물:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md`
- `docs/ADR.md`

검증:

```bash
rg "{|}" docs/PRD.md docs/ARCHITECTURE.md docs/UI_GUIDE.md docs/ADR.md
```

placeholder가 남아 있지 않아야 한다.

---

### Step 1. Next.js 프로젝트 셋업

목표:

- 현재 문서 중심 저장소를 실제 Next.js 앱으로 초기화한다.
- TypeScript strict, Tailwind, ESLint, 테스트 환경을 준비한다.

산출물:

```text
package.json
next.config.*
tsconfig.json
tailwind.config.*
postcss.config.*
src/app/
src/components/
src/lib/
src/config/
src/types/
tests/
```

검증:

```bash
npm run lint
npm run test
npm run build
```

주의:

- 새 프로젝트 생성 시 기존 `docs/`, `scripts/`, `.codex/`를 덮어쓰지 않는다.
- 네트워크로 패키지 설치가 필요하므로 실제 실행 시 승인 요청이 필요할 수 있다.

---

### Step 2. 도메인 타입과 config 작성

목표:

- 구현 전 데이터 계약을 먼저 고정한다.
- 질문, 콘텐츠 타입, pricing mock, engine version을 config로 분리한다.

주요 파일:

```text
src/types/soul.ts
src/types/analytics.ts
src/types/payment.ts
src/config/questions.ts
src/config/contentTypes.ts
src/config/pricing.ts
src/config/soulEnginePools.ts
```

핵심 타입:

```ts
type SoulInput
type NormalizedSoulInput
type SoulProfile
type PastLifeRecord
type NatureSummary
type LockedContentType
type SoulContent
type AnalyticsEventName
```

검증:

```bash
npm run test
npm run build
```

---

### Step 3. Soul Engine TDD 구현

목표:

- 동일 입력이 항상 동일한 Soul ID와 Soul Profile을 생성하게 한다.

주요 파일:

```text
src/lib/soul/normalizeInput.ts
src/lib/soul/createSoulId.ts
src/lib/soul/seededRandom.ts
src/lib/soul/calculateBirthProfile.ts
src/lib/soul/calculateTraits.ts
src/lib/soul/createSoulProfile.ts
tests/soul-engine/
```

필수 테스트:

- 닉네임 공백/대소문자/Unicode normalization 처리
- 날짜 `YYYY-MM-DD` 정규화
- 출생 시간 미입력 시 `unknown`
- 같은 입력은 같은 Soul ID
- 같은 입력은 같은 대표 기록과 희미한 추가 기록
- 같은 입력은 같은 `natureSummary`와 대표 기록 추천
- 질문 답변이 바뀌면 trait와 profile이 달라짐
- LLM 없이도 profile 생성 가능

검증:

```bash
npm run test -- soul-engine
npm run build
```

---

### Step 4. 저장소 계층과 DB schema 준비

목표:

- Phase 1에서는 Supabase를 전제로 schema를 만들되, 로컬 개발과 테스트는 mock repository로 가능하게 한다.

주요 파일:

```text
src/lib/repository/soulProfileRepository.ts
src/lib/repository/soulContentRepository.ts
src/lib/repository/analyticsRepository.ts
src/lib/repository/anonymousSessionRepository.ts
src/lib/supabase/server.ts
supabase/migrations/001_initial_schema.sql
tests/repositories/
```

구현 방침:

- repository interface를 먼저 만든다.
- test에서는 in-memory repository를 쓴다.
- production에서는 Supabase repository를 쓴다.
- `soul_hash + input_version + engine_version` unique constraint를 둔다.
- `display_soul_id`는 화면 표시용으로만 쓰고 조회 권한으로 쓰지 않는다.
- `result_token_hash`를 저장해 결과 페이지 접근을 보호한다.

검증:

```bash
npm run test
npm run build
```

---

### Step 5. deterministic 무료 결과 생성

목표:

- 생년월일 기반 성향 요약과 대표 전생 결과를 LLM 없이 생성한다.
- 무료 결과는 Soul Profile과 config template만 사용해 생성한다.
- Phase 1의 핵심 성공 조건에서 외부 LLM latency, 비용, 변동성을 제거한다.

주요 파일:

```text
src/lib/content/createNatureSummary.ts
src/lib/content/createFreeResult.ts
src/config/soulEnginePools.ts
src/config/contentTypes.ts
tests/content/
```

구현 방침:

- `NatureSummary`는 compact trait code와 config template으로 결정적으로 만든다.
- 무료 대표 기록은 `SoulProfile`의 고정 설정을 문장으로만 조합한다.
- `natureSummary → mainPastLife` 연결 문구가 결과 첫 부분에 포함된다.
- OpenAI provider interface, prompt, API key 처리는 Phase 2의 별도 단계로 둔다.

검증:

```bash
npm run test
npm run build
```

---

### Step 6. API route 구현

목표:

- 클라이언트가 Soul Engine, DB, LLM을 직접 다루지 않게 서버 API를 만든다.

주요 API:

```text
POST /api/soul/create
GET  /api/soul/result/:profileId
POST /api/analytics
```

요구사항:

- `POST /api/soul/create`는 입력 정규화, Soul ID 생성, profile 생성/조회, 무료 결과 생성/조회까지 처리한다.
- API route에서 nickname 길이, 실제 존재하는 양력 날짜, 선택 출생시간 형식, 7개 답변 ID를 서버에서 검증한다. 클라이언트의 TypeScript 타입 선언만 믿지 않는다.
- 잘못된 입력에는 일관된 `400` 응답을 반환하고, 예외 메시지에 생년월일이나 답변 원문을 포함하지 않는다.
- 같은 입력이 다시 들어오면 저장된 profile/content를 반환한다.
- 응답에는 표시용 Soul ID와 결과 접근용 profileId/resultToken을 구분해서 반환한다.
- `GET /api/soul/result/:profileId`는 user/session/token 소유권을 확인한 뒤 결과를 반환한다.
- analytics event는 session_id, utm 값을 함께 기록한다.
- 잠긴 서랍 클릭은 별도 unlock API를 호출하지 않고 `POST /api/analytics`에 `contentType`과 `profileId`를 기록한다. 실제 unlock API는 Phase 2에서 추가한다.

검증:

```bash
npm run test
npm run build
```

---

### Step 7. 모바일 UI 구현

목표:

- 광고 유입자가 모바일에서 막힘 없이 테스트를 완료하게 한다.

주요 화면:

```text
src/app/page.tsx
src/app/test/page.tsx
src/app/analyzing/page.tsx
src/app/result/[profileId]/page.tsx
```

주요 컴포넌트:

```text
src/components/landing/LandingHero.tsx
src/components/questionnaire/QuestionnaireFlow.tsx
src/components/result/ArchiveProgress.tsx
src/components/result/MainPastLifeCard.tsx
src/components/result/FaintRecordList.tsx
src/components/result/LockedContentList.tsx
src/components/payment/SoulRequiredPanel.tsx
```

UI 기준:

- 대표 전생 1개를 가장 크게 보여준다.
- 희미한 추가 기록 2개는 낮은 대비로 보조 노출한다.
- 잠긴 콘텐츠는 장면형 제목과 2줄 preview를 포함한다.
- 디자인은 `Warm Drawer Archive`를 적용한다. 연한 종이색, 바랜 노란빛, 목재색, 절제된 황동 포인트를 사용한다.
- 과한 보라/금색/우주/무속 클리셰를 피한다.
- `tailwind.config`와 `globals.css`의 기존 어두운 rose/lavender 토큰을 디자인 가이드의 warm drawer 토큰으로 교체한다.
- 결과 순서는 `성향 요약 → 열림률 → 대표 기록 → 희미한 기록 → 잠긴 서랍`으로 고정한다.

검증:

```bash
npm run lint
npm run test
npm run build
npm run dev
```

수동 확인:

- iPhone SE 폭에서 CTA가 접히지 않는지
- iPhone 14/15 폭에서 질문 선택지가 답답하지 않은지
- 결과 첫 화면에서 대표 기록과 잠긴 콘텐츠 진입이 보이는지
- 결과 첫 화면에서 "당신은 ...한 사람입니다" 성향 요약이 대표 기록보다 먼저 보이는지
- 색상과 텍스트가 밝은 배경에서 충분한 대비를 가지는지

---

### Step 8. Analytics와 UTM 연결

목표:

- 광고 테스트를 위해 funnel event를 저장한다.

필수 이벤트:

```text
landing_view
start_test
complete_questionnaire
view_free_result
click_locked_content
view_payment
```

구현 방침:

- 첫 진입 시 `session_id`를 생성해 localStorage 또는 cookie에 저장한다.
- UTM 값을 session과 event에 함께 저장한다.
- 이벤트 실패가 UX를 막지 않게 한다.

검증:

```bash
npm run test
npm run build
```

수동 확인:

- `?utm_source=instagram&utm_medium=paid_social&utm_campaign=reels_a`로 진입 후 이벤트에 값이 남는지 확인한다.

---

### Step 9. Phase 1 QA와 런치 전 점검

목표:

- 광고를 소액으로 붙이기 전, 무료 테스트 경험이 완주 가능한지 확인한다.

필수 체크:

- 같은 입력으로 10번 실행해도 같은 Soul ID
- 같은 입력으로 10번 실행해도 같은 성향 요약, 대표 기록, 잠긴 서랍 목록
- 다른 답변으로 결과 변화 확인
- 무료 결과 재방문 시 결과 재생성 및 외부 API 호출 없음
- 모바일에서 텍스트 겹침 없음
- 결과 페이지의 잠긴 기록 클릭률 측정 가능
- `.env.local` 없이도 test/build가 실패하지 않음
- production mode에서는 필수 env 누락을 명확히 에러 처리
- 잘못된 날짜, 누락된 답변, 알 수 없는 답변 ID를 API가 거부함
- 생년월일과 답변 원문이 analytics event payload에 저장되지 않음

검증:

```bash
npm run lint
npm run test
npm run build
```

---

## 6. Phase 1 완료 산출물

완료 시 사용자에게 보고할 내용:

- 구현한 기능
- 주요 파일 위치
- 실행 방법
- 테스트 결과
- 아직 구현되지 않은 부분
- 발견된 문제
- Phase 2로 넘길 작업

---

## 7. Phase 2 예고

Phase 1 완료 후 다음 순서로 진행한다.

1. 이메일 또는 소셜 로그인
   - 권장 우선순위: 카카오 로그인, 이메일 magic link
   - 무료 테스트는 비로그인 유지, 결제 전 로그인 필수
2. anonymous profile claim
3. Soul balance
4. payment_intents
5. Toss Payments 결제위젯 또는 PortOne
   - 목표 결제수단: 카카오페이, 네이버페이, 신용/체크카드, 휴대폰 소액결제
6. transactions
7. soul ledger
8. unlock API
9. webhook
10. 유료 콘텐츠 생성/캐싱

---

## 8. 구현 전 확인사항

바로 구현을 시작하려면 아래가 필요하다.

1. 브랜드명 최종 확정
   - 임시로 `전생서랍` 사용 가능

2. OpenAI API key
   - Phase 1 필수 아님
   - Phase 2에서 유료 콘텐츠 품질 실험을 시작할 때 서버 환경변수로 추가

3. Supabase 프로젝트 생성 여부
   - 없으면 Phase 1은 repository interface + local mock으로 시작 가능
   - 실제 광고 전에는 Supabase 연결 필요

4. 통신판매업/PG
   - Phase 1에서는 필요 없음
   - Phase 2 이후 필요

5. 첫 광고 소재
   - Phase 1 구현 후 결과 화면 캡처 기반으로 제작 가능

6. 결제수단 계약
   - Phase 2에서 Toss Payments 또는 PortOne 계약/심사 필요
   - 카카오페이, 네이버페이, 휴대폰 결제는 PG 관리자에서 활성화되어야 실제 노출 가능
