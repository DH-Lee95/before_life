# 운영 리스크 방어 설계: 로그인, 결제, 새로고침, 뒤로가기

작성일: 2026-08-18  
목표: 실제 운영 중 돈, 콘텐츠, 사용자 소유권, 결과 재조회에서 생길 수 있는 치명적 오류를 사전에 막는다.

---

## 1. 로그인 정책

### 결론

```text
무료 테스트: 로그인 없이 가능
무료 결과 조회: 같은 브라우저 세션에서는 로그인 없이 가능
결제 시도: 로그인 필수
Soul balance 보유: 로그인 필수
유료 콘텐츠 unlock: 로그인 필수
구매 내역/결과 보존: 로그인 필수
```

처음부터 로그인을 강제하지 않는 이유:

- Instagram 광고 유입 사용자는 호기심이 약하면 로그인 화면에서 이탈한다.
- 무료 결과를 먼저 보여줘야 "이걸 더 보고 싶다"는 결제 동기가 생긴다.

결제 전 로그인을 필수로 하는 이유:

- Soul balance를 특정 사용자에게 안전하게 귀속해야 한다.
- 결제 후 뒤로가기/새로고침/재방문 시 같은 계정에 결과와 구매 내역을 복구해야 한다.
- 비회원 결제는 환불/문의/콘텐츠 복구/중복 지급 대응이 어렵다.

권장 MVP UX:

```text
무료 결과 확인
→ 잠긴 기록 클릭
→ "이 기록은 로그인 후 열 수 있어요"
→ 카카오 또는 이메일 로그인
→ 기존 전생서랍을 계정에 연결
→ Soul Pack 결제
```

로그인 수단 우선순위:

1. 카카오 로그인
   - 국내 20~30대 모바일 사용자가 익숙하다.
   - 결제 전 이탈을 줄일 가능성이 높다.

2. 이메일 magic link 또는 OTP
   - 소셜 로그인을 싫어하는 사용자 대비
   - 비밀번호 방식보다 구현/운영 부담이 낮다.

3. Google 로그인
   - 국내 모바일 소비자 결제 흐름에서는 카카오보다 우선순위가 낮다.

Phase 1에서는 인증 UI를 만들지 않고, Phase 2에서 카카오 또는 이메일 중 하나를 먼저 붙인다. 단, Phase 1 DB 구조는 anonymous session을 user와 연결할 수 있게 설계한다.

---

## 2. 익명 세션과 계정 연결

### 원칙

무료 결과는 로그인 없이 만들 수 있지만, 결과 소유권은 임시 session에 묶는다.

```text
anonymous_session_id
→ soul_profile
→ free_result_content
```

사용자가 로그인하면 다음처럼 연결한다.

```text
anonymous_session_id
→ user_id 연결
→ soul_profile.user_id 업데이트
→ 이후 결제/ unlock 가능
```

### 보안 설계

- 화면에 보여주는 `Soul ID #A82F19`는 식별용 표시값일 뿐, 조회 권한 토큰으로 쓰지 않는다.
- 결과 페이지 URL에는 짧은 Soul ID만 쓰지 않는다.
- 결과 조회에는 `result_token` 또는 세션 소유권 확인이 필요하다.
- `result_token`은 충분히 긴 random opaque token으로 만든다.
- `result_token`은 DB에 hash로 저장하고 원문은 클라이언트 세션 저장소에 보관한다.

권장 URL:

```text
/result/{profileId}#token={resultToken}
```

수신 클라이언트는 fragment의 토큰을 API request header로 전달하고, 인증 성공 후 주소에서 fragment를 제거한다. 자신의 결과는 익명 세션 cookie로 다음 주소에 접근한다.

```text
/result/{profileId}
```

금지:

```text
/result/A82F19
```

짧은 Soul ID만으로 결과를 조회하게 만들면 추측 조회와 개인정보 노출 위험이 있다.

---

## 3. 새로고침/뒤로가기/중복 클릭 방어

### 3-1. 테스트 완료 후 결과 생성 중 새로고침

문제:

- 사용자가 분석 중 화면에서 새로고침하면 같은 결과가 2번 생성될 수 있다.
- LLM이 중복 호출되어 비용이 늘 수 있다.

설계:

