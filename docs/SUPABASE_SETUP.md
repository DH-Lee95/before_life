# Supabase 저장소 설정

## 현재 범위

Supabase가 설정되면 다음 데이터가 서버 재시작과 배포 후에도 유지된다.

- 익명 세션
- deterministic Soul Profile
- result token hash와 익명 세션 기반 결과 접근권한
- 무료 결과와 생성된 장문 콘텐츠 캐시
- 카카오 로그인 계정에 귀속된 소울 잔액과 유료 콘텐츠 잠금 해제 권한
- 익명 세션·UTM·결과/콘텐츠 속성이 연결된 analytics 이벤트

Analytics API는 Supabase가 설정된 환경에서 `analytics_events`에 영속 저장하고, 설정이 전혀 없는 로컬 테스트 환경에서만 메모리 저장소를 사용한다.

## 프로젝트에 적용

1. Supabase 프로젝트를 준비한다.
2. `supabase/migrations/`의 migration을 파일명 순서대로 Supabase CLI 또는 프로젝트의 migration 배포 절차로 적용한다.
3. `.env.example`을 참고해 로컬의 `.env.local`과 배포 환경에 아래 두 서버 변수를 함께 설정한다.

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. 개발 서버 또는 배포를 다시 시작한다.

`20260830000100_account_soul_unlock_reconciliation.sql`은 이전 unlock migration 이력과 실제 스키마가 어괋난 환경을 멱등적으로 복구한다. 이미 구성이 있는 환경에서도 테이블과 RPC를 안전하게 유지한다.

2026-08-30 기준 `before_life` 프로젝트에 전체 migration이 반영됐고, service role은 `soul_content_unlocks`와 열람 RPC에 접근하며 anon 키의 직접 접근은 401로 거부되는 것을 확인했다. 실계정 2개와 충전 잔액이 필요한 교차 계정·동시 차감 E2E는 별도로 남아 있다.

두 변수가 모두 없으면 로컬 개발과 테스트를 위해 메모리 저장소를 사용한다. 하나만 설정되면 데이터가 조용히 메모리로 빠지는 일을 막기 위해 API 초기화가 실패한다.

## 보안

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 비밀이다. `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 브라우저 컴포넌트에서 Supabase REST API나 service role key를 사용하지 않는다.
- URL의 result token 원문은 DB에 저장하지 않는다. SHA-256 hash만 접근권한 행에 저장한다.
- `display_soul_id`는 화면 표시용이며 조회 권한으로 사용하지 않는다.
- 모든 영속 테이블은 RLS를 활성화하고 `anon`, `authenticated` 직접 권한을 제거한다. 현재 접근은 서버 API route의 service role 요청으로만 수행한다.
- `soul_contents`는 계정 간 재사용하는 생성 캐시일 뿐이다. 유료 열람 권한은 `soul_content_unlocks`의 `(user_id, soul_profile_id, content_type)` 행으로만 판정한다.
- 잠금 해제 RPC는 사용자 단위 transaction advisory lock으로 동시 요청을 직렬화해 중복 차감과 음수 잔액을 방지한다.
- Analytics는 API route의 service role repository로만 저장하며, 클라이언트 payload의 `anonymousSessionId`는 무시하고 서버 cookie를 사용한다.

## 수동 연결 검증

환경 변수를 설정하고 migration을 적용한 뒤 다음을 확인한다.

1. 테스트를 완료해 결과를 생성한다.
2. 서버를 재시작한다.
3. 같은 결과 URL 또는 같은 익명 세션으로 결과가 다시 조회되는지 확인한다.
4. 쿠키와 token이 모두 없는 다른 브라우저에서 같은 `profileId`를 조회했을 때 404가 반환되는지 확인한다.
5. 동일 입력을 반복 제출해 `soul_profiles` 행과 `free_summary` 콘텐츠가 중복되지 않는지 확인한다.
6. 계정 A에서 유료 기록을 연 뒤 새로고침해 본문과 잔액이 복원되는지 확인한다.
7. 동일 입력으로 같은 profile을 조회하는 계정 B와 공유 토큰 방문자에게 계정 A의 유료 본문이 노출되지 않는지 확인한다.
8. 계정 A에서 같은 기록 열기 요청을 동시에 두 번 보내도 소울이 한 번만 차감되는지 확인한다.
