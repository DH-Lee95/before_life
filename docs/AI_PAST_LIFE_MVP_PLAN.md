# AI 전생 분석 서비스 MVP 현실 기획서

작성일: 2026-08-18  
목표: 코드 구현 전, 제품/콘텐츠/데이터/마케팅 실행 기준을 하나의 문서로 고정한다.

---

## 1. 제품 정의

이 서비스는 사용자의 생년월일과 7개의 직관형 질문을 바탕으로, AI가 "전생을 마음대로 지어내는" 서비스가 아니다.

핵심 구조는 다음과 같다. 단, 이 구조는 내부 엔진 설계용이며 사용자-facing 카피에는 "사주 기반"이라고 말하지 않는다.

```text
생년월일
→ 생년월일 기반 성향 feature 계산
→ 7개 질문으로 숨겨진 본성 feature 보정
→ deterministic Soul Engine
→ 고정 Soul Profile 생성
→ LLM은 해당 프로필을 스토리로만 표현
```

서비스 포지셔닝:

- AI 기반 전생 스토리텔링 엔터테인먼트
- 내부적으로 생년월일 기반 성향 계산을 사용하지만, 외부 표현에서는 사주/명리 서비스를 표방하지 않는다.
- 무속, 부적, 점집 느낌보다 "모바일 감성 콘텐츠 + 프리미엄 심리 테스트" 느낌으로 만든다.
- 확장은 당장 고려하지 않는다. MVP는 전생 분석과 잠긴 콘텐츠 결제 흐름에 집중한다.

### 최신 컨셉 확정: 전생 서랍

화면 제목은 `전생 서랍`으로 띄어 쓴다. 기존 문서와 코드의 도메인명은 `전생서랍`을 유지할 수 있지만, 사용자가 처음 보는 브랜드 표기는 더 부드럽게 읽히는 `전생 서랍`을 우선한다.

핵심 은유:

```text
사람 안에는 오래된 기록이 여러 개의 서랍처럼 남아 있다.
무료 분석은 첫 번째 서랍을 살짝 열어 대표 기록을 보여준다.
더 깊은 사랑, 마지막 날, 반복 감정, 다른 전생은 잠긴 서랍으로 남긴다.
```

디자인 톤:

- 예전 연한 갈색 종이
- 바랜 노란빛
- 오래된 목재 서랍
- 고즈넉하지만 모바일에서 세련된 분위기
- 황동색 포인트는 작게만 사용
- 무속, 부적, 과한 금박, 어두운 오컬트 분위기는 피함

결과 흐름:

```text
생년월일 기반 성향 요약
→ "당신은 ~~한 결을 가진 사람입니다"
→ 이 성향과 가장 강하게 이어진 대표 전생 추천
→ 첫 번째 서랍 공개
→ 잠긴 서랍 클릭으로 로그인/결제 흐름 진입
```

신뢰 장치:

- 첫 화면과 결과에서 "사주"를 전면에 걸기보다 "생년월일 기반 성향"으로 표현한다.
- 결과 첫 문장은 "당신은 ~~한 사람입니다" 형태로 짧게 신뢰를 준다.
- 단, "반드시", "운명", "정통 사주 감정"처럼 법적/광고 리스크가 있는 단정은 피한다.
- 사용자가 체감하는 순서는 `나를 맞히는 느낌 → 전생 추천 → 더 열어보고 싶은 기록`이어야 한다.

---

## 1-1. 서비스명 후보

이름 방향:

- "사주"를 직접 넣지 않는다.
- "Soul" 단독은 기존 앱/서비스와 충돌 가능성이 크므로 피한다.
- 너무 철학적이거나 종교적으로 들리는 단어보다, 모바일 콘텐츠 브랜드처럼 가볍고 세련되게 간다.
- 전생을 직접 떠올릴 수 있되, 무겁지 않은 단어를 쓴다.

### 1순위 추천

#### 전생 서랍

이유:

- "전생"이 바로 이해된다.
- "서랍"은 하나씩 열어보는 Soul Archive 구조와 잘 맞는다.
- 철학적이지 않고, 앱/콘텐츠 브랜드처럼 가볍다.
- 잠긴 콘텐츠 UX와도 자연스럽다.
- 띄어 쓴 `전생 서랍`은 화면 제목으로 더 부드럽고 고즈넉하게 보인다.
- 코드, 파일명, 내부 식별자는 붙여 쓴 `전생서랍`을 사용해도 된다.

랜딩 카피 예시:

```text
전생 서랍
당신 안에 남아 있는 오래된 기록을 열어보세요.
```

#### 어제의나

이유:

- 전생을 직접적으로 말하지 않아 세련된 느낌이 있다.
- "나" 중심이라 심리 테스트/자기이해 콘텐츠와 잘 맞는다.
- 다만 전생 서비스라는 인지가 약할 수 있어 보조 카피가 필요하다.

랜딩 카피 예시:

```text
어제의나
이번 생에 남아 있는 전생의 흔적
```

#### 생의서랍

이유:

- "전생서랍"보다 조금 더 브랜드명스럽다.
- 여러 전생을 하나씩 여는 구조와 맞는다.
- 단점은 처음 봤을 때 전생 서비스인지 조금 덜 명확하다.

### 2순위 후보

- 전생로그
- 오래된나
- 나의전생서
- 소울서랍
- 기억서랍
- 생의기록
- 전생아카이브
- 지난생
- 나의이전생
- Soul Drawer

### 비추천 방향

- 사주아이류: 사주 서비스로 오해된다.
- 소울 단독: 기존 앱/서비스명과 겹치기 쉽고 검색 구분이 어렵다.
- 카르마/운명/윤회 중심 이름: 철학적이고 무거워질 수 있다.
- 너무 영어 중심 이름: 국내 인스타 유입에서 즉시 이해가 떨어질 수 있다.

현재 추천 결론:

```text
브랜드 표시명 1순위: 전생 서랍
내부 도메인명: 전생서랍
보조 카피: 당신 안에 남아 있는 오래된 기록을 열어보세요.
```

---

## 2. MVP 핵심 목표

반드시 달성해야 하는 것:

1. 사용자가 로그인 없이 무료 전생 분석을 시작한다.
2. 동일 입력은 항상 동일한 Soul ID와 Soul Profile을 만든다.
3. AI는 핵심 전생 설정을 결정하지 않는다.
4. 무료 결과만으로도 충분히 개인화되어 보인다.
5. "숨겨진 본성"과 "전생"이 자연스럽게 연결된다.
6. 잠긴 콘텐츠를 눌렀을 때 결제가 자연스럽게 이어진다.
7. 모바일에서 광고 유입 즉시 이해되고 진행된다.
8. 운영자가 광고별 전환을 확인할 수 있게 이벤트를 남긴다.

MVP에서 하지 않을 것:

- 커플 전생 인연
- 친구 추천 보상
- 이미지 공유 카드 자동 생성
- 관리자 대시보드 고도화
- 여러 점술 카테고리 확장
- 실제 PG 완전 연동부터 시작
- 사진, 얼굴, 손금 입력

---

## 3. 사용자 입력 정책

### 필수 입력

- 이름 또는 닉네임
- 생년월일
- 7개 질문 답변

### 선택 입력

- 출생 시간

입력하지 않는 것:

- 음력 여부

현실 판단:

- 진짜 사주팔자를 엄밀하게 하려면 출생 시간과 양력/음력 보정이 필요하다.
- 하지만 MVP에서 출생 시간까지 필수로 받으면 이탈률이 높아진다.
- 따라서 MVP는 "생년월일 기반 내부 성향 feature"로 시작한다.
- 화면 문구는 "생년월일과 직관 답변을 조합해 분석합니다" 정도로 표현한다.
- 출생 시간은 "선택 입력 / 모르면 비워두기"로 둔다.
- 양력으로 통일한다. 음력 변환은 MVP에서 지원하지 않는다.

권장 MVP 입력:

```text
닉네임: 필수
생년월일: 필수, YYYY-MM-DD
출생 시간: 선택, 모름 허용
달력 기준: 양력 고정
7개 질문: 필수
```

---

## 4. 수정된 7개 질문

기존 질문의 문제:

- "끌리는 장소가 바다" → "바다 근처 전생"으로 너무 쉽게 유도된다.
- 사용자가 결과 생성 방식을 눈치채면 개인화 신뢰가 떨어진다.
- 장소, 시대, 직업, 사랑, 돈, 권력처럼 전생 결과와 1:1로 이어지는 선택지를 피해야 한다.

새 질문 설계 원칙:

- 질문은 전생 배경을 직접 고르지 않게 만든다.
- 선택지는 모두 심리적 반응, 무의식적 습관, 관계 패턴 중심으로 둔다.
- 답변은 hidden traits 점수에만 반영한다.
- 결과의 시대/지역/직업은 Soul ID와 trait 조합으로 결정한다.

### Q1. 중요한 선택을 앞두면 가장 먼저 올라오는 감각은?

- A. 이유는 모르지만 이미 답을 알고 있는 느낌
- B. 틀리면 안 된다는 긴장감
- C. 빨리 움직이고 싶은 충동
- D. 오래 생각해야 마음이 놓이는 편
- E. 남들이 모르게 다른 선택지를 찾는 편

반영 feature:

- intuition
- caution
- impulse
- analysis
- independence

### Q2. 가까운 사람이 나를 오해했을 때 더 힘든 쪽은?

- A. 내 진심이 전달되지 않은 것
- B. 내가 약해 보였다는 것
- C. 관계가 어색해지는 것
- D. 굳이 설명해야 하는 상황 자체
- E. 시간이 지나도 마음에 남는 것

반영 feature:

- emotional_depth
- pride
- attachment
- solitude
- memory_weight

### Q3. 반복해서 하게 되는 생각에 가까운 것은?

- A. 나는 왜 같은 상황을 반복할까
- B. 결국 내가 책임져야 한다
- C. 언젠가 완전히 다른 삶을 살고 싶다
- D. 아무도 모르는 내 모습이 있다
- E. 내가 놓친 기회가 있었던 것 같다

반영 feature:

- karma_loop
- duty
- escape_desire
- hidden_self
- regret

### Q4. 마음이 무너질 때 나오는 방어 방식은?

- A. 아무렇지 않은 척한다
- B. 더 바쁘게 움직인다
- C. 혼자 사라지고 싶어진다
- D. 상대를 시험하게 된다
- E. 감정보다 현실적인 해결부터 찾는다

반영 feature:

- mask
- survival_drive
- withdrawal
- relational_test
- practicality

### Q5. 이상하게 마음이 약해지는 순간은?

- A. 누군가 나를 끝까지 믿어줄 때
- B. 오래 참은 사람이 무너지는 걸 볼 때
- C. 나와 닮은 외로움을 가진 사람을 볼 때
- D. 다시는 돌아갈 수 없는 순간을 느낄 때
- E. 말하지 않아도 알아주는 사람이 있을 때

반영 feature:

- loyalty_need
- compassion
- mirrored_loneliness
- loss_sensitivity
- silent_bond

### Q6. 나도 모르게 집착하게 되는 것은?

- A. 인정받는 것
- B. 안전한 관계
- C. 자유롭게 떠날 수 있는 상태
- D. 내가 통제할 수 있는 질서
- E. 감정적으로 강하게 연결되는 경험

반영 feature:

- recognition
- security
- freedom
- control
- intensity

### Q7. 처음 본 사람이나 장소가 낯설지 않게 느껴진 적이 있다면?

- A. 자주 있다
- B. 몇 번 있다
- C. 아주 드물게 있다
- D. 거의 없다
- E. 사람보다 특정 분위기에서 더 자주 느낀다

반영 feature:

- deja_vu_frequency
- soul_connection_sensitivity
- atmosphere_memory

---

## 5. 생년월일 기반 내부 성향 계산 방향

MVP에서는 사용자의 생년월일로 다음 값을 계산한다.

주의:

- 이는 정통 명리 감정이 아니라 서비스용 deterministic feature extraction이다.
- 광고와 랜딩의 전면 카피에서는 "사주 기반", "명리 기반"을 메인으로 쓰지 않는다.
- 결과 화면에서는 신뢰 장치로 "생년월일 기반 성향" 또는 "생년월일의 흐름과 답변 패턴" 정도를 쓴다.
- "사주"라는 단어를 쓰더라도 FAQ나 보조 설명에서만 제한적으로 사용하고, 정통 감정이나 운명 단정처럼 보이지 않게 한다.
- 결과 문구는 "생년월일과 답변 패턴을 조합하면"으로 시작해 짧은 성향 요약을 먼저 보여준다.

### 입력값

```text
birth_date: YYYY-MM-DD
timezone: Asia/Seoul 고정
birth_time: optional
calendar_type: solar 고정
```

### 계산 feature

1. day_energy
   - 생일의 일간/일지 또는 대체 deterministic 값
   - 숨겨진 본성의 중심축

2. seasonal_tone
   - 출생 월 기반
   - 외부 성향보다 내면 리듬을 표현

3. element_balance
   - wood, fire, earth, metal, water 점수
   - 단, UI에는 오행 이름을 과하게 노출하지 않는다.

4. hidden_drive
   - 반복 욕망, 결핍, 회피, 집착 경향

5. relationship_shadow
   - 친밀감에서 드러나는 방어/갈망

6. karma_pattern
   - 전생 콘텐츠와 연결되는 반복 패턴

### 숨겨진 본성 예시

```json
{
  "hidden_nature": {
    "core_wound": "인정받지 못한 진심",
    "shadow_desire": "누구에게도 기대지 않고 선택권을 갖는 것",
    "relationship_pattern": "가까워질수록 시험하거나 물러나는 경향",
    "survival_strategy": "감정을 숨기고 책임을 먼저 짊어지는 방식",
    "unresolved_theme": "떠나야 했던 사람에 대한 미련"
  }
}
```

### 성향 요약 출력 예시

무료 결과의 첫 블록은 다음처럼 짧게 쓴다.

```text
당신은 겉으로는 담담해 보여도, 마음속 기준이 쉽게 흔들리지 않는 사람입니다.
관계에서는 먼저 기대기보다 혼자 정리하려는 쪽에 가깝고,
중요한 감정일수록 오래 품은 뒤에야 말하는 경향이 있어요.

이 결이 가장 강하게 이어진 기록은 첫 번째 서랍에 남아 있습니다.
```

원칙:

- 3~4줄 이내
- "당신은"으로 시작해 개인화 느낌을 준다.
- 과도하게 심리상담처럼 길어지지 않는다.
- 전생 스토리를 시작하기 위한 근거로만 사용한다.
- 생년월일 API 원문이나 사주표 전체를 LLM에 넣어 요약하지 않는다.

---

## 6. Soul Engine 설계

### 원칙

Soul Engine은 LLM보다 먼저 실행된다. LLM은 Soul Engine의 결과를 바꾸지 못한다.

```text
normalized_input
→ sha256
→ soul_hash
→ deterministic random seed
→ trait scores
→ archetype
→ main_past_life
→ hidden_nature
→ paid_content_keys
```

### 정규화

```text
nickname: trim → lowercase → unicode NFKC
birth_date: YYYY-MM-DD
birth_time: HH:mm 또는 unknown
calendar_type: solar
answers: q1:a|q2:e|...
```

예:

```text
donghyun|1995-03-04|unknown|solar|q1:a|q2:c|q3:d|q4:a|q5:e|q6:c|q7:b
```

Soul ID:

```text
sha256(normalized_input)
display_soul_id = first 6 uppercase hex
```

### 결정 방식

고정 seed를 사용한다.

```text
seed = first 16 chars of sha256 normalized input
```