- `POST /api/soul/create`는 idempotent하게 만든다.
- normalized input으로 `soul_hash`를 먼저 계산한다.
- `soul_hash + input_version + engine_version` unique constraint를 둔다.
- 이미 profile이 있으면 새로 만들지 않고 기존 profile을 반환한다.
- free result content도 `soul_profile_id + content_type` unique constraint를 둔다.
- 이미 content가 있으면 LLM을 호출하지 않는다.

테스트:

```text
동일 입력으로 /api/soul/create 10회 호출
→ profile row 1개
→ free_result row 1개
→ LLM call 1회 이하
```

### 3-2. 결과 페이지 새로고침

문제:

- 새로고침 때 결과가 사라지거나 다시 생성되면 신뢰가 깨진다.

설계:

- 결과 페이지는 서버에서 profile/content를 조회한다.
- 없으면 생성하지 말고 "결과를 찾을 수 없음" 또는 "다시 분석하기"로 보낸다.
- 조회 권한은 user_id, anonymous_session_id, result_token 중 하나로 확인한다.

### 3-3. 뒤로가기로 질문 수정 후 재제출

문제:

- 사용자가 뒤로가기로 답변을 바꾼 뒤 제출하면 다른 결과가 나와야 한다.
- 이전 결과와 새 결과가 섞이면 안 된다.

설계:

- 답변이 바뀌면 normalized input과 soul_hash가 달라진다.
- 새 profile을 생성한다.
- 같은 session에 여러 soul_profile이 생길 수 있다.
- UI에서는 "최근 분석 결과"를 명확히 보여준다.

### 3-4. 잠긴 콘텐츠 버튼 중복 클릭

문제:

- 사용자가 버튼을 빠르게 여러 번 누르면 analytics가 중복 기록되거나 unlock 요청이 중복될 수 있다.

설계:

- 클릭 이벤트는 중복 저장을 허용하되, unlock/차감은 idempotent해야 한다.
- unlock은 `user_id + soul_profile_id + content_type` unique constraint를 둔다.
- 이미 unlock된 콘텐츠를 다시 누르면 Soul을 차감하지 않고 기존 content를 반환한다.

---

## 4. 결제 설계

### 결제수단 목표

사용자가 요청한 결제수단:

- 카카오페이
- 네이버페이
- 신용카드/체크카드
- 휴대폰 소액결제

권장 PG:

```text
1순위: Toss Payments 결제위젯
대안: PortOne
```

Toss Payments를 우선 추천하는 이유:

- 결제위젯으로 카드, 간편결제, 휴대폰 등 주요 결제수단을 한 번의 UX로 제공할 수 있다.
- 공식 문서 기준 결제수단 enum에 카드, 휴대폰, 계좌이체, 가상계좌 등이 있고, 간편결제 타입에는 네이버페이, 카카오페이 등이 포함된다.
- 결제위젯 FAQ 기준 계약 전 테스트에서도 카드, 네이버페이, 카카오페이, 토스페이, 페이코, 퀵계좌이체, 휴대폰 등을 테스트할 수 있다. 단, 실제 운영 노출은 계약/상점아이디/심사 상태에 따라 달라진다.

PortOne을 대안으로 보는 이유:

- 여러 PG를 묶거나 PG 변경 가능성을 열어두기 쉽다.
- KCP 등 PG별로 카드, 계좌이체, 가상계좌, 휴대폰 소액결제, 간편결제를 연결할 수 있다.

중요:

- "카카오페이/네이버페이/휴대폰 결제를 코드에서 켜면 바로 운영 가능"이 아니다.
- PG 계약, 상점아이디, 결제수단별 심사/활성화가 필요할 수 있다.
- 결제수단은 코드 config와 PG 관리자 설정이 함께 맞아야 한다.

---

## 5. 결제 상태 모델

### payment_intents

결제 버튼을 누르는 순간 만든다.

```sql
id uuid primary key
user_id uuid not null
order_id text unique not null
pack_id text not null
amount_krw integer not null
souls integer not null
status text not null -- pending, approved, failed, canceled, expired
provider text not null -- toss, portone, mock
provider_payment_key text unique null
created_at timestamptz not null default now()
approved_at timestamptz null
failed_at timestamptz null
expires_at timestamptz not null
```

