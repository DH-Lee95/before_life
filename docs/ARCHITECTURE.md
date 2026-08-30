# 아키텍처

## 디렉토리 구조
```text
src/
├── app/                 # 페이지와 API 라우트
├── components/          # 재사용 UI 컴포넌트
├── config/              # 질문, 콘텐츠 타입, 가격, 엔진 풀
├── lib/
│   ├── analytics/       # 이벤트 기록
│   ├── content/         # 무료 결과 작성 provider
│   ├── repository/      # 저장소 인터페이스와 구현
│   ├── session/         # 익명 세션과 토큰
│   └── soul/            # deterministic Soul Engine
└── types/               # 도메인 타입
```

## 데이터 흐름
```text
사용자 입력
→ Client Component
→ POST /api/soul/create
→ 입력 정규화
→ soul_hash 생성
→ 생년월일 기반 성향 feature 계산
→ deterministic SoulProfile 생성
→ repository에서 기존 profile/content 조회 또는 생성
→ result_token 발급
→ 토큰은 sessionStorage에 보관하고 /result/{profileId}로 이동
→ GET /api/soul/result/{profileId}
→ 대표 전생과 추천 무료 기록 1개, 잠긴 기록 미리보기 5개, 잠긴 일생 미리보기 표시
```

## 핵심 패턴
- Server API boundary: 외부 API, 비밀 키, DB 접근은 API route/server module에 둔다.
- Pure domain engine: `src/lib/soul/`은 가능한 한 순수 함수로 유지한다.
- Repository abstraction: Supabase 환경 변수가 모두 있으면 PostgREST 기반 영속 저장소를 사용하고, 둘 다 없으면 로컬 개발·테스트용 메모리 저장소를 사용한다. 일부만 설정된 배포는 즉시 실패한다.
- Content provider abstraction: Phase 1은 deterministic local writer, OpenAI 연동은 provider 교체로 붙인다.
- Idempotent creation: `soul_hash + input_version + engine_version` 기준으로 profile을 재사용한다.
- Cost-aware content generation: 생년월일 기반 성향 요약과 전생 핵심 설정은 서버 순수 함수와 config pool에서 만든다. LLM에는 압축된 설정만 전달하고 생성된 장문 스토리는 캐시한다.
- Result access: 일반 이동은 익명 세션 소유권으로 조회한다. 공유 토큰은 URL fragment로 전달해 서버 요청 로그에 남지 않게 하고 API header로 검증한 뒤 주소에서 즉시 제거한다. 기존 query token 링크는 호환을 위해 조회만 지원한다.

## 생년월일 기반 성향 요약 전략
첫 결과는 바로 전생을 제시하지 않고, 다음 구조로 신뢰를 만든다.

```text
birth_date + optional birth_time
→ local deterministic feature extraction
→ compact trait codes
→ prewritten insight templates
→ short nature summary
→ linked main past life recommendation
```

예시 출력:

```json
{
  "nature_summary": {
    "headline": "당신은 겉으로는 담담해도 마음속 기준이 강한 사람입니다.",
    "signals": [
      "중요한 선택을 오래 품고 정리하는 편",
      "관계에서 쉽게 기대기보다 먼저 견디는 편",
      "반복되는 감정을 그냥 넘기지 못하는 편"
    ],
    "past_life_bridge": "이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다."
  }
}
```

구현 원칙:

- 서버 API route에서만 계산한다.
- 클라이언트는 생년월일과 답변을 제출할 뿐, 성향 점수나 전생 설정을 직접 계산하지 않는다.
- 정통 사주 감정처럼 외부 API에 생년월일을 매번 보내지 않는다.
- MVP는 자체 deterministic feature extraction으로 시작한다.
- 외부 만세력 API를 붙이더라도 서버에서 `birth_feature`만 캐싱하고 원문 응답 전체를 LLM에 넣지 않는다.

## LLM 비용 절감 원칙
토큰 비용을 줄이기 위해 LLM 입력은 긴 사용자 정보가 아니라 압축된 구조체로 제한한다.

```text
금지: 생년월일 원문, 질문 전체 문장, 모든 답변 설명, 외부 API 원문 응답을 매번 LLM에 전달
권장: trait code, archetype id, main_past_life id, hidden_nature id, 필요한 template key만 전달
```

우선순위:

1. 성향 요약은 LLM 없이 template 조합으로 생성한다.
2. 무료 대표 기록도 Phase 1에서는 deterministic local writer로 생성한다.
3. OpenAI 연동 시에는 `SoulProfile` 전체가 아니라 compact prompt payload를 만든다.
4. `soul_hash + content_type + prompt_version` 기준으로 content cache를 둔다.
5. 유료 콘텐츠는 unlock 시점에만 생성하거나, 첫 생성 후 재사용한다.
6. 자주 쓰는 archetype 문장은 config에 저장해 LLM 호출을 줄인다.
7. LLM이 필요한 경우에도 출력 길이를 제한하고 JSON schema 또는 짧은 section 단위로 받는다.

## 장문 스토리 품질·비용 전략

