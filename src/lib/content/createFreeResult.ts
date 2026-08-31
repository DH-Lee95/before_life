import { lockedContentTypes } from "@/config/contentTypes";
import type { FreeResultContent, LockedContentType, SoulProfile, StoryNarrative } from "@/types/soul";
import { asPastRole, asRole, withDirection, withObject } from "./koreanGrammar";

export function createFreeResult(profile: SoulProfile): FreeResultContent {
  const record = profile.mainPastLife;

  return {
    title: `${profile.nickname || "당신"}님의 전생 서랍`,
    summary: `당신의 대표 전생은 ${record.period} ${record.region}의 ${record.location}에서 ${asRole(record.occupation)} 살아간 사람의 기록입니다.`,
    natureSummary: profile.natureSummary,
    sections: {
      location: `${record.region}, ${record.location}`,
      occupation: record.occupation,
      atmosphere: `${record.hiddenNature}이었습니다. ${record.coreTheme.description}`,
      love: createLove(profile),
      success: createSuccess(profile),
      compatibility: createCompatibility(profile),
      preference: profile.natureSummary.taste,
      wholeLife: createWholeLifePreview(profile),
      records: lockedContentTypes.map((contentType) => {
        if (contentType.id === profile.recommendedContentType) {
          return {
            id: contentType.id,
            title: contentType.shortTitle,
            isUnlocked: true as const,
            ...createDeepDive(profile, contentType.id),
          };
        }

        return {
          id: contentType.id,
          title: contentType.shortTitle,
          hint: contentType.hint,
          preview: createLockedPreview(profile, contentType.id),
          readingTimeMinutes: 4,
          isUnlocked: false as const,
        };
      }),
    },
  };
}

function createWholeLifePreview(profile: SoulProfile): FreeResultContent["sections"]["wholeLife"] {
  const record = profile.mainPastLife;

  return {
    id: "whole_life",
    title: "한 사람의 생애로 읽는 전생",
    description: `${record.period} ${record.region}에서 태어나 ${asRole(record.occupation)} 일하며 살아온 과정을 유년기부터 말년기까지 시간순으로 보여줍니다.`,
    chapterPreviews: [
      { stage: "유년기", title: `${record.location}의 풍경을 처음 기억한 날` },
      { stage: "청년기", title: "처음 자신의 일을 선택하게 된 계기" },
      { stage: "중년기", title: "삶의 방향을 바꾼 선택과 대가" },
      { stage: "말년기", title: "마지막까지 지키고 남긴 것" },
    ],
    readingTimeMinutes: 10,
    soulCost: 2,
    isUnlocked: false,
  };
}

type StoryBody = Omit<StoryNarrative, "title">;