이 seed로 다음 후보군에서 값을 선택한다.

- period pool
- region pool
- occupation pool
- social class pool
- emotional wound pool
- death cause pool
- love pattern pool
- karma pattern pool

단순 랜덤이 아니라 trait 조건을 적용한다.

예:

```text
freedom > 75 and survival_drive > 60
→ occupation pool에서 traveler, merchant, messenger, performer 가중치 증가

control > 70 and duty > 60
→ occupation pool에서 administrator, physician, scholar, house steward 가중치 증가
```

---

## 7. Soul Profile 데이터 구조

```json
{
  "soul_id": "A82F19",
  "soul_hash": "full_sha256_hash",
  "input_version": "2026-08-18-v1",
  "engine_version": "soul-engine-v1",
  "birth_profile": {
    "birth_date": "1995-03-04",
    "birth_time": null,
    "calendar_type": "solar",
    "seasonal_tone": "late_winter_to_spring",
    "element_balance": {
      "wood": 64,
      "fire": 42,
      "earth": 51,
      "metal": 37,
      "water": 72
    }
  },
  "traits": {
    "intuition": 78,
    "caution": 42,
    "independence": 81,
    "emotional_depth": 74,
    "attachment": 66,
    "hidden_self": 83,
    "survival_drive": 69,
    "control": 46,
    "freedom": 88,
    "karma_loop": 71
  },
  "hidden_nature": {
    "core_wound": "말하지 못한 진심",
    "shadow_desire": "어디에도 묶이지 않는 선택권",
    "survival_strategy": "감정을 감추고 먼저 떠나는 방식",
    "relationship_pattern": "깊어질수록 마음을 시험하는 경향",
    "unresolved_theme": "떠남과 미련"
  },
  "main_past_life": {
    "period": "18세기 후반",
    "country": "프랑스",
    "region": "남부 항구 도시",
    "environment": "무역과 이별이 잦은 항구",
    "occupation": "중개 상인",
    "social_class": "중상류층",
    "public_persona": "침착하고 계산적인 사람",
    "hidden_self": "누구보다 떠나고 싶어 했지만 한 사람에게 마음이 묶여 있던 사람"
  }
}
```

---

## 8. 콘텐츠 생성 정책

### 무료 콘텐츠

무료 결과는 "대표 전생 기록 1개에 집중하고, 추가 기록 2개는 희미한 티저로만 보여주는 상태"로 설계한다.

이 방식이 좋은 이유:

- 전생 하나를 길게 공개하면 사용자가 결제 없이 만족할 수 있다.
- 전생 3개를 동등하게 보여주면 사용자의 감정 초점이 흩어진다.
- 대표 기록 1개를 중심으로 잡으면 "내 얘기 같다"는 몰입이 생긴다.
- 추가 기록 2개를 희미하게 보여주면 전생서랍 구조와 추가 결제 가능성은 유지된다.

무료 공개 범위:

- Soul ID
- 전생서랍 열림 정도 18%
- 대표 전생 기록 1개
- 대표 기록의 대략적 시대
- 대표 기록의 대략적 위치
- 대표 기록의 직업 또는 역할
- 대표 기록의 짧은 성향 연결 문장
- 희미한 추가 기록 2개 존재 표시
- 추가 기록은 시대/지역/직업 중 1~2개만 흐리게 공개

무료에서 숨길 것:

- 정확한 사랑 이야기
- 죽음의 이유
- 구체적 재산/신분
- 가장 큰 업보
- 현생 반복 패턴의 구체적 해석
- 각 전생의 구체적 사건
- 전생 간 연결성

무료 결과 예시:

```text
전생서랍 #A82F19
18% 열림

대표 기록 01
18세기 후반 / 프랑스 남부 / 항구 도시의 중개 상인
사람들 앞에서는 침착했지만, 중요한 마음은 끝까지 숨기는 쪽에 가까웠어요.

희미한 기록 02
고려 말 / 기록을 다루던 사람
자세한 삶은 아직 닫혀 있습니다.

희미한 기록 03
19세기 중반 / 약재와 이동이 관련된 삶
자세한 삶은 아직 닫혀 있습니다.

기록 01의 자세한 사랑, 죽음, 후회, 업보는 아직 잠겨 있습니다.
```

### 유료 콘텐츠 6개

MVP 우선순위:

1. 전생의 사랑
2. 전생의 죽음
3. 전생의 재산과 신분
4. 전생에서 남긴 업보
5. 현생에 남은 영향
6. 두 번째 전생

콘텐츠 구조 조정:

- "두 번째 전생"은 무료 결과에서 희미한 티저로만 보여준다.
- 결제 시 두 번째 전생의 구체적 삶, 성격, 사건, 현생 영향이 열린다.
- 추후 세 번째 전생도 같은 구조로 확장 가능하지만 MVP에서는 결제 콘텐츠로 만들지 않는다.

각 콘텐츠 가격:

```text
1개 unlock = 1 Soul
```

### 콘텐츠 일관성 규칙

모든 LLM 프롬프트에는 다음 정보를 반드시 포함한다.

- soul_id
- engine_version
- main_past_life
- hidden_nature
- traits
- 이미 생성된 무료 결과 요약
- 이미 생성된 유료 콘텐츠 요약

LLM 금지:

- 시대 변경
- 지역 변경
- 직업 변경
- 신분 변경
- 기존 인물 관계와 모순되는 설정 추가
- 과학적 사실처럼 단정
- "당신은 반드시..." 식의 운명 강요

---

## 9. LLM 프롬프트 정책

프롬프트 핵심:

```text
너는 전생을 결정하지 않는다.
아래 Soul Profile은 이미 결정된 세계관이다.
절대 변경하지 말고, 한국어 모바일 결과 페이지에 맞는 짧고 몰입감 있는 문장으로 작성한다.
```

문체:

- 한국어
- 20~30대 모바일 사용자 기준
- 과하게 문학적이지 않게
- 무속적 단어 최소화
- 한 문단 2~4줄
- 결과 페이지에서 스캔하기 쉬운 길이

금지 표현:

- "사실입니다"
- "증명됩니다"
- "반드시 그렇게 됩니다"
- "조상신"
- "빙의"
- "귀신"
- "부적"
- "굿"

권장 표현:

- "이 결과는 엔터테인먼트 기반 해석입니다"
- "생년월일의 흐름과 답변 패턴을 조합하면"
- "당신 안쪽에 반복되는 결은"
- "이 전생 이야기에서 가장 강하게 남은 장면은"

---

## 9-1. 사주/생년월일 기반 정보 처리와 토큰 절감

목표:

- 고객에게는 "나를 어느 정도 맞힌다"는 신뢰감을 먼저 준다.
- 운영 측면에서는 생년월일 해석을 매번 LLM으로 길게 요약하지 않는다.
- 동일 입력은 동일 성향 요약과 동일 전생 추천을 반환한다.

권장 구조:

```text
생년월일
→ 서버 내부 deterministic feature extraction
→ compact birth feature
→ 질문 답변 trait와 병합
→ nature_summary template 선택
→ Soul Profile 생성
→ 필요할 때만 LLM이 짧은 문장으로 다듬음
```

토큰을 줄이는 핵심 원칙:

1. 성향 요약은 우선 LLM 없이 만든다.
   - `birth_feature`, `trait scores`, `archetype id`를 기준으로 template을 조합한다.
   - 예: `strong_inner_standard`, `slow_emotional_disclosure`, `relationship_guarded`.

2. 외부 사주/만세력 API를 붙이더라도 원문 응답 전체를 LLM에 보내지 않는다.
   - 서버에서 필요한 값만 `birth_feature`로 압축한다.
   - 예: `seasonal_tone`, `element_balance`, `day_energy_group`, `hidden_drive`.

3. LLM에는 compact payload만 보낸다.
   - 보내는 것: `nature_summary`, `main_past_life`, `locked_content_type`, `tone`.
   - 보내지 않는 것: 질문 전체 문장, 모든 선택지 설명, 외부 API 원문, 긴 사주 해설문.