### transactions

실제 승인 완료 후 만든다.

```sql
id uuid primary key
user_id uuid not null
payment_intent_id uuid not null unique
provider text not null
provider_payment_key text unique not null
order_id text unique not null
amount_krw integer not null
souls integer not null
payment_status text not null
raw_payload jsonb
created_at timestamptz not null default now()
```

### soul_ledger

Soul 지급/차감은 반드시 ledger로 남긴다.

```sql
id uuid primary key
user_id uuid not null
change_amount integer not null
reason text not null -- purchase, unlock, refund, admin_adjustment
reference_type text not null
reference_id uuid not null
created_at timestamptz not null default now()
unique(user_id, reason, reference_type, reference_id)
```

핵심:

- `users.soul_balance`는 캐시값이다.
- 진실의 원천은 `soul_ledger`다.
- 중복 지급 방지는 `unique(user_id, reason, reference_type, reference_id)`로 막는다.

---

## 6. 결제 플로우

### 정상 결제

```text
잠긴 기록 클릭
→ 로그인 확인
→ Soul 부족 확인
→ pack 선택
→ 서버에서 payment_intent 생성
→ PG 결제창 호출
→ PG success redirect
→ 서버에서 paymentKey/orderId/amount 검증
→ PG 승인 API confirm
→ transaction 생성
→ soul_ledger +N
→ users.soul_balance 갱신
→ 원래 열려던 콘텐츠 unlock
→ 결과 페이지로 복귀
```

### 절대 클라이언트를 믿지 않을 값

- amount
- souls
- pack price
- user_id
- unlock target
- payment status
- provider_payment_key 승인 여부

클라이언트는 `pack_id`, `content_type`, `soul_profile_id` 정도만 요청할 수 있다. 서버는 이 값들이 해당 user에게 허용되는지 다시 확인한다.

---

## 7. 결제 후 뒤로가기/새로고침 방어

### 7-1. 결제 성공 페이지 새로고침

문제:

- 사용자가 success URL에서 새로고침하면 승인 API가 다시 호출될 수 있다.
- Soul이 중복 지급될 수 있다.

설계:

- `order_id`는 unique다.
- `payment_intents.status = approved`이면 confirm API를 다시 호출하지 않는다.
- 이미 transaction이 있으면 기존 transaction을 반환한다.
- soul_ledger unique constraint로 중복 지급을 막는다.

결과:

```text
새로고침 10번
→ transaction 1개
→ ledger purchase 1개
→ balance 1회 증가
```

### 7-2. 결제 완료 후 브라우저 뒤로가기

문제:

- 사용자가 결제창/결제 준비 화면으로 돌아가 다시 결제 버튼을 누를 수 있다.

설계:

- payment page 진입 시 서버에서 기존 pending/approved intent를 확인한다.
- 이미 approved면 "이미 결제가 완료되었어요"를 보여주고 결과 페이지로 보낸다.
- pending intent는 일정 시간 후 expired 처리한다.
- 같은 content unlock 목적의 결제가 이미 처리됐으면 새 intent를 만들지 않는다.

### 7-3. 결제는 성공했지만 success redirect 실패

문제:

- 사용자는 돈을 냈는데 사이트로 돌아오지 못할 수 있다.

설계:

- webhook을 반드시 구현한다.
- webhook에서도 confirm/transaction/ledger 처리를 idempotent하게 수행한다.
- 사용자가 나중에 결과 페이지로 돌아오면 서버가 payment 상태를 동기화한다.

### 7-4. success URL 파라미터 조작

문제:

- 사용자가 `amount`, `orderId`, `paymentKey` 등을 조작할 수 있다.

설계:

- success query는 신뢰하지 않는다.
- 서버 DB의 payment_intent와 PG 조회/승인 API 응답을 비교한다.
- `order_id`, `amount_krw`, `user_id`, `pack_id`가 모두 일치해야 승인 처리한다.

### 7-5. 결제 실패/취소

설계:

- 실패/취소는 payment_intent status만 `failed` 또는 `canceled`로 바꾼다.
- Soul 지급 없음.
- unlock 없음.
- 사용자에게 같은 pack으로 다시 시도 버튼을 제공한다.

---

## 8. Unlock 방어