function createDeepDive(
  profile: SoulProfile,
  contentType: (typeof lockedContentTypes)[number]["id"],
): StoryBody {
  const record = profile.mainPastLife;
  const sharedEnding = `${record.coreTheme.description} 이 정서는 완결된 운명이라기보다, 당신이 어떤 순간에 마음을 오래 붙드는지 보여주는 이야기의 단서입니다.`;

  switch (contentType) {
    case "past_love":
      return {
        opening: `${record.period}의 ${record.region}. 해가 기울면 ${record.location}에는 하루치 먼지와 젖은 나무 냄새가 함께 내려앉았습니다. ${asPastRole(record.occupation)} 당신은 문을 닫기 전, 늘 같은 시간에 골목 끝을 지나던 한 사람의 발소리를 기다리곤 했습니다.`,
        chapters: [
          {
            title: "서로를 알아본 방식",
            paragraphs: [
              `첫 만남에는 대단한 사건이 없었습니다. 그 사람은 망가진 물건 하나를 들고 들어왔고, 당신은 값을 묻기 전에 어디가 불편한지부터 살폈습니다. 며칠 뒤 그가 다시 찾아왔을 때에는 수리를 맡길 물건이 아니라 따뜻한 빵 두 조각이 손에 들려 있었습니다.`,
              `두 사람은 마음을 서둘러 이름 붙이지 않았습니다. 당신이 늦게까지 일한 날이면 그는 말없이 등불의 심지를 갈았고, 비가 오는 날이면 당신은 젖은 외투를 말릴 자리를 비워두었습니다. 말보다 반복되는 행동을 믿었던 두 사람에게 사랑은 고백보다 먼저 일상이 되었습니다.`,
            ],
          },
          {
            title: "함께 떠날 수 없었던 계절",
            paragraphs: [
              `${record.socialClass}이라는 현실은 선택을 가볍게 허락하지 않았습니다. 먼 도시에서 새로운 일을 시작하자는 제안이 왔지만, 당신에게는 남겨둘 수 없는 사람들과 끝내야 할 일이 있었습니다. 떠나고 싶은 마음과 책임 사이에서 당신은 매일 같은 장부의 숫자만 오래 바라보았습니다.`,
              `약속한 날, 당신은 정거장까지 갔지만 마지막 계단을 오르지 못했습니다. 그 사람은 이유를 재촉하지 않았고, 작은 열쇠 하나를 당신 손에 쥐여주며 언젠가 스스로의 선택을 할 수 있을 때 문을 열라고 했습니다. 그 침묵은 원망보다 깊어서 오랫동안 마음에 남았습니다.`,
            ],
          },
          {
            title: "끝내 보관된 약속",
            paragraphs: [
              `그 뒤로 두 사람의 삶은 다른 방향으로 흘렀지만, 당신은 작업대 가장 안쪽 서랍에 그 열쇠를 보관했습니다. 계절이 바뀔 때마다 버릴 물건을 골라내면서도 그것만은 손에서 놓지 못했습니다. 그것은 돌아오라는 약속보다, 한 번쯤 자신을 위해 선택해도 된다는 허락에 가까웠습니다.`,
              `당신은 사랑을 잃어서만 아팠던 것이 아닙니다. 사랑 앞에서도 자기 몫을 뒤로 미뤘다는 사실이 더 오래 남았습니다. 그래서 이 기록의 사랑은 이루어지지 못한 인연이라기보다, 누군가를 사랑하면서도 자기 삶을 함께 지켜야 한다는 조용한 교훈으로 닫힙니다.`,
            ],
          },
        ],
        presentMeaning: `${sharedEnding} 지금도 화려한 말보다 일관된 행동에 마음이 움직이고, 관계가 깊어질수록 자신의 필요를 뒤로 미루는 경향으로 나타날 수 있습니다. 이번에는 상대를 지키는 일과 자신의 선택을 말하는 일을 같은 사랑으로 여겨보세요.`,
        readingTimeMinutes: 4,
      };
    case "last_day":
      return {
        opening: `${record.period} ${record.region}의 아침은 유난히 조용했습니다. ${record.location}의 문을 연 당신은 몸이 평소와 다르다는 것을 알면서도 가장 먼저 창문을 열고, ${withDirection(record.occupation)} 살아온 시간을 함께한 도구들을 햇빛 아래 차례로 놓았습니다.`,
        chapters: [
          { title: "평소와 같은 아침", paragraphs: [`당신은 해야 할 일을 작은 종이에 적었습니다. 미처 돌려주지 못한 물건, 끝내지 못한 약속, 저녁 전에 만나야 할 사람의 이름이 가지런히 이어졌습니다. 두려움을 크게 말하는 대신 손이 닿는 순서대로 하루를 정돈하는 것이 당신다운 방식이었습니다.`, `오래 함께 일한 이에게는 가장 좋은 도구를 건넸고, 문 앞을 자주 서성이던 아이에게는 언젠가 필요할 장부 읽는 법을 알려주었습니다. 상대는 그것이 작별인 줄 몰랐지만 당신의 말이 평소보다 느리고 정확하다는 것은 알아차렸습니다.`] },
          { title: "남겨둘 것과 가져갈 것", paragraphs: [`오후가 되자 당신은 ${withDirection(record.socialClass)} 살아오며 모아온 계약서와 편지를 한 장씩 나누었습니다. 이름과 숫자 뒤에는 도움을 받았던 날과 갚지 못한 호의가 적혀 있었습니다. 재산보다 관계의 빚을 먼저 정리하려 했던 것입니다.`, `마지막으로 남은 것은 누구에게도 보내지 못한 짧은 편지였습니다. 당신은 그동안 감춰온 마음을 솔직히 적은 뒤 한참이 지나서야 봉투를 닫았습니다. 완벽한 문장보다 늦게라도 마음을 남기는 일이 중요하다는 것을 그날에야 받아들였습니다.`] },
          { title: "기록의 마지막 장면", paragraphs: [`해가 낮아졌을 때 당신은 가장 익숙한 자리에 앉아 골목의 소리를 들었습니다. 마차 바퀴와 문 닫는 소리, 저녁을 알리는 목소리가 평소처럼 이어졌습니다. 세상이 자신 없이도 계속된다는 사실은 서운함보다 이상한 안도감을 주었습니다.`, `기록은 자극적인 끝이 아니라 한 사람이 자기 자리를 조용히 넘겨주는 장면에서 멈춥니다. 당신이 마지막까지 붙든 것은 명예나 소유가 아니라, 남은 사람들이 내일도 무리 없이 하루를 시작할 수 있게 하는 질서였습니다.`] },
        ],
        presentMeaning: `${sharedEnding} 지금도 불안할수록 감정을 먼저 말하기보다 주변의 일을 정리하고 다른 사람을 챙기는 모습으로 이어질 수 있습니다. 책임을 다한 뒤에야 쉬어도 된다고 생각하지 말고, 힘든 순간에 도움을 요청하는 것 역시 관계를 지키는 행동으로 받아들여 보세요.`,
        readingTimeMinutes: 4,
      };
    case "wealth_status":
      return {
        opening: `${record.period}, ${record.region}. ${record.location}에서 하루를 시작할 때 가장 먼저 들리는 것은 동전 소리보다 빚과 약속을 확인하는 목소리였습니다. ${asPastRole(record.occupation)} 당신에게 돈은 사치의 수단이 아니라 오늘 누구의 요구를 거절할 수 있는지를 정하는 현실적인 힘이었습니다.`,
        chapters: [
          { title: "겉으로 보이는 형편", paragraphs: [`당신의 위치는 ${record.socialClass}에 가까웠습니다. 굶을 만큼 궁핍하지는 않았지만 한 번의 실수로 생활의 균형이 무너질 수 있었고, 그래서 옷과 식사는 검소해도 도구와 재료만큼은 가장 오래 쓸 것을 골랐습니다.`, `사람들은 당신이 돈에 꼼꼼하다고 말했지만 실제로 지키고 싶었던 것은 선택권이었습니다. 원하지 않는 부탁에 기대지 않고, 마음이 없는 계약을 거절하고, 가까운 사람이 곤란할 때 하루쯤 문을 닫을 수 있는 여유를 원했습니다.`] },
          { title: "값을 매길 수 없는 거래", paragraphs: [`어느 겨울, 큰 수익을 보장하는 거래가 들어왔습니다. 조건은 좋았지만 오래 거래한 이웃 하나를 밀어내야 했습니다. 당신은 밤새 손익을 계산했고 숫자로는 이익이 분명했지만, 그 뒤 골목에서 마주칠 얼굴들까지 계산표에 넣을 수는 없었습니다.`, `결국 당신은 계약을 거절하고 대신 규모가 작은 공동 거래를 제안했습니다. 당장은 덜 벌었지만 여러 집이 함께 겨울을 넘겼습니다. 그 선택으로 당신은 부자가 되지는 못했어도 누구의 눈도 피하지 않고 문을 열 수 있는 신뢰를 얻었습니다.`] },
          { title: "당신이 남긴 재산", paragraphs: [`세월이 흐른 뒤 장부에는 큰 숫자가 남지 않았습니다. 대신 당신에게 배운 사람이 새 가게를 열었고, 어려울 때 물건을 외상으로 내어준 가족들이 다시 다른 누군가를 도왔습니다. 당신의 재산은 소유한 물건보다 관계 안에서 반복되는 방식으로 퍼졌습니다.`, `그럼에도 당신 마음 한편에는 더 넉넉했다면 지킬 수 있었을 것들에 대한 아쉬움이 남았습니다. 돈을 가볍게 여기지 않으면서도 돈만으로 자신의 가치를 증명하지 않으려 했던 긴장이 이 기록의 핵심입니다.`] },
        ],
        presentMeaning: `${sharedEnding} 현재에도 소비 자체보다 독립성과 안전을 위해 돈을 모으고, 손해를 보더라도 신뢰를 깨는 선택을 불편해할 수 있습니다. 재정적 목표를 세울 때 액수만 정하기보다 그 돈으로 확보하고 싶은 시간과 거절할 수 있는 선택을 함께 적어보는 방식이 잘 맞습니다.`,
        readingTimeMinutes: 4,
      };
    case "karma_trace":
      return {
        opening: `${record.location}의 밤, 당신은 이미 끝낸 일을 몇 번이나 다시 확인했습니다. ${asRole(record.occupation)} 실수하지 않기 위해서라고 생각했지만, 사실 두려웠던 것은 일이 틀리는 것보다 누군가에게 실망을 주는 일이었습니다. ${record.coreTheme.description}`,
        chapters: [
          { title: "혼자 감당하기 시작한 날", paragraphs: [`누군가의 빈자리를 대신 맡았던 날부터 당신은 부탁받기 전에 움직이는 사람이 되었습니다. 처음에는 고맙다는 말을 들었고, 필요한 사람이 되었다는 안도도 있었습니다. 하지만 시간이 갈수록 주변은 당신이 언제나 괜찮을 것이라 믿기 시작했습니다.`, `당신은 힘들다는 말을 꺼내려다가도 상대의 사정을 먼저 떠올렸습니다. 참는 시간이 길어질수록 마음속에는 알아주기를 바라는 기대가 쌓였고, 아무도 눈치채지 못하면 갑자기 모든 관계에서 멀어지고 싶어졌습니다.`] },
          { title: "반복된 선택의 대가", paragraphs: [`결정적인 순간에도 당신은 도움을 청하지 않았습니다. 맡은 일을 지켜냈지만, 정작 소중한 사람과 나눌 시간과 솔직한 대화를 잃었습니다. 상대는 당신이 자신을 필요로 하지 않는다고 오해했고 당신은 상대가 자신의 노력을 모른다고 느꼈습니다.`, `두 사람 모두 마음이 없어서가 아니라 말하지 않은 채 추측했기 때문에 멀어졌습니다. ${asPastRole(record.hiddenNature)} 당신에게 침묵은 보호의 방식이었지만, 오래 이어지자 관계를 닫는 벽이 되었습니다.`] },
          { title: "끝나지 않은 감정의 정체", paragraphs: [`이 기록에 남은 업보는 벌이나 불운이 아닙니다. 필요한 사람이 되어야 사랑받을 수 있다는 믿음, 그리고 상대가 먼저 알아주어야 진짜 마음이라고 여긴 오래된 방식에 가깝습니다.`, `그 삶에서 하지 못한 선택은 거창하지 않았습니다. 지치기 전에 어렵다고 말하고, 상대에게 역할을 나누어 주고, 서운함이 원망으로 굳기 전에 작은 문장으로 꺼내는 일이었습니다. 반복은 같은 사건이 아니라 같은 침묵에서 시작되었습니다.`] },
        ],
        presentMeaning: `${sharedEnding} 비슷한 흐름이 느껴질 때에는 '왜 몰라주지?'라는 생각 뒤에 아직 말하지 않은 요구가 있는지 살펴보세요. 도움을 구하는 것은 무능함의 증거가 아니라 상대가 관계에 참여할 기회를 주는 일이며, 이것이 오래된 패턴을 바꾸는 가장 현실적인 선택일 수 있습니다.`,
        readingTimeMinutes: 4,
      };
    case "present_influence":
      return {
        opening: `${record.period}의 ${record.region}에서 당신의 하루는 ${record.location}의 빛과 소리에 맞춰 움직였습니다. 같은 시간에 문을 열고, 손때가 밴 도구를 정돈하고, 사람의 말보다 그가 물건을 다루는 태도를 살피던 습관은 아주 오래 반복되었습니다.`,
        chapters: [
          { title: "몸이 먼저 기억하는 취향", paragraphs: [`당신은 새것의 반짝임보다 오래 쓰인 물건의 흔적을 좋아했습니다. 모서리가 닳은 책상, 여러 번 수선한 천, 비 온 뒤 나무에서 올라오는 냄새처럼 시간이 보이는 것에서 안정감을 느꼈습니다.`, `그 취향은 단순한 복고풍이 아니라 물건이 쉽게 버려지지 않는 세계에 대한 믿음이었습니다. ${withDirection(record.occupation)} 살면서 손을 들이면 다시 쓸 수 있다는 사실을 매일 확인했고, 사람과 관계도 그렇게 오래 돌볼 수 있다고 여겼습니다.`] },
          { title: "사람을 믿는 기준", paragraphs: [`누군가를 판단할 때에는 첫인상보다 반복되는 행동을 살폈습니다. 바쁜 날에도 약속한 시간을 지키는지, 힘이 약한 사람에게 목소리가 달라지지 않는지, 빌린 물건을 어떤 상태로 돌려주는지가 당신에게는 긴 설명보다 정확했습니다.`, `그래서 가까워지는 속도는 느렸지만 한 번 신뢰하면 쉽게 포기하지 않았습니다. 문제는 이미 끝난 관계도 고칠 수 있다고 믿어 너무 오래 붙잡는 일이었습니다. 고칠 의지가 없는 상대의 몫까지 대신하려 할 때 당신의 다정함은 피로가 되었습니다.`] },
          { title: "일하는 방식에 남은 흔적", paragraphs: [`일에서는 눈에 띄는 시작보다 완성도를 높이는 마지막 손질에 강했습니다. 다른 사람이 놓친 작은 불편을 찾아내고, 복잡한 과정을 반복 가능한 순서로 정리하는 능력은 ${asPastRole(record.hiddenNature)} 삶과 닮아 있습니다.`, `반면 준비가 충분하지 않다고 느끼면 시작을 늦추거나, 결과가 기대에 미치지 못할까 봐 혼자 수정하는 시간이 길어질 수 있었습니다. 기록은 완벽함보다 누군가와 중간 과정을 나누는 것이 더 오래 가는 결과를 만든다고 알려줍니다.`] },
        ],
        presentMeaning: `${sharedEnding} 오래된 공간과 손으로 만든 물건에 끌리거나, 말보다 꾸준함을 신뢰하고, 마지막 디테일까지 책임지려는 성향으로 나타날 수 있습니다. 이 특징을 강점으로 쓰되 모든 것을 고쳐야 한다는 책임까지 떠안지 않는 경계를 함께 세우는 것이 중요합니다.`,
        readingTimeMinutes: 4,
      };
    case "decisive_choice": {
      const protectedValue = getProtectedValue(profile.decisiveChoice);
      return {
        opening: `${record.period}의 ${record.region}. ${record.location}에서 평소와 다르지 않게 시작된 하루가 당신의 남은 삶을 갈랐습니다. ${asPastRole(record.occupation)} 당신 앞에는 안전한 자리를 지키는 길과 ${withObject(protectedValue)} 지키는 길이 놓였습니다. 둘을 동시에 가질 수 없다는 사실만은 분명했습니다.`,
        chapters: [
          { title: "피할 수 없었던 제안", paragraphs: [`권한을 가진 사람은 당신에게 한 가지 사실을 모른 척하면 지금의 자리와 생활을 보장하겠다고 말했습니다. 누구도 당신을 비난하지 않을 만큼 그 제안은 현실적이었고, ${record.socialClass}이었던 당신에게 거절의 대가는 결코 작지 않았습니다.`, `당신은 밤새 작업장을 정리하며 무엇을 잃게 될지 적었습니다. 마지막 줄에는 '내가 끝까지 지킬 것: ${protectedValue}'라고 썼습니다. 그 문장을 보는 순간 이미 선택은 끝나 있었습니다.`] },
          { title: "모든 것을 바꾼 대답", paragraphs: [`다음 날 당신은 제안을 거절했습니다. 큰 목소리도 극적인 선언도 없었습니다. 다만 자신이 본 것과 책임질 수 있는 것만을 정확히 말했습니다. 그 대답으로 익숙한 자리를 잃었지만, 스스로를 속이지 않았다는 감각만은 남았습니다.`, `몇 사람은 등을 돌렸고 예상하지 못한 한 사람이 곁에 남았습니다. 당신은 그때 안전이란 아무것도 잃지 않는 상태가 아니라, 잃은 뒤에도 자기 기준으로 다시 시작할 수 있다는 믿음임을 배웠습니다.`] },
          { title: "선택 뒤에 남은 것", paragraphs: [`삶은 곧바로 나아지지 않았습니다. 더 작은 공간에서 다시 일을 시작했고 이전보다 오래 일해야 했습니다. 그러나 문을 열고 닫는 시간이 온전히 당신의 것이 되었고, 누구와 일할지도 스스로 정할 수 있었습니다.`, `그날의 선택은 승리나 희생으로만 남지 않았습니다. ${record.coreTheme.description} 그래서 이 기록은 무엇을 얻었는지가 아니라 모든 것이 흔들릴 때에도 무엇을 자기 것으로 남겼는지를 보여줍니다.`] },
        ],
        presentMeaning: `${sharedEnding} 지금도 중요한 갈림길에서 손익을 오래 따지다가도 마지막에는 ${withObject(protectedValue)} 지키는 쪽으로 움직일 가능성이 큽니다. 다만 모든 선택을 혼자 감당하지 말고, 무엇을 지키려는지 가까운 사람에게 먼저 설명해 보세요.`,
        readingTimeMinutes: 4,
      };
    }
  }
}

