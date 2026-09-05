import { STORY_OUTPUT_FORMAT, STORY_PROMPT_VERSION, STORY_SYSTEM_PROMPT, WHOLE_LIFE_OUTPUT_FORMAT, storyFocusByContentType } from "@/config/storyPrompt";
import type { LockedContentType, SoulProfile } from "@/types/soul";

export type StoryGenerationPrompt = {
  version: string;
  system: string;
  user: string;
  outputFormat: typeof STORY_OUTPUT_FORMAT;
  qualityContext: StoryQualityContext;
};

export type StoryQualityContext = { requiredAnchors: string[]; forbiddenTerms: string[] };

export type WholeLifeGenerationPrompt = Omit<StoryGenerationPrompt, "outputFormat"> & {
  outputFormat: typeof WHOLE_LIFE_OUTPUT_FORMAT;
};

const dramaticArcByContentType: Record<LockedContentType, string> = {
  past_love: `- 이 글의 중심은 직업이 아니라 두 사람의 욕망과 두려움, 서로에게 숨긴 진실이다
- 가까워짐 → 갈등의 폭발 → 되돌릴 수 없는 선택과 여운이 뚜렷하게 이어지게 할 것
- '나를 믿어 달라'는 말만으로 갈등을 만들지 말 것. 각자가 실제로 잃을 생활·관계·기회를 말하게 할 것
- 사랑을 방해하는 요인은 신분 차이만 반복하지 말고, 가족의 약속·떠날 기회·숨긴 과거·서로 다른 책임 중 성향에 맞는 하나를 선택할 것`,
  last_day: `- 도입부터 죽음이 임박했다는 사실과 남은 시간을 독자가 분명히 알 수 있게 할 것
- 남은 시간의 제약 → 피하고 싶은 사람이나 진실과의 대면 → 마지막 선택과 대가로 이어지게 할 것
- 1장은 마지막 날의 재회, 2장은 '몇 년 전'이라고 밝힌 과거 사건, 3장은 현재의 마지막 선택으로 시간대를 분명히 나눌 것
- 과거의 직장 갈등을 마지막 날에 새로 벌어지는 사건처럼 배치하지 말 것
- 마지막 날 찾아오는 중심 인물은 정본의 핵심 관계로 삼고, 과거 갈등 인물을 다시 불러 같은 논쟁을 반복하지 말 것
- 이미 공개하거나 전달한 기록을 마지막 날까지 숨겼다고 바꾸지 말 것
- 핵심 관계는 선택 뒤에도 곁을 지킨 사람이다. 오랫동안 헤어졌거나 주인공이 버리고 떠난 사람으로 바꾸지 말 것
- 2장의 과거 회상에서는 물건을 확인하거나 공개할 수 있지만 다른 사람에게 건네지 말 것. 물건을 핵심 관계에게 건네는 장면은 3장에서 한 번만 쓸 것
- 이미 공개한 사건의 사실을 비밀이라고 하지 말고, 당시 상대에게 설명하지 못한 영향과 감정을 마지막 고백으로 삼을 것
- 도입부터 생애를 잇는 물건은 주인공 곁에 둘 것. 찾아온 인물이 그 물건을 가져오게 하지 말 것
- 죽음의 원인은 시대에 맞게 짧고 명확히 제시하되, 잔혹하거나 신체를 세세하게 묘사하지 않음
- 시대의 인물이 알 수 없는 내부 장기 진단을 쓰지 말고 고열, 기침, 쇠약처럼 관찰할 수 있는 증상만 쓸 것
- 과거에 이미 치른 대가를 마지막 날에 다시 일어난 결과처럼 쓰지 말 것. 과거의 결과와 마지막 날의 행동을 분리할 것`,
  wealth_status: "- 돈과 신분은 설명이 아니라 인물의 욕망, 열등감, 신념을 충돌시키는 사건으로 보여줄 것",
  karma_trace: "- 과거의 잘못된 선택과 그로 인해 멀어진 사람을 구체적으로 보여주고, 현재의 반복 패턴으로 연결할 것",
  present_influence: `- 직업 습관보다 사람을 믿는 기준, 갈등을 피하는 방식, 안정감을 얻는 방식에 초점을 둘 것
- 생애 전체를 요약하지 말고 한 시기의 일상 장면 2~3개로 습관이 생긴 과정을 보여줄 것`,
  decisive_choice: "- 외부의 위기보다 주인공의 성격적 약점과 지키고 싶은 가치가 충돌하게 할 것",
  family_bonds: `- 전생의 부모와의 관계, 자식 또는 자식처럼 돌본 아이와의 관계를 모두 포함할 것
- 부모에게서 받은 방식이 자식을 대하는 선택에 어떻게 반복되거나 끊겼는지 하나의 사건으로 연결할 것
- 마지막 해석에서는 현생의 부모·자녀·가족 관계에서 나타날 수 있는 기대, 거리 두기, 책임감의 패턴을 구체적으로 설명할 것
- 현생의 특정 가족이 전생의 그 사람과 같은 사람이라고 환생했다고 단정하지 말 것`,
};