4. 캐싱을 강제한다.
   - `soul_hash + engine_version`으로 profile 캐싱
   - `soul_profile_id + content_type + prompt_version`으로 content 캐싱
   - 같은 사용자가 새로고침하거나 다시 들어와도 LLM을 다시 부르지 않는다.

5. 문장 생성 범위를 작게 나눈다.
   - 무료 결과 전체를 매번 장문 생성하지 않는다.
   - 대표 기록 소개, 사랑 기록, 마지막 날, 반복 패턴처럼 content_type별로 필요한 시점에만 생성한다.

6. 가장 많이 쓰는 문장은 config pool에 둔다.
   - 성향 headline
   - 전생 bridge 문장
   - 잠긴 기록 preview 2줄
   - 결제 유도 문구

MVP 권장:

```text
Phase 1: LLM 호출 없이 deterministic local writer로 결과 생성
Phase 2: 유료 콘텐츠부터 OpenAI provider 선택 적용
Phase 3: 품질이 부족한 content_type만 LLM 사용
```

주의:

- "사주 기반"이라고 강하게 말할수록 사용자는 더 정확한 감정을 기대한다.
- MVP는 출생 시간/음력/출생지를 엄밀하게 받지 않으므로 "정통 사주"처럼 포장하면 신뢰 리스크가 생긴다.
- 따라서 화면 문구는 "생년월일 기반 성향"을 기본으로 하고, 사주 표현은 보조 설명에서만 제한적으로 쓴다.

---

## 10. 페이지 흐름

### 1. 랜딩

목표:

- 3초 안에 "무료로 내 전생을 볼 수 있다" 이해
- 긴 설명 금지
- 바로 CTA 노출

첫 화면 카피 후보:

```text
전생 서랍

당신 안에 남아 있는
가장 오래된 기억

생년월일과 7개의 질문으로
지금의 나에게 이어진 첫 번째 서랍을 열어보세요.

[무료로 내 전생 확인하기]
```

보조 문구:

```text
AI 기반 엔터테인먼트 분석
전생서랍 18% 무료 공개
```

### 2. 기본 입력

- 닉네임
- 생년월일
- 출생 시간 선택 입력 또는 생략

UX:

- 한 화면에 너무 많이 넣지 않는다.
- 모바일 키보드에서 날짜 입력이 불편하지 않게 date picker 또는 분리 입력을 검토한다.

### 3. 7개 질문

권장 UX:

- 한 화면에 한 질문
- 하단 진행률
- 이전 버튼 제공
- 선택 즉시 다음으로 이동하거나, 선택 후 다음 버튼

권장 진행 문구:

```text
3 / 7
조금 더 깊은 패턴을 확인하고 있어요
```

### 4. 분석 중 화면

목표:

- 실제 API 처리 시간을 UX로 흡수
- 과장된 AI 로딩보다 "전생서랍이 열리는 느낌"

문구 후보:

```text
전생서랍 ID를 생성하고 있어요
생년월일과 답변 패턴을 연결하고 있어요
답변 속 반복 패턴을 연결하고 있어요
첫 번째 기록을 찾았어요
두 번째 기록의 직업을 확인하고 있어요
잠긴 기록을 정리하고 있어요
```

### 5. 무료 결과

구성:

- Soul ID
- 생년월일 기반 성향 요약
- 전생서랍 18% 열림
- 대표 전생 기록 1개
- 대표 기록의 시대/위치/직업
- 대표 기록의 짧은 성향 연결 문장
- 희미한 추가 기록 2개 티저
- 잠긴 기록 리스트
- 잠긴 기록별 2줄 preview

무료 결과 하단:

```text
이 결과는 AI 기반 엔터테인먼트 해석입니다.
개인의 선택이나 중요한 결정을 대신하지 않습니다.
```

### 6. 잠긴 콘텐츠 클릭

클릭 시:

- 로그인 전이면 이메일/소셜 로그인 유도
- Soul 부족이면 Soul Pack 화면
- Soul 있으면 unlock 확인

UX 문구:

```text
이 기록을 열려면 1 Soul이 필요해요.
```

---

## 11. 홈페이지 디자인 방향

현재 디자인 해석:

- 캐릭터/브랜드 감도가 있는 모바일 랜딩
- 짧고 선명한 카피
- 20~30대 여성 사용자가 촌스럽다고 느끼지 않을 세련된 톤
- 차분하지만 너무 무겁거나 칙칙하지 않은 톤
- 귀엽게 보이려고 과하게 꾸미지 않음
- 콘텐츠 커머스처럼 결제가 자연스러운 구조
- 스토리보다 CTA가 먼저 보이는 구성

### 디자인 키워드

- quiet
- warm
- archive
- drawer
- aged paper
- calm premium
- mobile editorial
- soft mystery
- modern feminine
- quiet but polished

### 피해야 할 것

- 부적/무당/점집 이미지
- 과한 금색
- 어두운 보라색 그라데이션 일변도
- 너무 칙칙한 검정/갈색 일변도
- 촌스러운 별자리/수정구/타로 클리셰
- 10대 취향처럼 과하게 귀여운 캐릭터성
- AI SaaS 느낌의 "Powered by AI" 배지
- 너무 긴 설명형 랜딩
- 카드가 너무 많은 템플릿형 화면

### 컬러 방향

권장:

- 배경: 연한 갈색 종이색 또는 바랜 노란빛
- 텍스트: 진한 잉크 브라운
- 보조: 낡은 종이 베이지, muted brown, soft brass
- 포인트: deep wood brown, muted brass

주의:

- 전체를 보라/남색으로만 만들지 않는다.
- 무속 사이트처럼 검정+금 조합으로 가지 않는다.
- 배경을 너무 어둡게 깔아 저가 운세 사이트처럼 보이지 않게 한다.
- 빈티지 질감을 과하게 넣어 카페 메뉴판처럼 보이지 않게 한다.
- 포인트 컬러는 버튼/진행률/선택 상태에만 제한적으로 쓴다.

### 비주얼

MVP에서 필요한 시각 자산:

- 메인 랜딩 배경 이미지 1개
- 결과 카드용 subtle texture 1개
- 잠긴 콘텐츠 아이콘 세트
- 전생서랍 progress 시각 요소

이미지 방향:

- 실제 인물 사진보다 추상적이고 감각적인 이미지
- 별자리/우주 클리셰를 줄이고, 오래된 서랍/종이 라벨/기록/빛/창문/실루엣 정도를 섞는다.
- 가능하면 AI 생성 이미지로 브랜드 톤을 맞춘다.

---

## 12. 결제 MVP

초기에는 mock payment로 시작한다.

목표:

- 결제 전환 UX와 DB 흐름을 먼저 검증
- 실제 PG 연동 전에도 unlock 로직과 transaction 기록을 완성

"실제 결제 시작 시점"의 의미:

- mock payment: 실제 돈은 결제되지 않지만, 사용자가 결제 버튼을 누르면 Soul이 지급되는 테스트 모드
- real payment: Toss Payments 또는 PortOne 같은 PG를 붙여 실제 카드/간편결제가 발생하는 모드

권장:

- 개발 중에는 mock payment로 전체 흐름을 먼저 완성한다.
- 사업자등록은 이미 되어 있으므로, Phase 2 완료 직후 실제 PG 가입/연동으로 넘어갈 수 있다.
- 광고 집행 전에는 실제 결제가 가능한 상태로 전환해야 한다.

### Soul Pack

```text
Starter: 3 Souls / ₩1,900
Basic: 5 Souls / ₩4,900
Popular: 12 Souls / ₩9,900
Deep Archive: 25 Souls / ₩18,900
```

가격은 config 또는 DB에서 관리한다.

### 실제 PG 후보