```text
구조화된 core theme와 compact profile
→ 안정적인 system prompt + 동적 profile payload
→ strict JSON Schema로 1회 생성
→ 서버의 무료 구조·금칙 표현 검증
→ 통과 시 즉시 캐시
→ 실패한 경우에만 원문과 오류 목록으로 1회 교정
```

- 감정 라벨을 문장에 그대로 삽입하지 않고 `label + 완결된 description`으로 관리한다.
- 한국어 조사가 필요한 deterministic 문장은 서버 순수 함수로 받침을 판별한다.
- 출력 스키마는 프롬프트 본문에 반복하지 않고 API의 Structured Outputs 설정으로 전달한다.
- system prompt와 schema는 안정적으로 유지하고 사용자별 동적 정보는 입력 뒤쪽에 둔다.
- 별도의 LLM 검수 호출을 항상 실행하지 않는다. 로컬 검증에 실패한 결과만 짧은 교정 프롬프트로 한 번 수정한다.
- 캐시 키는 `soul_hash + content_type + prompt_version`을 사용한다.
- OpenAI 호출 코드는 `src/app/api/_lib/` 아래에 두고 Responses API와 Structured Outputs를 사용한다. 기본 모델은 비용 중심의 `gpt-5.6-luna`이며 환경 변수로 교체할 수 있다.
- OpenAI의 `prompt_cache_key` 64자 제한을 지키기 위해 위 캐시 키 조합의 SHA-256 해시를 전달한다.

## 단일 전생 상품 구조

- 한 결과에는 대표 전생 하나만 생성하며 두 번째·세 번째 전생을 섞지 않는다.
- 시대와 지역은 서로 검증된 `pastLifeWorlds` 조합에서 함께 선택한다.
- 깊은 기록은 사랑, 마지막 날, 재산과 신분, 결정적 선택, 미완의 약속, 현생의 흔적 총 6개다.
- 반복 주제 답변에 가장 가까운 기록 1개만 무료 전체 본문으로 제공한다.
- 나머지 5개는 제목, 예상 독서 시간, 개인화 미리보기만 무료 응답에 포함한다. 잠긴 본문은 클라이언트에 전송하지 않는다.
- 각 깊은 기록은 같은 대표 전생에서 파생되는 장면별 외전이며 1소울로 연다.
- `whole_life`는 유년기, 청년기, 중년기, 말년기 4장을 시간순으로 잇는 3,500~5,000자 장편이며 2소울로 연다. 구매 전 응답에는 장 제목과 설명만 포함한다.
- 모든 유료 생성물은 대표 전생의 시대, 지역, 직업, 사회적 위치와 핵심 정서를 정본으로 공유해 서로 모순되지 않게 한다.
- 소울 상품은 1개 990원, 3개 2,490원, 5개 3,990원, 전체 서랍용 7개 4,990원으로 config에서 관리한다.
- 첫 초대 보상은 초대받은 신규 사용자가 무료 결과를 완료했을 때 프로모션 소울 1개를 계정당 한 번 지급한다. 로그인과 부정 사용 방지 전에는 실제 지급하지 않는다.
- 실제 결제와 unlock API는 로그인·PG 연동 단계에서 추가하며, 현재는 상품 구조와 전환 UI만 검증한다.

## 상태 관리
- 테스트 진행 상태는 클라이언트 `useReducer`와 `sessionStorage`를 사용한다.
- 결과와 콘텐츠는 API 응답을 기준으로 표시한다.
- Soul balance, unlock 상태는 클라이언트에서 직접 수정하지 않는다.

## 보안 기준
- `display_soul_id`는 표시용이다.
- 결과 조회에는 긴 `result_token`을 요구한다.
- 서버 저장소에는 token 원문이 아니라 hash를 저장한다.
- 결제와 unlock은 Phase 2에서 로그인 사용자 기준으로만 허용한다.
- 생성된 유료 콘텐츠 본문은 결정적 캐시로 공유하지만, 잠금 해제 권한은 `user_id + soul_profile_id + content_type` 단위의 별도 행으로 저장한다.
- 결과 API는 공유 캐시의 `is_unlocked` 값을 권한으로 사용하지 않고 로그인 계정의 잠금 해제 권한만 반환한다.

## Supabase 영속 저장

- migration은 `supabase/migrations/`에서 관리한다.
- `soul_hash + input_version + engine_version`으로 프로필 생성을 멱등하게 유지한다.
- 프로필 소유권은 프로필 JSON 배열이 아니라 `soul_profile_access`의 독립 행으로 저장한다.
- 콘텐츠 캐시는 `soul_profile_id + content_type + generation_key`로 재사용한다.
- 유료 콘텐츠 권한은 `soul_content_unlocks`에서 계정별로 관리하고 사용자 단위 DB 잠금으로 동시 차감을 직렬화한다.
- Supabase URL과 service role key는 repository provider가 서버 환경에서만 읽는다.
- 실제 프로젝트 설정과 연결 검증 절차는 `docs/SUPABASE_SETUP.md`를 따른다.