export function createStoryGenerationPrompt(
  profile: SoulProfile,
  contentType: LockedContentType,
): StoryGenerationPrompt {
  const main = profile.mainPastLife;

  return {
    version: STORY_PROMPT_VERSION,
    system: STORY_SYSTEM_PROMPT,
    outputFormat: STORY_OUTPUT_FORMAT,
    qualityContext: createQualityContext(profile, contentType),
    user: `아래 프로필을 바탕으로 '${storyFocusByContentType[contentType]}'을 작성하라.

[대표 기록]
- 시대: ${main.period}
- 지역: ${main.region}
- 생활 공간: ${main.location}
- 전생에서의 성별: ${genderLabel(main.gender)}
- 직업: ${main.occupation}
- 사회적 위치: ${main.socialClass}
- 숨은 성향: ${main.hiddenNature}
- 핵심 정서: ${main.coreTheme.label}
- 핵심 정서 설명: ${main.coreTheme.description}
${createCanonBlock(profile, contentType)}

[현생 성향]
- 현생 입력 성별: ${genderLabel(profile.gender ?? main.gender)}
- 독립성 ${profile.traits.independence}, 관계성 ${profile.traits.relation}, 야망 ${profile.traits.ambition}
- 감수성 ${profile.traits.sensitivity}, 절제 ${profile.traits.restraint}, 그리움 ${profile.traits.longing}
- 위기에서 지키려는 가치 코드: ${profile.decisiveChoice}

[작성 조건]
- 전체 1,200~1,800자
- 도입 장면 1개와, 제목이 있는 3개 장으로 구성
- title에는 '전생의 사랑', '전생의 마지막 날' 같은 상품명은 반복하지 않고, 이 이야기만의 구체적인 부제만 작성
- 각 장은 서로 이어지는 사건을 담은 2개 문단으로 구성
- 독자가 자신이 주인공인 쉬운 단편소설을 읽는다고 느끼도록 처음부터 끝까지 주인공을 '당신'으로 부를 것
- 모든 서술문을 '~했습니다', '~였습니다' 계열의 존댓말로 통일할 것
- 사건과 사람을 처음 언급할 때 정체를 바로 설명하고, '그 사람', '그 일', '모든 기록', '대가'만으로 뜻을 대신하지 말 것
- '전신 기사의 동료였던 라시드'처럼 직책을 겹치지 말고 '전신국 동료 라시드'처럼 짧게 소개할 것
- 한 문장에는 하나의 핵심 행동만 담고, 긴 원인과 결과는 짧은 두 문장으로 나눌 것
- 직업은 시대적 정합성을 지키는 배경으로만 쓰고, 직업에서 파생된 소품과 행동을 반복하지 말 것
- 생애를 잇는 물건을 이름까지 그대로 한 번 쓰고, 이후에는 짧고 자연스럽게 부를 것
- 정본에 적힌 숫자·수량·색상·언어를 제목이나 본문에서 바꾸지 말 것
- 도입에서 물건을 가진 사람과 놓인 곳을 정한 뒤, 장면 사이 이동은 누가 누구에게 건넸는지 보여줄 것. 같은 물건을 설명 없이 두 번 건네지 말 것
- 정본과 모순되는 새 가족관계나 생애 사건을 만들지 말 것
- 설정에 없는 스승·연인·자녀를 새로 만들어 감정의 원인으로 쓰지 말 것
- 함께 떠났거나 곁에 남은 인물을 다음 장에서 이유 없이 오래 피한 사람으로 바꾸지 말 것. 관계가 달라지면 원인이 된 사건을 먼저 보여줄 것
- 주제가 마지막 날이 아니라면 말년이나 죽음으로 건너뛰지 말 것
- 숨은 성향과 현재 성향 점수가 인물의 욕망, 오해, 갈등 대처, 결정적 선택으로 드러나게 할 것
${dramaticArcByContentType[contentType]}
- 익숙하고 직관적인 한국어를 사용하고, 인물의 행동과 그 이유를 바로 이어서 설명
- 각 문단에는 사건의 원인과 결과가 드러나야 하며, 독자가 뜻을 추측해야 하는 상징적 표현은 피함
- 마지막 현생 해석은 가능성을 설명하는 말투로 작성
- 프로필에 없는 고유명사는 최대 2개만 만들고 끝까지 일관되게 사용

[성공 기준]
- 1장에서 주인공이 원하는 것과 그 이유가 보일 것
- 2장에서 갈등을 일으킨 사건과 상대의 행동이 구체적으로 드러날 것
- 3장에서 주인공이 스스로 고른 행동, 선택 뒤에 실제로 달라진 것, 남은 감정을 순서대로 보여줄 것
- 독자가 '누가, 왜, 무엇을 했고, 결국 어떻게 됐는지'를 한 번에 설명할 수 있을 것`,
  };
}

