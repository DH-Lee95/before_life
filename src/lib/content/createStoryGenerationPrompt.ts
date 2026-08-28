import { STORY_OUTPUT_FORMAT, STORY_PROMPT_VERSION, STORY_SYSTEM_PROMPT, WHOLE_LIFE_OUTPUT_FORMAT, storyFocusByContentType } from "@/config/storyPrompt";
import type { LockedContentType, SoulProfile } from "@/types/soul";

export type StoryGenerationPrompt = {
  version: string;
  system: string;
  user: string;
  outputFormat: typeof STORY_OUTPUT_FORMAT;
};

export type WholeLifeGenerationPrompt = Omit<StoryGenerationPrompt, "outputFormat"> & {
  outputFormat: typeof WHOLE_LIFE_OUTPUT_FORMAT;
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
    user: `아래 프로필을 바탕으로 '${storyFocusByContentType[contentType]}'을 작성하라.

[대표 기록]
- 시대: ${main.period}
- 지역: ${main.region}
- 생활 공간: ${main.location}
- 직업: ${main.occupation}
- 사회적 위치: ${main.socialClass}
- 숨은 성향: ${main.hiddenNature}
- 핵심 정서: ${main.coreTheme.label}
- 핵심 정서 설명: ${main.coreTheme.description}

[현생 성향]
- 독립성 ${profile.traits.independence}, 관계성 ${profile.traits.relation}, 야망 ${profile.traits.ambition}
- 감수성 ${profile.traits.sensitivity}, 절제 ${profile.traits.restraint}, 그리움 ${profile.traits.longing}
- 위기에서 지키려는 가치 코드: ${profile.decisiveChoice}

[작성 조건]
- 전체 1,200~1,800자
- 도입 장면 1개와, 제목이 있는 3개 장으로 구성
- 각 장은 서로 이어지는 사건을 담은 2개 문단으로 구성
- 마지막 현생 해석은 가능성을 설명하는 말투로 작성
- 프로필에 없는 고유명사는 최대 2개만 만들고 끝까지 일관되게 사용`,
  };
}

export function createWholeLifeGenerationPrompt(profile: SoulProfile): WholeLifeGenerationPrompt {
  const main = profile.mainPastLife;

  return {
    version: STORY_PROMPT_VERSION,
    system: STORY_SYSTEM_PROMPT,
    outputFormat: WHOLE_LIFE_OUTPUT_FORMAT,
    user: `아래 대표 기록을 바탕으로 한 사람의 생애 전체를 시간순으로 작성하라.
이 글은 기존의 깊은 기록과 같은 한 사람, 같은 시대, 같은 지역, 같은 직업을 공유하는 정본(canon)이다.

[변경하면 안 되는 정본]
- 시대: ${main.period}
- 지역: ${main.region}
- 주된 생활 공간: ${main.location}
- 직업: ${main.occupation}
- 사회적 위치: ${main.socialClass}
- 숨은 성향: ${main.hiddenNature}
- 핵심 정서: ${main.coreTheme.label}
- 핵심 정서 설명: ${main.coreTheme.description}
- 위기에서 지키려는 가치 코드: ${profile.decisiveChoice}

[작성 조건]
- 전체 3,500~5,000자, 예상 읽기 시간 8~12분
- 유년기 → 청년기 → 중년기 → 말년기 순서의 정확히 4개 장
- 각 장은 다음 장의 선택과 관계에 원인이 되도록 연결
- 중년기에는 삶의 방향을 가른 선택을, 말년기에는 남긴 것과 미완의 감정을 포함
- 깊은 기록은 이 생애에서 파생되는 장면별 외전이므로 시대·가족관계·직업·주요 사건을 서로 모순되게 만들지 않는다
- 프로필에 없는 고유명사는 최대 2개만 만들고 전체 생애에서 동일하게 사용
- 마지막 현생 해석은 단정이나 예언 대신 가능성을 설명하는 말투로 작성`,
  };
}