function createLockedPreview(profile: SoulProfile, contentType: LockedContentType): string {
  const record = profile.mainPastLife;
  const previews: Record<LockedContentType, string> = {
    past_love: `당신은 ${record.location}에서 한 사람을 오래 기다렸습니다. 두 사람 사이에 남은 물건 하나가 끝내 하지 못한 말을 대신하고 있습니다.`,
    last_day: `마지막 아침, 당신은 떠날 준비보다 남겨질 사람들의 하루를 먼저 정리했습니다. 마지막 편지에 적힌 한 문장이 지금의 책임감과 이어집니다.`,
    wealth_status: `${record.socialClass}이었던 당신에게 돈은 사치보다 선택권에 가까웠습니다. 큰 이익을 포기하게 만든 단 한 번의 거래가 남아 있습니다.`,
    decisive_choice: `안전한 자리와 ${getProtectedValue(profile.decisiveChoice)} 사이에서 하나를 골라야 했습니다. 그날의 대답이 이후의 삶을 완전히 바꾸었습니다.`,
    karma_trace: `누군가의 빈자리를 대신한 날부터 당신은 부탁받기 전에 움직였습니다. 끝내 지키지 못한 약속은 지금도 반복되는 침묵의 시작점으로 남았습니다.`,
    present_influence: `${asPastRole(record.occupation)} 삶에서 익힌 습관이 지금의 취향과 관계를 고르는 기준에 남아 있습니다. 특히 오래된 것을 쉽게 버리지 못하는 이유가 드러납니다.`,
  };
  return previews[contentType];
}