1. Toss Payments
   - 국내 사용자 결제 UX가 익숙하다.
   - 카드, 간편결제, 가상계좌 등 확장 가능.
   - 결제 상태 변경은 webhook으로 서버에서 처리해야 한다.

2. PortOne
   - 여러 PG를 한 번에 붙일 수 있는 중간 계층.
   - 추후 PG 변경 가능성이 높으면 유리하다.

MVP 권장:

- Phase 1: mock payment
- Phase 2: Toss Payments 또는 PortOne 중 하나 선택
- 사업자등록은 완료 상태
- PG 선택 전 통신판매업 신고, 정산 계좌, 환불 정책, 고객문의 채널 준비 상태 확인

---

## 13. 데이터베이스 설계

권장: Supabase Postgres

### users

```sql
id uuid primary key
email text unique
nickname text
soul_balance integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### anonymous_sessions

로그인 전 무료 분석 사용자 보존용.

```sql
id uuid primary key
session_id text unique not null
utm_source text
utm_medium text
utm_campaign text
utm_content text
ref_code text
created_at timestamptz not null default now()
```

### soul_profiles

```sql
id uuid primary key
user_id uuid null references users(id)
anonymous_session_id uuid null references anonymous_sessions(id)
soul_hash text not null
display_soul_id text not null
input_version text not null
engine_version text not null
nickname text not null
birth_date date not null
birth_time text null
calendar_type text not null default 'solar'
answers jsonb not null
birth_profile jsonb not null
traits jsonb not null
hidden_nature jsonb not null
main_past_life jsonb not null
created_at timestamptz not null default now()
unique(soul_hash, input_version, engine_version)
```

### soul_contents

```sql
id uuid primary key
soul_profile_id uuid not null references soul_profiles(id)
content_type text not null
content jsonb not null
is_unlocked boolean not null default false
generated_by text not null
prompt_version text not null
created_at timestamptz not null default now()
unlocked_at timestamptz null
unique(soul_profile_id, content_type)
```

### transactions

```sql
id uuid primary key
user_id uuid not null references users(id)
provider text not null
provider_transaction_id text unique
amount_krw integer not null
souls integer not null
payment_status text not null
raw_payload jsonb
created_at timestamptz not null default now()
completed_at timestamptz null
```

### soul_ledger

Soul 잔액 조작 방지용. 단순 balance만 업데이트하지 말고 ledger를 남긴다.

```sql
id uuid primary key
user_id uuid not null references users(id)
change_amount integer not null
reason text not null
reference_type text
reference_id uuid
created_at timestamptz not null default now()
```

### analytics_events

```sql
id uuid primary key
user_id uuid null references users(id)
anonymous_session_id uuid null references anonymous_sessions(id)
event_name text not null
event_properties jsonb not null default '{}'
utm_source text
utm_medium text
utm_campaign text
utm_content text
created_at timestamptz not null default now()
```

---

## 14. Analytics 이벤트

MVP 필수:

```text
landing_view
start_test
complete_questionnaire
view_free_result
click_locked_content
view_payment
purchase
unlock_content
```

MVP 이후:

```text
share_result
```

각 이벤트 공통 property:

```json
{
  "session_id": "string",
  "user_id": "uuid or null",
  "soul_profile_id": "uuid or null",
  "utm_source": "instagram",
  "utm_medium": "paid_social",
  "utm_campaign": "curiosity_test_001",
  "utm_content": "reels_a",
  "device": "mobile",
  "page": "/result"
}
```

중요 지표:

- 랜딩 → 테스트 시작률
- 테스트 시작 → 완료율
- 무료 결과 → 잠긴 콘텐츠 클릭률
- 잠긴 콘텐츠 클릭 → 결제 화면 진입률
- 결제 화면 → 구매 완료율
- 구매자당 평균 Soul 구매량
- 콘텐츠별 unlock 비율
- 광고 소재별 결제 전환율

---

## 15. 기술 스택

권장:

```text
Next.js App Router
TypeScript strict
Tailwind CSS
Supabase Postgres/Auth
OpenAI API
Vercel
Mock Payment → Toss Payments 또는 PortOne
```

이유:

- Next.js는 랜딩, API Route, 결과 페이지, 결제 callback을 한 프로젝트에서 처리하기 쉽다.
- Supabase는 DB/Auth/관리 UI를 빠르게 확보할 수 있다.
- 전생 결과는 서버에서 생성/저장해야 하므로 API Route 또는 Server Action 중심 구조가 적합하다.
- 결제와 Soul 지급은 반드시 서버에서만 처리한다.

---

## 16. 폴더 구조 설계

```text
src/
├── app/
│   ├── page.tsx
│   ├── test/
│   │   └── page.tsx
│   ├── result/
│   │   └── [soulId]/
│   │       └── page.tsx
│   ├── payment/
│   │   └── page.tsx
│   └── api/
│       ├── soul/
│       │   ├── create/route.ts
│       │   └── unlock/route.ts
│       ├── payment/
│       │   ├── mock/route.ts
│       │   └── webhook/route.ts
│       └── analytics/route.ts
├── components/
│   ├── landing/
│   ├── questionnaire/
│   ├── result/
│   ├── payment/
│   └── ui/
├── config/
│   ├── questions.ts
│   ├── pricing.ts
│   ├── contentTypes.ts
│   └── soulEnginePools.ts
├── lib/
│   ├── soul/
│   │   ├── normalizeInput.ts
│   │   ├── createSoulId.ts
│   │   ├── calculateBirthProfile.ts
│   │   ├── calculateTraits.ts
│   │   └── createSoulProfile.ts
│   ├── llm/
│   │   ├── prompts.ts
│   │   └── generateSoulContent.ts
│   ├── payment/
│   ├── analytics/
│   └── supabase/
├── types/
│   ├── soul.ts
│   ├── payment.ts
│   └── analytics.ts
└── tests/
    ├── soul-engine/
    ├── api/
    └── fixtures/