export function createWholeLifeGenerationPrompt(profile: SoulProfile): WholeLifeGenerationPrompt {
  const main = profile.mainPastLife;

  return {
    version: STORY_PROMPT_VERSION,
    system: STORY_SYSTEM_PROMPT,
    outputFormat: WHOLE_LIFE_OUTPUT_FORMAT,
    qualityContext: createQualityContext(profile, "whole_life"),
    user: `아래 대표 기록을 바탕으로 한 사람의 생애 전체를 시간순으로 작성하라.
이 글은 기존의 깊은 기록과 같은 한 사람, 같은 시대, 같은 지역, 같은 직업을 공유하는 정본(canon)이다.

[변경하면 안 되는 정본]
- 시대: ${main.period}
- 지역: ${main.region}
- 주된 생활 공간: ${main.location}
- 전생에서의 성별: ${genderLabel(main.gender)}
- 직업: ${main.occupation}
- 사회적 위치: ${main.socialClass}
- 숨은 성향: ${main.hiddenNature}
- 핵심 정서: ${main.coreTheme.label}
- 핵심 정서 설명: ${main.coreTheme.description}
- 위기에서 지키려는 가치 코드: ${profile.decisiveChoice}
${createCanonBlock(profile, "whole_life")}

[작성 조건]
- 전체 3,500~5,000자, 예상 읽기 시간 8~12분
- 유년기 → 청년기 → 중년기 → 말년기 순서의 정확히 4개 장
- 각 장은 다음 장의 선택과 관계에 원인이 되도록 연결
- 독자가 자신이 주인공인 쉬운 소설을 읽듯 이해할 수 있게, 사건과 사람을 처음 언급할 때 정체를 바로 설명할 것
- 모든 서술문을 '~했습니다', '~였습니다' 계열의 존댓말로 통일할 것
- 한 문장에는 하나의 핵심 행동만 담고, 긴 원인과 결과는 짧은 두 문장으로 나눌 것
- 직업은 생계와 시대를 보여주는 배경으로만 절제하고, 각 장을 같은 일과 소품으로 채우지 말 것
- 숨은 성향과 핵심 정서가 사람을 사랑하는 방식, 실수했을 때의 반응, 삶을 바꾸는 선택으로 드러나게 할 것
- 각 장에 인물의 욕망과 방해물을 두고, 중반 이후에는 비밀의 폭로, 관계의 파열, 누가 무엇을 잃었는지 분명한 사건 중 하나로 긴장을 높일 것
- 익숙하고 직관적인 한국어를 사용하고, 각 장에서 중요한 사건의 원인과 결과를 분명하게 설명
- 분위기를 위한 묘사 뒤에는 실제로 무슨 일이 일어났는지 구체적인 행동으로 이어서 작성
- 중년기에는 삶의 방향을 가른 선택을, 말년기에는 남긴 것과 미완의 감정을 포함
- 전환점의 첫 문장은 부당한 요구, 다음 문장은 물건에 남은 구체적 반박 근거다. 이 원인과 근거를 생략하거나 순서를 바꾸지 말 것
- 두 사건을 막연히 '충돌했다'고 압축하지 말 것. 상대가 요구한 행동과 물건이 증명한 사실을 각각 설명할 것
- 선택의 실제 결과에 적힌 직업, 수입, 관계의 변화를 그대로 보여주고 '큰 대가'나 '모든 것을 잃음'으로 바꾸지 말 것
- 깊은 기록은 이 생애에서 파생되는 장면별 외전이므로 시대·가족관계·직업·주요 사건을 서로 모순되게 만들지 않는다
- 정본과 모순되는 새 가족관계나 생애 사건을 만들지 말 것
- 프로필에 없는 고유명사는 최대 2개만 만들고 전체 생애에서 동일하게 사용
- 마지막 현생 해석은 단정이나 예언 대신 가능성을 설명하는 말투로 작성

[각 장의 성공 기준]
- 유년기: 원하는 것과 두려워하는 것이 생기는 첫 사건
- 청년기: 이전 장의 결과로 만난 사람과 처음 스스로 내린 선택
- 중년기: 숨겨진 사실이 드러나고 관계와 생계를 흔드는 새로운 문제, 그리고 되돌릴 수 없는 선택
- 말년기: 그 선택으로 실제 바뀐 관계와 삶, 마지막에도 남은 한 가지 마음`,
  };
}

