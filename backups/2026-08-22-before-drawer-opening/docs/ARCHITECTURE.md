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
→ /result/{profileId}?token={resultToken}
→ GET /api/soul/result/{profileId}
→ 무료 결과와 잠긴 콘텐츠 UI 표시
```

## 핵심 패턴
- Server API boundary: 외부 API, 비밀 키, DB 접근은 API route/server module에 둔다.
- Pure domain engine: `src/lib/soul/`은 가능한 한 순수 함수로 유지한다.
- Repository abstraction: Phase 1은 메모리 저장소, Phase 2는 Supabase 구현으로 교체한다.
- Content provider abstraction: Phase 1은 deterministic local writer, OpenAI 연동은 provider 교체로 붙인다.
- Idempotent creation: `soul_hash + input_version + engine_version` 기준으로 profile을 재사용한다.
- Cost-aware content generation: 생년월일 기반 성향 요약과 전생 핵심 설정은 서버 순수 함수와 config pool에서 만든다. LLM은 긴 원자료 해석이 아니라 짧은 결과 문장 작성에만 제한한다.

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

## 상태 관리
- 테스트 진행 상태는 클라이언트 `useReducer`와 `sessionStorage`를 사용한다.
- 결과와 콘텐츠는 API 응답을 기준으로 표시한다.
- Soul balance, unlock 상태는 클라이언트에서 직접 수정하지 않는다.

## 보안 기준
- `display_soul_id`는 표시용이다.
- 결과 조회에는 긴 `result_token`을 요구한다.
- 서버 저장소에는 token 원문이 아니라 hash를 저장한다.
- 결제와 unlock은 Phase 2에서 로그인 사용자 기준으로만 허용한다.