function getProtectedValue(answer: SoulProfile["decisiveChoice"]): string {
  return {
    a: "사랑하는 사람",
    b: "스스로 옳다고 믿는 기준",
    c: "가족과 공동체",
    d: "쌓아온 자리와 명예",
    e: "자유롭게 떠날 기회",
    f: "끝내 확인하고 싶은 진실",
  }[answer];
}

function createLove(profile: SoulProfile): string {
  if (profile.traits.relation >= 70) return "연애에서는 마음을 확인하는 대화와 꾸준한 표현이 중요합니다. 관계가 시작되면 상대의 일상을 세심하게 챙기지만, 혼자만 노력한다고 느끼는 순간 마음의 문을 빠르게 닫을 수 있습니다.";
  if (profile.traits.independence >= 70) return "연애에서도 자신의 리듬과 생활을 지키고 싶어 합니다. 서로의 세계를 존중하면서도 결정적인 순간에는 확실히 편이 되어주는 관계에서 가장 오래 사랑합니다.";
  return "연애는 천천히 시작할수록 깊어지는 편입니다. 말이 화려한 사람보다 작은 약속을 지키고 감정을 회피하지 않는 사람에게 신뢰가 쌓이며, 신뢰가 생기면 쉽게 흔들리지 않습니다.";
}

