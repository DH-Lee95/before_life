export const STORY_PROMPT_VERSION = "story-prompt.2026-08-31.v7";

export const STORY_SYSTEM_PROMPT = `당신은 '전생 서랍'의 한국어 서사 작가다.
결과는 점술적 사실이나 역사적 사실의 단정이 아니라 엔터테인먼트용 허구임을 전제로 한다.
이 허구 전제는 내부 안전 원칙이며 본문 안에 고지문으로 쓰지 않는다. 첫 문장부터 구체적인 장면으로 시작한다.
주어진 프로필의 시대와 지역은 사건이 일어나는 환경으로 유지하고, 직업은 배경 정보로만 절제해 사용한다.
주인공의 직업이 아니라 숨은 성향, 핵심 정서, 성격과 관계에서의 선택이 사건을 이끌게 한다.
장부, 도구, 물건, 일터 같은 직업 소품을 여러 장에 반복해 성격을 대신하지 않는다.
독자를 겁주거나 질병·사고·범죄를 예언하지 않으며, 현생의 특정 인물이 전생의 누구라고 단정하지 않는다.
추상적인 성격 문장을 반복하지 말고 공간, 소리, 냄새, 사물, 행동과 선택이 있는 장면으로 쓴다.
평탄한 에피소드를 나열하지 말고, 도입의 욕망과 불안이 부딪히며 갈등이 커지고 선택의 대가가 남는 기승전결을 만든다.
독자가 다음 장면을 궁금해하도록 비밀, 오해, 예상 밖의 고백, 돌이킬 수 없는 선택 중 이야기에 맞는 장치를 사용하되 자극만을 위한 범죄나 막장 반전은 피한다.
독자가 한 번에 이해할 수 있도록 누가 무엇을 했고 왜 그런 선택을 했는지 분명하게 쓴다.
분위기를 위한 비유는 사용할 수 있지만, 비유만으로 뜻을 대신하지 않는다. 낯선 상징이나 사물이 나오면 실제 상황과 의미를 바로 설명한다.
한 문장에 추상적인 명사를 여러 개 겹치지 말고, 익숙한 단어와 구체적인 행동을 우선한다.
프로필의 짧은 라벨을 문장에 그대로 끼워 넣지 말고, 함께 제공된 설명을 이해한 뒤 장면과 행동으로 풀어 쓴다.
모든 문장은 완결된 한국어 문장으로 작성하고 명사 뒤의 조사와 어미가 자연스럽게 이어지는지 확인한다.
제출하기 전에 전체 글을 소리 내어 읽는다는 기준으로 비문, 중복 표현, 주어와 서술어의 불일치를 조용히 한 번 고쳐 쓴다.
출력 형식은 API가 제공하는 JSON Schema를 정확히 따른다.`;

export const STORY_OUTPUT_FORMAT = {
  type: "json_schema",
  name: "past_life_story",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "opening", "chapters", "presentMeaning", "readingTimeMinutes"],
    properties: {
      title: { type: "string" },
      opening: { type: "string" },
      chapters: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "paragraphs"],
          properties: {
            title: { type: "string" },
            paragraphs: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              items: { type: "string" },
            },
          },
        },
      },
      presentMeaning: { type: "string" },
      readingTimeMinutes: { type: "integer", minimum: 2, maximum: 8 },
    },
  },
} as const;

export const WHOLE_LIFE_OUTPUT_FORMAT = {
  type: "json_schema",
  name: "past_life_whole_life",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "opening", "chapters", "presentMeaning", "readingTimeMinutes"],
    properties: {
      title: { type: "string" },
      opening: { type: "string" },
      chapters: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["stage", "title", "paragraphs"],
          properties: {
            stage: { type: "string", enum: ["유년기", "청년기", "중년기", "말년기"] },
            title: { type: "string" },
            paragraphs: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: { type: "string" },
            },
          },
        },
      },
      presentMeaning: { type: "string" },
      readingTimeMinutes: { type: "integer", minimum: 8, maximum: 12 },
    },
  },
} as const;

export const storyFocusByContentType = {
  past_love: "두 사람이 서로에게 깊이 빠지지만 숨긴 진실과 서로 다른 두려움이 부딪혀, 선택의 대가를 남기는 사랑의 서사",
  last_day: "죽음이 임박했다는 사실 앞에서 가장 피하고 싶었던 사람과 진실을 대면하고, 마지막 선택의 대가를 남기는 하루의 서사",
  wealth_status: "돈과 신분이 일상, 선택권, 관계에 실제로 어떤 영향을 주었는지 보여주는 서사",
  karma_trace: "과거의 미완성 감정이 어떤 선택에서 생겼고 현재의 반복 패턴과 어떻게 닮았는지 보여주는 서사",
  present_influence: "과거의 생활 습관과 감각 기억이 현재의 취향, 관계, 일 방식에 이어지는 서사",
  decisive_choice: "안전과 가장 소중한 가치 사이에서 내린 한 번의 선택이 이후의 삶을 어떻게 바꾸었는지 보여주는 서사",
  family_bonds: "부모에게 받은 사랑과 상처, 자식에게 주려 했던 것을 한 가족의 사건으로 보여주고 현생의 가족 관계 패턴과 연결하는 서사",
} as const;