```

---

## 17. TDD 기준

AGENTS.md 원칙에 따라 Phase 1 구현 시 테스트 먼저 작성한다.

필수 테스트:

1. 동일 입력은 동일 normalized input을 만든다.
2. 공백/대소문자/Unicode 차이가 정규화된다.
3. 동일 입력은 동일 Soul ID를 만든다.
4. 동일 Soul ID는 동일 Soul Profile을 만든다.
5. 질문 설정 순서가 바뀌면 input_version으로 결과가 분리된다.
6. 이미 저장된 soul_content가 있으면 LLM을 다시 호출하지 않는다.
7. locked content 클릭 이벤트가 기록된다.
8. Soul balance는 클라이언트 값으로 변경되지 않는다.

---

## 18. 인스타그램 광고 준비 체크리스트

개발 외에 사용자가 준비해야 할 것:

1. 브랜드명 확정
   - 예: Soul Archive, 전생서랍, 오래된 나, Past Me 등

2. 도메인 구매
   - 짧고 기억하기 쉬운 도메인
   - Instagram 프로필 링크와 광고 랜딩 URL에 사용

3. 브랜드 인스타그램 계정 생성
   - 개인 계정이 아니라 professional/business 계정으로 전환
   - 프로필 이미지, 소개문, 웹사이트 링크 준비

4. Meta Business Suite 설정
   - 비즈니스 포트폴리오 생성
   - Instagram 계정 연결
   - Facebook Page 연결
   - 광고 계정 생성
   - 결제 수단 등록

5. Meta Events Manager 설정
   - Dataset/Pixel 생성
   - 웹사이트에 Pixel 설치
   - 가능하면 Conversions API도 함께 설계
   - purchase, view_payment, complete_questionnaire 등 이벤트 매핑

6. 광고 소재 준비
   - Reels 9:16 영상 3종
   - Story 9:16 이미지/영상 3종
   - 썸네일/첫 1초 후킹 문구
   - UTM이 포함된 랜딩 URL

7. 결제/사업 준비
   - 사업자등록 여부 결정
   - 통신판매업 신고 필요 여부 확인
   - PG 가입 준비
   - 정산 계좌
   - 개인정보처리방침/이용약관
   - 고객문의 이메일 또는 카카오 채널

8. 개인정보/약관
   - 개인정보처리방침
   - 이용약관
   - 환불 정책
   - 엔터테인먼트 서비스 고지
   - 만 14세 미만 이용 제한 여부 결정

---

## 19. 광고 테스트 설계

초기 광고 예산은 Instagram Reels 기준 하루 2만원으로 잡는다.

현실 운영 원칙:

- 하루 2만원이면 3개 이상 소재를 동시에 테스트하기에는 데이터가 너무 얇다.
- 첫 주는 2개 소재만 비교한다.
- 성과가 낮은 소재를 끄고 새 소재를 하나씩 교체한다.
- 목표는 처음부터 ROAS를 맞추는 것이 아니라, 어떤 메시지에서 테스트 완료율과 locked click이 나오는지 확인하는 것이다.

### 소재 A: 순수 호기심

Hook:

```text
당신 안에 남아 있는 전생 하나를 열어보세요.
```

랜딩 headline:

```text
당신 안에 남아 있는 가장 오래된 기억
```

### 소재 B: 숨겨진 본성

Hook:

```text
사람들이 보는 나 말고, 진짜 내 안쪽은 어떤 모습일까?
```

랜딩 headline:

```text
내가 반복하는 감정에는 이유가 있을지도 몰라요
```

### 소재 C: 전생의 사랑

Hook:

```text
전생에서 사랑했던 사람의 흔적이 아직 남아 있다면?
```

랜딩 headline:

```text
당신의 Soul Archive에서 가장 강한 인연
```

### 초기 예산 운영

권장:

- 일 2만원
- 1차 테스트는 소재 A/B 2개만 운영
- 최소 5~7일은 같은 조건으로 유지
- 소재별 랜딩 진입, 테스트 완료, 결제 클릭, 구매까지 추적
- 소재 C는 2차 테스트에서 투입

중단 기준 예시:

- 랜딩 → 테스트 시작률 20% 미만이면 랜딩 첫 화면 수정
- 테스트 시작 → 완료율 55% 미만이면 질문 UX 수정
- 무료 결과 → locked click 15% 미만이면 무료 결과/잠금 카피 수정
- 결제 화면 → 구매 3% 미만이면 가격/패키지/결제 신뢰 요소 수정

---

## 20. 운영자용 최소 관리자 화면

MVP에서는 Supabase 테이블 직접 확인으로 시작해도 된다. 다만 서비스 운영이 시작되면 최소 admin page가 필요하다.

초기 admin 지표:

- 오늘 landing_view
- 오늘 start_test
- 오늘 complete_questionnaire
- 오늘 view_free_result
- 오늘 click_locked_content
- 오늘 purchase
- 오늘 매출
- UTM campaign별 구매 수
- 가장 많이 클릭된 locked content
- 가장 많이 unlock된 content

---

## 21. 개발 Phase

### Phase 0: 기획/셋업

산출물:

- PRD 확정
- 질문지 확정
- Soul Engine v1 규칙 확정
- DB schema 확정
- 브랜드명/도메인 후보 확정
- 세련된 모바일 콘텐츠 브랜드 방향 확정

### Phase 1: 핵심 MVP

구현:

- 랜딩
- 입력 폼
- 7개 질문
- input normalization
- Soul ID
- deterministic Soul Engine
- Soul Profile
- 무료 결과
- DB 저장
- 동일 입력 결과 재사용
- 잠긴 콘텐츠 UI
- analytics event 저장
- 모바일 반응형

검증:

- 같은 입력으로 10번 실행해도 같은 결과
- 다른 닉네임/생년월일/답변으로 결과가 충분히 달라짐
- LLM이 핵심 설정을 바꾸지 않음

### Phase 2: 결제 MVP

구현:

- 로그인
- Soul balance
- mock payment
- transaction 기록
- soul ledger
- unlock
- 유료 콘텐츠 생성 및 캐싱

### Phase 3: 실제 결제

구현:

- Toss Payments 또는 PortOne 연동
- payment callback
- webhook
- 결제 실패/취소 처리
- 환불 정책 반영

### Phase 4: 광고 운영 대응

구현:

- Meta Pixel
- Conversions API 검토
- UTM dashboard
- 광고 소재별 funnel
- 결과 페이지 카피 A/B 테스트 기반 구조

---

## 22. 현재 결정사항

2026-08-18 기준 결정사항:

1. 서비스 이름
   - 화면 표시명: 전생 서랍
   - 내부 도메인명: 전생서랍
   - 최종 확정 전 도메인, 인스타그램 핸들, 상표 간단 검색 필요

2. 외부 디자인 레퍼런스
   - 별도 확인하지 않는다.
   - 방향은 철학적 전생 서비스가 아니라 세련된 모바일 콘텐츠 브랜드로 간다.

3. 출생 시간 입력 여부
   - 선택 입력으로 확정
   - "모르면 비워두기" 제공

4. 양력/음력 입력 여부
   - 양력으로 통일
   - 음력 변환은 MVP에서 지원하지 않음

5. 실제 결제 시작 시점
   - 개발 중에는 mock payment
   - 광고 집행 전에는 실제 PG 결제 가능 상태로 전환

6. 사업자등록 상태
   - 완료 상태
   - 추가 확인 필요: 통신판매업 신고, 정산 계좌, 환불 정책, 고객문의 채널

7. OpenAI API 사용 동의
   - 사용 확정
   - 비용 통제를 위해 무료/유료 결과 모두 DB 캐싱

8. 초기 광고 예산
   - Instagram Reels 하루 2만원
   - 첫 주는 소재 2개만 테스트

9. 결과 문체 수위
   - 담백한 톤으로 확정
   - 과한 운세풍, 무속풍, 철학적 문체 지양

10. 무료 결과 공개량
    - 전생의 대략적 위치와 직업 위주로 공개
    - 전생 여러 개의 티저를 보여주고, 세부 이야기는 unlock 구조로 잠금

---

## 22-1. 아직 추가로 확인할 것

1. 최종 브랜드명
   - 화면 표시명은 "전생 서랍"으로 우선 확정
   - 도메인/인스타그램 핸들/상표 확인 후 외부 브랜드 표기를 최종 확정

2. 도메인 후보
   - 예: `jeonsaengdrawer`, `pastdrawer`, `oldshelf` 등
   - 실제 구매 가능 여부 확인 필요

3. 인스타그램 계정명
   - 브랜드명과 동일하거나 최대한 가까운 핸들 확보 필요

4. PG 후보
   - Toss Payments 우선 추천
   - 여러 PG 확장 가능성을 원하면 PortOne 검토

5. 통신판매업 신고 여부
   - 사업자등록과 별개로 확인 필요

6. 고객문의 채널
   - 최소 이메일 필요
   - 광고 집행 후에는 카카오 채널도 검토

---

## 23. 현실 리스크

### 리스크 1. 질문이 여전히 결과를 예측 가능하게 만들 수 있음

대응:

- 질문은 trait에만 반영
- 시대/직업/지역은 여러 trait와 hash seed를 함께 사용
- 결과에 질문 답변을 직접적으로 드러내지 않음

### 리스크 2. 생년월일 기반 분석이 사주 서비스로 오해될 수 있음

대응:

- 외부 카피에서 "사주", "명리", "팔자"를 쓰지 않음
- "생년월일과 직관 답변을 조합"한다고만 표현
- Footer/결과 하단에 엔터테인먼트 고지

### 리스크 3. LLM 비용 증가

대응:

- 생년월일 성향 요약은 LLM이 아니라 deterministic template으로 먼저 생성
- 외부 API 원문 응답을 LLM에 전달하지 않고 compact feature만 저장
- 무료 결과와 유료 콘텐츠 모두 DB 캐싱
- content_type별 1회 생성
- prompt version 관리
- 같은 Soul Profile은 재생성하지 않음

### 리스크 4. 결제 전환이 낮을 수 있음

대응:

- 무료 결과에서 대표 전생 1개에 집중하고 추가 기록 2개는 희미한 티저로만 보여줌
- 잠긴 콘텐츠 제목을 강하게 설계
- 첫 구매 패키지를 낮은 가격으로 둠
- locked click 전환 데이터를 먼저 본 뒤 가격 조정

### 리스크 5. 광고 심사

대응:

- 과도한 운명 단정, 공포 조장, 개인 특성 단정 카피를 피함
- "당신은 불행한 이유가 있다"보다 "반복되는 감정의 패턴"으로 표현
- 랜딩에 엔터테인먼트 고지와 개인정보처리방침 준비

---

## 24. 고객 관점 재검토

이 섹션은 사용자가 광고를 보고 들어와 결제까지 가는 실제 감정 흐름을 기준으로 기획을 다시 점검한 내용이다.

### 24-1. 고객이 느끼는 핵심 욕망

이 서비스의 결제 포인트는 "전생을 알고 싶다" 하나만으로는 약하다.

더 강한 욕망은 다음이다.

1. 내가 왜 이런 성향을 반복하는지 알고 싶다.
2. 내 안에 남들이 모르는 모습이 있다는 말을 듣고 싶다.
3. 전생에서 사랑했던 사람이나 이별한 사람이 궁금하다.
4. 내가 잃어버린 장면, 마지막 순간, 후회가 궁금하다.
5. 결과가 내 얘기처럼 느껴져서 더 열어보고 싶다.

따라서 랜딩과 결과 페이지의 핵심은 "전생 정보"가 아니라 "지금의 나와 연결되는 오래된 기록"이어야 한다.

### 24-2. 더 부각해야 할 포인트

#### 1. 대표 전생 1개에 집중하고, 추가 기록은 티저로만 보여주기

고객은 하나의 전생을 길게 읽고 나면 끝났다고 느낄 수 있다. 하지만 전생 3개를 같은 무게로 보여주면 무엇에 몰입해야 하는지 흐려진다.

MVP에서는 다음 구조가 가장 적합하다.

```text
전생서랍
대표 기록 1개가 열렸어요
희미한 추가 기록 2개가 감지됐어요