function createSuccess(profile: SoulProfile): string {
  if (profile.traits.ambition >= 70) return "성공의 핵심은 남의 속도를 따라가는 것이 아니라 자신의 기준을 결과로 증명하는 데 있습니다. 책임이 있는 자리, 이름을 걸고 완성하는 일에서 운이 크게 열립니다.";
  if (profile.traits.vitality >= 70) return "성공은 움직일 때 들어옵니다. 완벽한 준비를 기다리기보다 작은 실험을 빠르게 시작하고, 사람과 기회를 연결하는 역할을 맡을 때 흐름이 좋아집니다.";
  return "성공은 한 번의 큰 승부보다 신뢰를 자산처럼 쌓을 때 커집니다. 기록, 기획, 관리처럼 시간이 지날수록 실력이 드러나는 일에서 강점이 오래 갑니다.";
}

function createCompatibility(profile: SoulProfile): string {
  if (profile.traits.relation >= 65 && profile.traits.sensitivity >= 65) return "궁합이 좋은 인연은 감정을 숨기지 않되 상대를 몰아붙이지 않는 사람입니다. 당신의 섬세함을 약점으로 만들지 않고 안전하게 받아주는 관계가 좋은 인연으로 남습니다.";
  if (profile.traits.independence >= 65) return "궁합이 좋은 인연은 서로의 시간을 존중하면서 중요한 순간에는 같은 방향을 보는 사람입니다. 지나치게 간섭하는 관계보다 각자의 성장을 응원하는 인연이 맞습니다.";
  return "궁합이 좋은 인연은 말과 행동의 간격이 좁은 사람입니다. 처음부터 강하게 끌리는 인연보다 반복해서 마주칠수록 편안함이 커지는 관계가 오래 이어질 가능성이 큽니다.";
}
