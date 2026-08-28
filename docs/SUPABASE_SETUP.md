# Supabase 저장소 설정

## 현재 범위

Supabase가 설정되면 다음 데이터가 서버 재시작과 배포 후에도 유지된다.

- 익명 세션
- deterministic Soul Profile
- result token hash와 익명 세션 기반 결과 접근권한
- 무료 결과와 생성된 장문 콘텐츠 캐시

`analytics_events` 테이블도 migration에 포함되어 있지만 analytics API 연결은 후속 작업이다. 현재 이벤트 수집 구현은 여전히 개발용 메모리 저장소를 사용한다.

## 프로젝트에 적용

1. Supabase 프로젝트를 준비한다.
2. `supabase/migrations/20260828000100_soul_persistence.sql`을 Supabase SQL Editor 또는 프로젝트의 migration 배포 절차로 적용한다.
3. `.env.example`을 참고해 로컬의 `.env.local`과 배포 환경에 아래 두 서버 변수를 함께 설정한다.

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. 개발 서버 또는 배포를 다시 시작한다.

두 변수가 모두 없으면 로컬 개발과 테스트를 위해 메모리 저장소를 사용한다. 하나만 설정되면 데이터가 조용히 메모리로 빠지는 일을 막기 위해 API 초기화가 실패한다.

## 보안

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 비밀이다. `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 브라우저 컴포넌트에서 Supabase REST API나 service role key를 사용하지 않는다.
- URL의 result token 원문은 DB에 저장하지 않는다. SHA-256 hash만 접근권한 행에 저장한다.
- `display_soul_id`는 화면 표시용이며 조회 권한으로 사용하지 않는다.
- 모든 영속 테이블은 RLS를 활성화하고 `anon`, `authenticated` 직접 권한을 제거한다. 현재 접근은 서버 API route의 service role 요청으로만 수행한다.

## 수동 연결 검증

환경 변수를 설정하고 migration을 적용한 뒤 다음을 확인한다.

1. 테스트를 완료해 결과를 생성한다.
2. 서버를 재시작한다.
3. 같은 결과 URL 또는 같은 익명 세션으로 결과가 다시 조회되는지 확인한다.
4. 쿠키와 token이 모두 없는 다른 브라우저에서 같은 `profileId`를 조회했을 때 404가 반환되는지 확인한다.
5. 동일 입력을 반복 제출해 `soul_profiles` 행과 `free_summary` 콘텐츠가 중복되지 않는지 확인한다.