대표 기록 01: 프랑스 남부 / 항구 도시의 중개 상인
희미한 기록 02: 고려 말 / 기록을 다루던 사람
희미한 기록 03: 19세기 중반 / 약재와 이동이 관련된 삶
```

결제 유도는 대표 기록 01에 먼저 집중한다.

```text
잠긴 기록
- 그 사람이 끝까지 말하지 못한 사랑
- 마지막 날, 당신이 떠나지 못한 이유
- 돈과 신분을 얻고도 불안했던 이유
- 이번 생에 남은 반복 패턴
- 두 번째 기록 자세히 보기
```

#### 2. 잠금 제목은 정보형보다 장면형

약한 제목:

```text
전생의 사랑
전생의 죽음
전생의 재산
```

강한 제목:

```text
끝까지 말하지 못한 그 사람
당신의 마지막 날
돈은 있었지만 편하지 않았던 이유
이번 생에 반복되는 감정의 시작점
두 번째 기록: 전혀 다른 삶의 당신
```

MVP에서는 메뉴명은 관리상 `love`, `death`, `wealth_status`처럼 두되, UI 제목은 장면형으로 노출한다.

#### 3. 무료 결과에도 "나 같다"는 문장 한 줄은 필요

위치와 직업만 공개하면 결제 유도는 쉬워지지만, 신뢰가 약해질 수 있다.

따라서 무료 결과에는 대표 기록에만 성향 연결 한 줄을 넣는다. 희미한 기록에는 성향 문장을 넣지 않거나 아주 짧게만 둔다.

예:

```text
기록 01
18세기 후반 / 프랑스 남부 / 항구 도시의 중개 상인
사람들 앞에서는 침착했지만, 중요한 마음은 끝까지 숨기는 쪽에 가까웠어요.
```

이 한 줄은 핵심 스토리를 공개하지 않으면서도 개인화 느낌을 만든다.

#### 4. 첫 결제는 "팩 구매"보다 "지금 이 기록 열기"로 느껴져야 함

고객은 `3 Souls / 1,900원`을 사러 온 것이 아니다.

고객이 누르는 것은:

```text
끝까지 말하지 못한 그 사람 열기
```

그 다음 결제 화면에서:

```text
이 기록을 열려면 1 Soul이 필요해요.
첫 기록은 Starter Pack으로 열 수 있어요.
```

처럼 연결한다.

### 24-3. 추가하면 좋은 것

#### 1. 결과 생성 전 기대감 단계

분석 중 화면은 단순 로딩이 아니라 결제 전환의 예열 구간이다.

권장 문구:

```text
첫 번째 기록을 찾았어요
두 번째 기록의 직업을 확인하고 있어요
반복되는 감정 패턴을 연결하고 있어요
잠긴 기록을 정리하고 있어요
```

고객은 결과 전에 이미 "여러 기록이 있구나"라고 이해한다.

#### 2. 첫 번째 잠금 콘텐츠의 2줄 미리보기

각 잠긴 콘텐츠에 완전 비공개보다 짧은 preview를 둔다.

예:

```text
끝까지 말하지 못한 그 사람
그 사람은 당신의 삶에서 가장 조용한 균열이었습니다.
마지막 편지는 끝내...
[1 Soul로 열기]
```

마지막 문장을 끊어 curiosity gap을 만든다.

#### 3. "오늘 발견된 기록" 표현

전생 결과가 정적 테스트처럼 보이지 않게, archive 탐색 느낌을 준다.

예:

```text
오늘 열린 기록 3개
아직 닫힌 기록 6개
```

#### 4. 결제 전 신뢰 요소

결제 화면에 짧게만 넣는다.

```text
결제 후 바로 열람
같은 Soul ID는 언제든 다시 확인
엔터테인먼트 기반 AI 스토리텔링
```

긴 설명은 전환을 떨어뜨릴 수 있으므로 FAQ로 내린다.

#### 5. 광고 소재용 결과 화면 캡처 구조

MVP에서도 광고 소재로 재활용 가능한 결과 UI가 필요하다.

필수 시각 요소:

- `전생서랍`
- `대표 기록 1개 열림`
- `희미한 추가 기록 2개`
- 잠긴 콘텐츠 버튼
- 짧은 Soul ID

이 구조가 있어야 서비스 화면 자체를 Reels 소재로 만들 수 있다.

### 24-4. 빼거나 줄이면 좋은 것

#### 1. Soul Archive 영어 표현

내부 개념으로는 좋지만, 한국 고객에게는 첫 화면에서 약할 수 있다.

UI 권장:

```text
전생서랍
18% 열림
```

보조로만:

```text
Soul Archive #A82F19
```

#### 2. 과한 "숨겨진 본성" 설명

너무 심리상담처럼 보이면 전생 서비스의 재미가 약해진다.

숨겨진 본성은 결과의 근거로만 짧게 쓴다.

```text
이 기록은 당신이 감정을 숨기고 먼저 정리하려는 패턴과 연결돼요.
```

#### 3. 무료 결과에서 현생 영향 공개

현생 영향은 결제 콘텐츠로 더 강하다.

무료에서는 "이 기록은 지금의 관계 패턴과 연결되어 있습니다" 정도로만 보여주고, 구체 해석은 잠근다.

#### 4. 가격표 먼저 노출

가격표를 먼저 보여주면 콘텐츠보다 결제 부담이 먼저 온다.

순서:

```text
잠긴 기록 클릭
→ 2줄 preview
→ 1 Soul 필요
→ Starter Pack 제안
```

### 24-5. 디자인 테마

권장 테마명:

```text
Warm Drawer Archive
```

느낌:

- 세련된 모바일 콘텐츠
- 연한 갈색과 바랜 노란빛의 서랍장/기록 보관소
- 오래된 기록을 여는 듯한 감각
- 너무 우주적이거나 점집 같지 않음

컬러:

```text
background: #F5E8C8
surface: #FFF7E3
drawer surface: #E4C98F
text: #2E2418
muted: #8A7352
line: #D4B77A
accent: #8F5A2A
secondary accent: #B8873E
```

사용법:

- 전체는 따뜻한 종이색 계열
- 패널은 종이보다 조금 밝게
- 포인트는 진한 목재색과 작은 황동색
- 과한 금박, 광택, 보라색 그라데이션을 메인으로 쓰지 않는다.
- 빈티지 질감은 아주 약하게만 사용해 모바일에서 촌스럽지 않게 한다.

타이포그래피:

- 제목은 크지만 과하게 시적이지 않게
- 본문은 짧고 읽기 쉽게
- 결과 카드는 라벨, 위치, 직업이 한눈에 보여야 한다.

화면 구조:

```text
[전생 서랍]
생년월일과 답변 패턴을 보면
당신은 마음속 기준이 강한 사람에 가까워요.