### 정상 unlock

```text
사용자 로그인 확인
→ soul_profile 소유권 확인
→ content_type 유효성 확인
→ 이미 unlock 여부 확인
→ balance >= 1 확인
→ transaction 시작
→ soul_ledger -1
→ soul_contents.is_unlocked = true
→ content 없으면 LLM 생성 후 저장
→ transaction commit
```

### 중복 unlock

- 이미 unlock이면 Soul 차감하지 않는다.
- 기존 content를 반환한다.
- 버튼을 여러 번 눌러도 ledger는 1번만 차감된다.

### 잔액 부족

- unlock API에서 서버가 다시 balance를 계산한다.
- 클라이언트의 balance 표시값은 참고용이다.
- 부족하면 payment page로 보낸다.

### 환불

MVP 정책:

- Soul을 사용하지 않은 구매는 환불 가능.
- 이미 unlock에 사용한 Soul은 원칙적으로 환불 불가 또는 운영자 판단.

기술 설계:

- refund transaction을 별도 기록한다.
- soul_ledger에 `refund` 또는 `purchase_reversal`을 남긴다.
- balance가 음수가 되지 않게 한다.

---

## 9. LLM 비용/일관성 방어

### 위험

- 새로고침, 뒤로가기, 재시도 때문에 LLM 호출이 반복될 수 있다.
- 유료 콘텐츠가 이전 무료 결과와 모순될 수 있다.

설계:

- 모든 content는 `soul_profile_id + content_type + prompt_version`으로 캐시한다.
- 무료 결과는 `free_summary` content_type으로 저장한다.
- 유료 결과는 unlock 이후 1회만 생성한다.
- 생성 중 상태 `generating`을 둬 동시에 두 요청이 들어와도 한쪽만 생성한다.
- LLM provider timeout 시 content status를 `failed`로 두고 재시도 가능하게 한다.
- 재시도해도 이미 성공한 content는 덮어쓰지 않는다.

---

## 10. 운영자 모니터링

최소 운영 지표:

- pending payment가 30분 이상 유지되는 수
- approved transaction은 있는데 ledger가 없는 건
- ledger는 있는데 transaction이 없는 건
- balance가 음수인 user
- 같은 user/content_type에 unlock ledger가 2개 이상인 건
- LLM failed content 수
- webhook 실패 수
- 결제 성공 후 결과 페이지 미도달 수

운영자 점검 쿼리 또는 admin page에서 반드시 확인 가능해야 한다.

---

## 11. 테스트 케이스

### 계정/세션

- 비로그인 사용자가 무료 결과까지 도달한다.
- 비로그인 사용자가 잠긴 기록 클릭 시 로그인으로 이동한다.
- 로그인 후 anonymous soul_profile이 user_id에 연결된다.
- 다른 계정으로 같은 result_token을 열 수 없다.

### 결과 생성

- 같은 입력을 10번 제출해도 profile/content가 1개만 생긴다.
- 결과 페이지 새로고침으로 LLM이 재호출되지 않는다.
- 뒤로가기로 답변을 바꾸면 새 Soul ID가 생성된다.

### 결제

- success URL 새로고침 10번에도 Soul 지급은 1번이다.
- 결제 완료 후 뒤로가기로 결제 버튼을 다시 눌러도 중복 결제 intent를 만들지 않는다.
- 결제 실패는 Soul을 지급하지 않는다.
- webhook과 success callback이 둘 다 와도 transaction/ledger는 1개다.
- amount를 조작하면 승인 처리되지 않는다.

### Unlock

- 같은 콘텐츠 unlock 버튼을 여러 번 눌러도 Soul 차감은 1번이다.
- 이미 unlock된 콘텐츠는 재진입 시 바로 보여준다.
- 잔액 부족 상태에서는 unlock되지 않는다.

---

## 12. 구현 우선순위 반영

Phase 1:

- anonymous session
- result_token
- idempotent soul create
- free result cache
- locked click analytics
- payment page shell

Phase 2:

- login
- anonymous profile claim
- payment_intents
- Toss Payments 결제위젯
- transactions
- soul_ledger
- unlock
- webhook

Phase 3:

- refund tooling
- admin anomaly dashboard
- PG method별 전환율 분석
