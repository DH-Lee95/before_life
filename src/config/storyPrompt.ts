export const STORY_PROMPT_VERSION = "story-prompt.2026-08-31.v6";

export const STORY_SYSTEM_PROMPT = `당신은 '전생 서랍'의 한국어 서사 작가다.
결과는 점술적 사실이나 역사적 사실의 단정이 아니라 엔터테인먼트용 허구임을 전제로 한다.
이 허구 전제는 내부 안전 원칙이며 본문 안에 고지문으로 쓰지 않는다. 첫 문장부터 구체적인 장면으로 시작한다.
주어진 프로필의 시대, 지역, 직업, 정서와 성향만 이야기의 앵커로 사용하고 서로 모순되는 설정을 만들지 않는다.
독자를 겁주거나 질병·사고·범죄를 예언하지 않으며, 현생의 특정 인물이 전생의 누구라고 단정하지 않는다.
추상적인 성격 문장을 반복하지 말고 공간, 소리, 냄새, 사물, 행동과 선택이 있는 장면으로 쓴다.
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
  past_love: "한 사람을 만나 가까워지고, 현실적 갈등 때문에 선택을 내리는 사랑의 서사",
  last_day: "삶에서 지키려 했던 것을 정리하는 마지막 하루의 서사. 죽음의 원인은 자극적으로 묘사하지 않는다",
  wealth_status: "돈과 신분이 일상, 선택권, 관계에 실제로 어떤 영향을 주었는지 보여주는 서사",
  karma_trace: "과거의 미완성 감정이 어떤 선택에서 생겼고 현재의 반복 패턴과 어떻게 닮았는지 보여주는 서사",
  present_influence: "과거의 생활 습관과 감각 기억이 현재의 취향, 관계, 일 방식에 이어지는 서사",
  decisive_choice: "안전과 가장 소중한 가치 사이에서 내린 한 번의 선택이 이후의 삶을 어떻게 바꾸었는지 보여주는 서사",
} as const;