function createCanonBlock(profile: SoulProfile, contentType: LockedContentType | "whole_life"): string {
  const canon = profile.lifeCanon;
  if (!canon) return "";
  return `
[한 생애의 정본]
- 직업을 갖게 된 경로: ${profile.mainPastLife.occupationPath}
- 시대 생활 배경: ${profile.mainPastLife.historicalContext}
- 중심 욕망: ${canon.centralDesire}
- 가장 큰 두려움: ${canon.centralFear}
- 핵심 관계: ${canon.keyRelationship}
- 생애를 잇는 물건: ${canon.sharedObject}
- 숨겨진 사실: ${canon.secret}
- 중년의 전환점: ${canon.turningPoint}
- 직접 내린 선택: ${canon.decisiveAction}
- 선택의 실제 결과: ${canon.consequence}
- 선택 뒤 남은 영향: ${canon.legacy}
${contentType === "last_day" || contentType === "whole_life" ? `- 마지막 중요한 날: ${canon.finalDay}` : ""}
- 시대에 맞는 어휘: ${canon.historicalTerms.join(", ")}`;
}

function createQualityContext(profile: SoulProfile, contentType: LockedContentType | "whole_life"): StoryQualityContext {
  const canon = profile.lifeCanon;
  if (!canon) return { requiredAnchors: [], forbiddenTerms: [] };
  const century = Number(profile.mainPastLife.period.match(/\d+/)?.[0] ?? 20);
  const candidates = ["자동차", "전화", "전기", "기차역", "철도", "전신", "사진", "영사기"];
  const historicalForbiddenTerms = century >= 20 ? [] : candidates.filter((term) => (
    !canon.historicalTerms.some((allowed) => allowed.includes(term) || term.includes(allowed))
  ));
  const topicForbiddenTerms = contentType === "last_day" || contentType === "whole_life"
    ? []
    : ["말년", "숨을 거두", "죽음"];
  return {
    requiredAnchors: [canon.sharedObject, canon.sharedObject.trim().split(/\s+/).at(-1) ?? canon.sharedObject],
    forbiddenTerms: [...historicalForbiddenTerms, ...topicForbiddenTerms],
  };
}

function genderLabel(gender: SoulProfile["gender"]): string {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "미상";
}