첫 번째 서랍이 열렸어요

[대표 기록 01]
18세기 후반
프랑스 남부
항구 도시의 중개 상인

[희미한 추가 기록]
기록 02
기록 03

[잠긴 기록]
끝까지 말하지 못한 그 사람
당신의 마지막 날
이번 생에 남은 반복 패턴
```

모바일 UI 원칙:

- 첫 화면 CTA는 접히지 않게 한다.
- 질문 화면은 한 번에 한 질문만 보여준다.
- 결과 페이지에서 잠긴 콘텐츠가 첫 화면 아래 바로 보여야 한다.
- 결제 버튼은 콘텐츠명과 함께 보여준다.
- 카드 모서리는 8px 이하로 유지해 템플릿 느낌을 줄인다.

### 24-6. 광고에서 부각할 메시지

하루 2만원 예산 기준으로 첫 테스트는 2개 메시지만 추천한다.

#### 1차 소재 A: 전생 호기심

```text
내 전생이 하나가 아니라면?
생년월일과 7개의 질문으로
당신 안에 남은 기록을 열어보세요.
```

#### 1차 소재 B: 숨겨진 본성

```text
사람들이 아는 나 말고
이상하게 반복되는 내 모습.

그 시작점이 전생서랍에 남아 있다면?
```

2차 테스트에서 넣을 소재:

```text
전생에서 사랑했던 사람이
이번 생에 흔적으로 남아 있다면?
```

연애 소재는 클릭은 강할 수 있지만 과장/자극으로 흐르기 쉬우므로, 첫 주에는 A/B 결과를 보고 투입한다.

### 24-7. 최종 권장 변경 요약

추가:

- 잠긴 콘텐츠 2줄 preview
- 무료 결과의 기록별 성향 연결 한 줄
- "전생서랍 18% 열림" UI 문구
- 결제 전 신뢰 요소 3개
- 광고 소재로 재활용 가능한 결과 화면 구조

줄임:

- Soul Archive 영어 전면 노출
- 무료 결과의 현생 영향 상세
- 숨겨진 본성 장문 설명
- 가격표 선노출

강조:

- 대표 전생 기록 발견
- 희미한 추가 기록 2개
- 끝까지 말하지 못한 사랑
- 마지막 날
- 이번 생에 반복되는 감정
- 같은 Soul ID로 다시 볼 수 있는 보존감

### 24-8. 추가 고객 매력 장치 후보

다음 장치들은 고객이 "내 얘기 같다"와 "더 열어보고 싶다"를 동시에 느끼게 하기 위한 후보이다. MVP에서는 전부 넣기보다 2~3개만 우선 적용한다.

#### 1. 첫 번째 서랍 라벨

결과를 단순 카드가 아니라 서랍 라벨처럼 보여준다.

```text
첫 번째 서랍
18세기 후반 / 프랑스 남부
항구 도시의 중개 상인
```

효과:

- `전생 서랍` 컨셉이 즉시 이해된다.
- 잠긴 콘텐츠가 "다른 페이지"가 아니라 "아직 닫힌 서랍"처럼 느껴진다.

#### 2. 성향 확인 도장

전생 추천 전에 짧은 성향 요약을 보여주고, 그 아래에 작은 확인 도장처럼 표시한다.

```text
생년월일 기반 성향 확인
답변 패턴 반영 완료
첫 번째 기록 연결됨
```

효과:

- 사주/심리테스트류 사용자에게 신뢰감을 준다.
- 분석이 그냥 랜덤 전생 생성이 아니라는 인상을 준다.

#### 3. 잠긴 서랍의 먼지 낀 단서

잠긴 콘텐츠에 제목만 두지 말고 1~2줄 단서를 붙인다.

```text
끝까지 말하지 못한 그 사람
이 기록에는 이름보다 먼저 남은 감정이 있어요.
```

효과:

- 결제 전 궁금증이 커진다.
- "사랑", "죽음" 같은 노골적 메뉴보다 고급스럽다.

#### 4. 전생서랍 열림률

무료 결과는 `18% 열림`처럼 일부만 공개된 느낌을 준다.

```text
전생 서랍 18% 열림
첫 번째 기록 공개
잠긴 서랍 5개 남음
```

효과:

- 무료 공개량이 적어도 납득된다.
- 추가 열람 동기가 생긴다.

#### 5. 이번 생 연결 한 줄

무료 대표 기록 끝에 현재 성향과 연결되는 한 줄만 둔다.

```text
그래서 이번 생에서도 중요한 마음일수록 쉽게 말하지 않는 쪽에 가까워요.
```

효과:

- 결과가 단순 소설이 아니라 "내 이야기"처럼 느껴진다.
- 단, 구체 해석은 잠긴 콘텐츠로 남긴다.

#### 6. 다시 열 수 있는 보존감

결제 전후에 같은 Soul ID로 다시 볼 수 있다는 느낌을 준다.

```text
이 서랍은 같은 Soul ID로 다시 열 수 있어요.
```

효과:

- 일회성 테스트보다 소장감이 생긴다.
- 로그인 전환 이유가 자연스러워진다.

우선순위 추천:

```text
1순위: 성향 요약 + 첫 번째 서랍 라벨 + 잠긴 서랍 단서
2순위: 전생서랍 열림률 + 이번 생 연결 한 줄
3순위: 다시 열 수 있는 보존감
```

---

## 25. 외부 준비 링크

현재 공식 문서 기준으로 확인한 참고 링크:

- Instagram 광고 시작: https://www.facebook.com/business/ads/instagram-ad
- Instagram professional account와 Facebook Page 연결: https://www.facebook.com/help/instagram/402748553849926/
- Meta Pixel/Dataset 설치: https://www.facebook.com/help/messenger-app/952192354843755
- Meta Business Tools 개요: https://www.facebook.com/help/331509497253087/
- Supabase Next.js Auth: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Toss Payments 결제창 연동: https://docs.tosspayments.com/en/integration
- Toss Payments webhook: https://docs.tosspayments.com/guides/v2/webhook
- PortOne Korea 결제수단: https://docs.portone.cloud/docs/portone-korea
- PortOne webhook: https://docs.portone.cloud/docs/webhook-configuration

---

## 26. 다음 작업 순서

1. 이 문서에서 결정 필요 항목을 확정한다.
2. `docs/PRD.md`를 이 기획에 맞게 업데이트한다.
3. `docs/ARCHITECTURE.md`에 실제 폴더 구조와 데이터 흐름을 반영한다.
4. `docs/UI_GUIDE.md`에 최종 디자인 톤을 반영한다.
5. Soul Engine v1의 trait, pool, mapping table을 별도 문서로 만든다.
6. Phase 1 테스트 목록을 만든다.
7. Next.js 프로젝트를 생성하고 TDD 방식으로 Phase 1 구현을 시작한다.
