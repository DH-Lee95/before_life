import { lockedContentTypes } from "@/config/contentTypes";
import type { FreeResultContent, LockedContentType, SoulProfile, StoryNarrative } from "@/types/soul";
import { asIdentity, asPastRole, asRole, withAnd, withDirection, withObject, withSubject } from "./koreanGrammar";

export function createFreeResult(profile: SoulProfile): FreeResultContent {
  const record = profile.mainPastLife;

  return {
    title: `${profile.nickname || "당신"}님의 전생 서랍`,
    summary: `${record.period} ${record.region}. 당신에게 이어진 대표 기록은 ${record.location}에서 ${asRole(record.occupation)} 살아간 ${genderLabel(record.gender)}의 삶입니다.${record.historicalContext ? ` ${record.historicalContext}` : ""}`,
    natureSummary: profile.natureSummary,
    sections: {
      location: `${record.region}, ${record.location}`,
      occupation: record.occupation,
      atmosphere: `${asPastRole(record.hiddenNature)} ${record.coreTheme.description}`,
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
  const timeline = profile.lifeCanon?.timeline;

  return {
    id: "whole_life",
    title: "한 사람의 생애로 읽는 전생",
    description: `${record.historicalContext ? `${record.historicalContext} ` : ""}그 환경에서 ${asRole(record.occupation)} 살아온 한 사람의 선택을 시간순으로 보여줍니다.`,
    chapterPreviews: (timeline ?? [
      { stage: "유년기", event: `${record.location}에서 일을 배우게 된 계기` },
      { stage: "청년기", event: "삶을 함께 바꾼 사람과의 만남" },
      { stage: "중년기", event: "삶의 방향을 바꾼 선택과 결과" },
      { stage: "말년기", event: "마지막까지 지키고 남긴 것" },
    ]).map(({ stage, event }) => ({ stage, title: event })),
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
  if (profile.lifeCanon) return createCanonDeepDive(profile, contentType);
  const record = profile.mainPastLife;
  const sharedEnding = `${record.coreTheme.description} 이 마음은 정해진 운명이 아닙니다. 다만 당신이 어떤 순간을 쉽게 잊지 못하는지 보여주는 단서가 될 수 있습니다.`;

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
              `${record.socialClass}이라는 현실은 선택을 가볍게 허락하지 않았습니다. 먼 도시에서 함께 시작하자는 제안이 왔지만, 당신에게는 남겨둘 수 없는 가족과 책임이 있었습니다. 더 큰 문제는 그 사람이 이미 가족이 정한 혼인 약속을 숨겼다는 사실이었습니다. 사랑과 배신감이 동시에 밀려오자 당신은 어떤 말도 믿기 어려웠습니다.`,
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
        opening: `${record.period} ${record.region}의 ${record.location}. 밤새 열이 내리지 않았습니다. 의원은 오늘 밤을 넘기기 어렵다고 말했습니다. ${asPastRole(record.occupation)} 당신은 거짓 누명을 씌운 일꾼을 불러 달라고 했습니다. 죽기 전에 사과할 시간은 하루뿐이었습니다.`,
        chapters: [
          { title: "당신을 찾아온 일꾼", paragraphs: [`해가 중천에 올랐을 때 사라진 줄 알았던 일꾼이 문 앞에 섰습니다. 그는 용서하러 온 것이 아니라고 말했습니다. 왜 자신을 도둑으로 만들었는지 듣고 싶었을 뿐이었습니다.`, `당신은 답하기 전에 물 한 모금을 마셨습니다. 손이 떨려 잔이 이에 부딪혔습니다. 평생 피했던 질문에 답할 시간은 해가 지기 전까지였습니다.`] },
          { title: "한 사람을 희생시킨 거짓말", paragraphs: [`몇 해 전, 마을에 곡식을 납품하던 유력 상인이 썩은 밀을 정상 상품처럼 팔았습니다. 겨울 식량의 절반을 버리게 되자 상인은 당신에게 입을 다물라고 했습니다. 사실을 밝히면 그의 상점에서 일하던 열 가족도 바로 소득을 잃을 상황이었습니다.`, `당신은 창고를 지키던 젊은 일꾼이 곡식을 바꿔치기했다고 거짓말했습니다. 일꾼은 그날로 일자리와 집을 잃고 마을에서 쫓겨났습니다. 당신은 열 가족을 지켰다고 자신을 위로했지만, 죄 없는 한 사람의 삶을 거짓말로 바꿔 놓았다는 사실은 사라지지 않았습니다.`] },
          { title: "해가 지기 전의 선택", paragraphs: [`당신은 상인이 썩은 곡식을 넘긴 날짜와 자신이 한 거짓말을 편지에 적었습니다. 상인의 도장이 찍힌 거래 문서도 함께 꺼냈습니다. 일꾼은 이 증거를 공개할지 직접 고를 수 있게 됐습니다.`, `일꾼은 편지를 받았지만 용서하지는 않았습니다. 다만 자신의 누명을 벗겨낼 기회를 되찾았다고 말했습니다. 그는 해가 질 때까지 곁에 남았습니다. 당신의 마지막 하루는 용서받은 날이 아니라, 피했던 잘못을 처음으로 직접 책임진 날로 끝났습니다.`] },
        ],
        presentMeaning: `${sharedEnding} 지금도 불안할수록 감정을 먼저 말하기보다 주변의 일을 정리하고 다른 사람을 챙기는 모습으로 이어질 수 있습니다. 책임을 다한 뒤에야 쉬어도 된다고 생각하지 말고, 힘든 순간에 도움을 요청하는 것 역시 관계를 지키는 행동으로 받아들여 보세요.`,
        readingTimeMinutes: 4,
      };
    case "wealth_status":
      return {
        opening: `${record.period}, ${record.region}. ${record.location}에서 하루를 시작할 때 가장 먼저 들리는 것은 동전 소리보다 빚과 약속을 확인하는 목소리였습니다. ${asPastRole(record.occupation)} 당신에게 돈은 사치의 수단이 아니라 오늘 누구의 요구를 거절할 수 있는지를 정하는 현실적인 힘이었습니다.`,
        chapters: [
          { title: "겉으로 보이는 형편", paragraphs: [`당신의 위치는 ${record.socialClass}에 가까웠습니다. 굶을 만큼 궁핍하지는 않았지만, 한 번 돈을 잘못 쓰면 다음 달 재료비와 집세를 함께 내기 어려웠습니다. 그래서 옷과 식사는 아꼈어도 도구와 재료는 오래 쓸 수 있는 것을 골랐습니다.`, `사람들은 당신이 돈에 꼼꼼하다고 말했지만 실제로 지키고 싶었던 것은 선택권이었습니다. 원하지 않는 부탁에 기대지 않고, 마음이 없는 계약을 거절하고, 가까운 사람이 곤란할 때 하루쯤 문을 닫을 수 있는 여유를 원했습니다.`] },
          { title: "값을 매길 수 없는 거래", paragraphs: [`어느 겨울, 큰 수익을 보장하는 거래가 들어왔습니다. 조건은 좋았지만 오래 거래한 이웃 하나를 밀어내야 했습니다. 당신은 밤새 손익을 계산했고 숫자로는 이익이 분명했지만, 그 뒤 골목에서 마주칠 얼굴들까지 계산표에 넣을 수는 없었습니다.`, `결국 당신은 계약을 거절하고 대신 규모가 작은 공동 거래를 제안했습니다. 당장은 덜 벌었지만 여러 집이 함께 겨울을 넘겼습니다. 그 선택으로 당신은 부자가 되지는 못했어도 누구의 눈도 피하지 않고 문을 열 수 있는 신뢰를 얻었습니다.`] },
          { title: "당신이 남긴 재산", paragraphs: [`세월이 흐른 뒤 장부에는 큰 숫자가 남지 않았습니다. 대신 당신에게 배운 사람이 새 가게를 열었고, 어려울 때 물건을 외상으로 내어준 가족들이 다시 다른 누군가를 도왔습니다. 당신의 재산은 소유한 물건보다 관계 안에서 반복되는 방식으로 퍼졌습니다.`, `그럼에도 당신 마음 한편에는 더 넉넉했다면 지킬 수 있었을 것들에 대한 아쉬움이 남았습니다. 돈은 중요했지만, 돈으로 자신의 가치까지 증명하고 싶지는 않았습니다. 그 두 마음은 마지막까지 당신 안에서 부딪혔습니다.`] },
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
    case "family_bonds":
      return {
        opening: `${record.period}의 ${record.region}. 당신은 어린 시절 부모의 사랑을 말보다 책임으로 배웠습니다. 충분히 사랑받았지만 약한 모습을 보이면 가족이 흔들린다고 믿게 되었고, 그 믿음은 훗날 자신의 아이를 대하는 방식에도 깊이 남았습니다.`,
        chapters: [
          { title: "부모에게 배우지 못한 한마디", paragraphs: [`당신의 부모는 가족을 먹이고 지키는 일에는 누구보다 성실했지만, 미안하다거나 사랑한다는 말에는 서툴렀습니다. 당신은 칭찬을 받기 위해 먼저 어른스러워졌고, 도움이 필요할 때에도 폐를 끼치지 않으려 혼자 견뎠습니다.`, `결정적인 날, 부모는 당신의 뜻을 묻지 않고 가족에게 안전한 혼인을 정했습니다. 당신은 사랑받지 못해서가 아니라 자신의 마음이 가족의 계획보다 가볍게 취급됐다는 사실에 상처받았고, 끝내 집을 떠났습니다.`] },
          { title: "자식에게 되풀이된 보호", paragraphs: [`세월이 흘러 당신에게도 자식처럼 아끼는 아이가 생겼습니다. 당신은 자신이 받지 못한 자유를 주겠다고 다짐했지만, 아이가 위험한 길을 택하자 설명을 듣기 전에 막아섰습니다. 잃을까 두려운 마음이 통제로 바뀐 순간이었습니다.`, `아이는 당신에게 '나를 믿는 것이 아니라 잃지 않으려는 것'이라고 말하고 떠났습니다. 그 말을 듣는 순간 당신은 오래전 부모에게서 달아나던 자신의 얼굴을 떠올렸습니다. 끊으려 했던 방식이 사랑이라는 이름으로 반복되고 있었습니다.`] },
          { title: "뒤늦게 바꾼 가족의 방식", paragraphs: [`당신은 아이를 붙잡기보다 처음으로 자신의 두려움을 솔직하게 고백했습니다. 안전한 길을 강요한 이유가 아이의 부족함 때문이 아니라 또 한 번 가족을 잃을 자신이 없었기 때문이라고 말했습니다. 선택을 돌려주되 필요할 때 돌아올 자리는 남겨두겠다고 약속했습니다.`, `화해가 모든 상처를 없애지는 않았지만 가족의 규칙은 그날부터 달라졌습니다. 보호한다는 이유로 대신 결정하지 않고, 걱정되더라도 먼저 이유를 듣는 방식이 시작되었습니다. 당신이 남긴 것은 완벽한 가족이 아니라 반복을 알아차리고 멈춘 한 번의 선택이었습니다.`] },
        ],
        presentMeaning: `${sharedEnding} 현생에서도 부모에게는 인정받고 싶으면서 간섭에는 민감하고, 자녀나 가까운 가족에게는 걱정 때문에 대신 결정하려는 모습이 함께 나타날 수 있습니다. 특정 가족이 전생의 누군가라는 뜻은 아닙니다. 다만 사랑을 책임이나 통제로만 표현하지 않고 두려움을 직접 말할 때, 오래된 관계 패턴이 달라질 가능성이 있습니다.`,
        readingTimeMinutes: 4,
      };
    case "decisive_choice": {
      const protectedValue = getProtectedValue(profile.decisiveChoice);
      return {
        opening: `${record.period}의 ${record.region}. ${record.location}에서 평소와 다르지 않게 시작된 하루가 당신의 남은 삶을 갈랐습니다. ${asPastRole(record.occupation)} 당신 앞에는 안전한 자리를 지키는 길과 ${withObject(protectedValue)} 지키는 길이 놓였습니다. 둘을 동시에 가질 수 없다는 사실만은 분명했습니다.`,
        chapters: [
          { title: "피할 수 없었던 제안", paragraphs: [`마을에서 가장 큰 거래처의 주인은 당신에게 한 가지 사실을 모른 척하라고 했습니다. 그러면 지금의 자리와 수입을 보장하겠다고 약속했습니다. ${record.socialClass}이었던 당신에게 그 거래처를 잃는 일은 곧 생계를 잃는 일이었습니다.`, `당신은 밤새 작업장을 정리하며 무엇을 잃게 될지 적었습니다. 마지막 줄에는 '내가 끝까지 지킬 것: ${protectedValue}'라고 썼습니다. 그 문장을 보는 순간 이미 선택은 끝나 있었습니다.`] },
          { title: "모든 것을 바꾼 대답", paragraphs: [`다음 날 당신은 제안을 거절했습니다. 큰 목소리도 극적인 선언도 없었습니다. 다만 자신이 본 것과 책임질 수 있는 것만을 정확히 말했습니다. 그 대답으로 익숙한 자리를 잃었지만, 스스로를 속이지 않았다는 감각만은 남았습니다.`, `몇 사람은 등을 돌렸고 예상하지 못한 한 사람이 곁에 남았습니다. 당신은 그때 안전이란 아무것도 잃지 않는 상태가 아니라, 잃은 뒤에도 자기 기준으로 다시 시작할 수 있다는 믿음임을 배웠습니다.`] },
          { title: "선택 뒤에 남은 것", paragraphs: [`삶은 곧바로 나아지지 않았습니다. 더 작은 공간에서 다시 일을 시작했고 이전보다 오래 일해야 했습니다. 그러나 문을 열고 닫는 시간이 온전히 당신의 것이 되었고, 누구와 일할지도 스스로 정할 수 있었습니다.`, `그날의 선택은 승리나 희생으로만 남지 않았습니다. ${record.coreTheme.description} 그래서 이 기록은 무엇을 얻었는지가 아니라 모든 것이 흔들릴 때에도 무엇을 자기 것으로 남겼는지를 보여줍니다.`] },
        ],
        presentMeaning: `${sharedEnding} 지금도 중요한 갈림길에서 손익을 오래 따지다가도 마지막에는 ${withObject(protectedValue)} 지키는 쪽으로 움직일 가능성이 큽니다. 다만 모든 선택을 혼자 감당하지 말고, 무엇을 지키려는지 가까운 사람에게 먼저 설명해 보세요.`,
        readingTimeMinutes: 4,
      };
    }
  }
}

function createCanonDeepDive(
  profile: SoulProfile,
  contentType: (typeof lockedContentTypes)[number]["id"],
): StoryBody {
  const record = profile.mainPastLife;
  const canon = profile.lifeCanon;
  const context = `${record.period} ${record.region}, ${record.location}`;
  const objectName = canon.sharedObject.trim().split(/\s+/).at(-1) ?? canon.sharedObject;
  const dramaticHook = canon.dramaticHook || canon.turningPoint;
  const presentBridge = "이 이야기는 정해진 운명이 아니라, 지금도 반복되기 쉬운 선택의 방식을 비춰주는 장면입니다.";

  switch (contentType) {
    case "past_love":
      return {
        opening: `${context}. ${dramaticHook} ${record.workplaceDetail}에서 당신은 ${withObject(record.meetingReason)} 계기로 ${withObject(canon.keyRelationship)} 만났습니다. 두 사람 사이에는 곧 ${withSubject(canon.sharedObject)} 남았습니다.`,
        chapters: [
          { title: "두 사람이 서로를 알아본 일", paragraphs: [`${record.occupationPath} 그 사람은 당신이 일을 처리하는 속도보다 누구의 사정을 먼저 살피는지를 알아봤습니다. 당신도 그 사람이 결과보다 약속을 지키는 태도에 마음을 열었습니다.`, `두 사람은 ${withObject(objectName)} 함께 간직했습니다. 그것은 사랑의 증표이기 전에 서로에게 숨기지 않기로 한 첫 약속이었습니다.`] },
          { title: "숨긴 진실이 드러난 날", paragraphs: [`어느 날 ${withSubject(record.pressureSource)} 문제를 모른 척하면 지금의 자리와 수입을 지켜주겠다고 제안했습니다. 당신은 그 요구가 누군가에게 어떤 손해를 남기는지 확인했습니다.`, `당신이 문제를 공개하겠다고 하자 상대는 두 사람이 잃게 될 생활과 계획이 두렵다고 털어놓았습니다. 두 사람은 서로를 의심하는 대신, 각자가 감당할 수 있는 것과 없는 것을 처음으로 분명히 말했습니다.`] },
          { title: "사랑과 함께 지킨 선택", paragraphs: [`${canon.decisiveAction} 상대는 당신의 결정을 대신하지 않았습니다. 두 사람은 함께 남을지 서로 다른 길을 택할지 각자의 뜻으로 정했습니다.`, `${canon.consequence} ${withSubject(objectName)} 이루지 못한 사랑의 흔적이 아니라 서로의 선택권을 끝까지 지켜준 기억으로 남았습니다.`] },
        ],
        presentMeaning: `${presentBridge} 관계를 지키기 위해 자기 요구를 숨기기보다, 두려움과 원하는 것을 같은 문장 안에서 말할 때 당신다운 사랑이 오래갑니다.`, readingTimeMinutes: 4,
      };
    case "last_day":
      return {
        opening: `${context}. 몸을 일으키기 어려워진 어느 오후, 당신은 ${withObject(canon.sharedObject)} 곁에 두고 ${withObject(canon.keyRelationship)} 마지막으로 불러 달라는 전갈을 보냈습니다. ${dramaticHook} 그날의 선택이 누구를 지켰고 누구에게 상처를 남겼는지, 이번에는 숨김없이 말하기 위해서였습니다.`,
        chapters: [
          { title: "문 앞에 선 사람", paragraphs: [`그 사람은 해가 기울 무렵 문 앞에 섰습니다. 두 사람은 ${withObject(record.meetingReason)} 계기로 가까워졌습니다. 삶의 방향을 바꾼 사건 뒤에도 곁을 지켰지만, 서로의 상처를 충분히 말하지 못했습니다.`, `오래전 ${withAnd(record.pressureSource)} 맞선 뒤, 당신은 자신의 선택이 옳다고 믿었습니다. 하지만 그 결정이 두 사람의 생활에 줄 영향을 상대에게 충분히 말하지 않았습니다. 당신은 먼저 사과했습니다. 가장 두려웠던 일은 ${asIdentity(canon.centralFear)}.`] },
          { title: "물건에 남은 기억", paragraphs: [`당신이 ${withObject(objectName)} 살펴보자 두 사람이 처음 나눈 약속과 그 뒤 달라진 삶의 흔적이 함께 드러났습니다. 당신은 기억나는 일을 시간순으로 말하되, 자신에게 유리한 대목만 골라내지 않았습니다.`, `이 물건은 결백을 증명하는 유품이 아니었습니다. 당신은 상대가 당시의 기억과 뒤늦게 알게 된 사정을 스스로 판단할 수 있도록 ${withObject(objectName)} 건넸습니다.`] },
          { title: "대답 대신 남은 시간", paragraphs: [`상대는 그 자리에서 용서한다고 말하지 않았습니다. 대신 밤이 깊을 때까지 곁에 앉아, 자신이 겪은 일과 당신이 미처 알지 못했던 상처를 차례로 들려주었습니다.`, `다음 날 동틀 무렵 당신은 조용히 숨을 거두었습니다. ${withSubject(objectName)} 사과를 대신하지는 못했지만, 남은 사람이 자신의 기억을 의심하지 않게 하는 단서가 되었습니다. 그 뒤 상대는 당신이 남긴 뜻을 이어갔습니다.`] },
        ],
        presentMeaning: `${presentBridge} 마지막의 고백이 앞선 침묵을 지우지는 않습니다. 관계를 잃을까 두려운 순간일수록 설명과 사과를 미루지 않는 것이 남길 수 있는 상처를 줄입니다.`, readingTimeMinutes: 4,
      };
    case "wealth_status":
      return {
        opening: `${context}. ${dramaticHook} ${record.historicalContext} ${asPastRole(record.socialClass)} 당신에게 돈은 사치보다 원하지 않는 요구를 거절할 수 있는 선택권이었습니다.`,
        chapters: [
          { title: "당신이 실제로 가진 것", paragraphs: [`${record.occupationPath} 큰 수입을 얻지는 못했지만 ${withObject(record.signatureObject)} 맡길 만큼 마을 사람들의 신뢰를 얻었습니다.`, `당신이 원한 것은 부자가 되는 일보다 ${canon.centralDesire}이었습니다. 그래서 돈을 모을 때에도 누구와 어떤 약속을 지킬지를 함께 계산했습니다.`] },
          { title: "가장 비싼 제안", paragraphs: [`${withSubject(record.pressureSource)} 요구를 받아들이는 조건으로 여러 해 수입에 해당하는 돈을 제시했습니다. 당신은 ${canon.sharedObject}에서 누군가의 몫이 지워진 흔적을 확인했고, 돈을 받으면 그 사실을 공개할 수 없다는 점도 알았습니다.`, `제안을 거절하면 자리와 수입을 잃을 수 있었습니다. 당신은 당장의 손익보다 그 뒤에도 마주칠 사람들의 얼굴을 떠올렸습니다.`] },
          { title: "장부 밖에 남은 재산", paragraphs: [`${canon.decisiveAction} ${canon.consequence}`, `${canon.legacy} 당신에게 남은 가장 큰 재산은 큰 숫자가 아니라 다시 약속을 맡길 수 있다는 사람들의 신뢰였습니다.`] },
        ],
        presentMeaning: `${presentBridge} 액수만 정하기보다 그 돈으로 확보하고 싶은 시간과 거절할 수 있는 선택을 함께 적을 때 재정 목표가 당신의 실제 가치와 가까워집니다.`, readingTimeMinutes: 4,
      };
    case "decisive_choice":
      return {
        opening: `${context}. ${dramaticHook} ${record.pressureSource}의 요구와 당신이 직접 확인한 내용이 어긋났습니다. 당신은 ${withObject(canon.sharedObject)} 다시 살피며 어느 쪽의 손실을 감당할지 결정해야 했습니다.`,
        chapters: [
          { title: "거절하면 잃는 것", paragraphs: [`상대는 요구를 따르기만 하면 지금의 자리와 생활을 보장하겠다고 약속했습니다. ${asPastRole(record.socialClass)} 당신에게 그 제안은 가볍지 않았습니다.`, `거절하면 수입과 익숙한 자리를 잃을 수 있었습니다. 받아들이면 ${withObject(objectName)} 통해 확인한 사실을 감춰야 했고, 그 결과를 다른 사람들이 떠안게 됐습니다.`] },
          { title: "당신이 직접 고른 행동", paragraphs: [`${canon.decisiveAction} 당신은 누가 무엇을 잃게 되는지 차례로 설명하고, 자신이 감당할 몫부터 밝혔습니다.`, `${withSubject(canon.keyRelationship)} 결정을 대신하지는 않았습니다. 다만 당신이 두려움 때문에 사실을 줄이지 않도록 곁에서 질문했습니다.`] },
          { title: "선택 뒤의 실제 삶", paragraphs: [`${canon.consequence} 생활은 바로 편해지지 않았지만, 누구와 어떤 기준으로 일할지는 스스로 정할 수 있게 됐습니다.`, `${canon.legacy} 그 선택은 완벽한 승리가 아니었습니다. 그래도 흔들린 뒤 자기 기준으로 다시 시작할 수 있다는 기억은 남았습니다.`] },
        ],
        presentMeaning: `${presentBridge} 중요한 갈림길에서 무엇을 얻을지만큼 무엇을 잃어도 자신으로 남을 수 있는지를 살펴보면 후회가 적은 선택에 가까워집니다.`, readingTimeMinutes: 4,
      };
    case "karma_trace":
      return {
        opening: `${context}. ${dramaticHook} 당신은 ${record.workplaceDetail}에서 남들보다 먼저 문제를 알아차렸지만, ${canon.centralFear} 때문에 혼자 감당하기 시작했습니다.`,
        chapters: [
          { title: "필요한 사람이 되고 싶었던 마음", paragraphs: [`${record.occupationPath} 부탁받기 전에 움직이는 습관은 처음에는 신뢰를 만들었습니다. 그러나 주변 사람들은 당신이 늘 괜찮을 것이라고 믿게 되었습니다.`, `${withSubject(canon.keyRelationship)} 도움을 나누자고 했지만 당신은 약한 모습을 보이면 관계까지 잃을까 봐 거절했습니다.`] },
          { title: "침묵이 만든 오해", paragraphs: [`문제를 숨긴 채 ${withObject(canon.sharedObject)} 혼자 지키는 동안 알아주기를 바라는 마음이 쌓였습니다. 아무도 눈치채지 못하자 당신은 갑자기 모든 관계에서 멀어지고 싶어졌습니다.`, `숨긴 문제가 더는 감춰지지 않자, 말하지 않은 배려는 상대에게 참여할 기회를 주지 않았다는 사실이 드러났습니다.`] },
          { title: "반복을 멈춘 한 문장", paragraphs: [`${canon.decisiveAction} 처음으로 어렵다고 말하고 역할을 나누자, ${canon.keyRelationship}도 자신의 오해와 두려움을 설명했습니다.`, `${canon.consequence} ${canon.legacy}`] },
        ],
        presentMeaning: `${presentBridge} '왜 몰라주지?'라는 생각이 들 때 아직 말하지 않은 요구가 있는지 살펴보고, 지치기 전에 작은 도움부터 구하는 것이 반복을 바꾸는 시작이 됩니다.`, readingTimeMinutes: 4,
      };
    case "present_influence":
      return {
        opening: `${context}. ${dramaticHook} 당신의 하루는 ${record.workplaceDetail}의 리듬에 맞춰 움직였습니다. ${withObject(canon.sharedObject)} 다루며 익힌 판단 방식은 사람과 약속을 보는 기준에도 남았습니다.`,
        chapters: [
          { title: "몸이 먼저 기억한 기준", paragraphs: [`${record.occupationPath} 눈에 띄는 결과보다 반복해도 무너지지 않는 방식을 중요하게 여겼습니다.`, `${withSubject(objectName)} 여러 사람이 직접 확인한 내용을 함께 남긴 물건이었습니다. 당신은 완성된 결과보다 누가 무엇을 확인했는지가 분명한 과정을 더 믿었습니다.`] },
          { title: "사람을 믿는 방식", paragraphs: [`${withObject(canon.keyRelationship)} 처음 오래 이야기한 계기는 ${asIdentity(record.meetingReason)}. 그 사람은 모르는 일을 아는 척하지 않았고, 맡은 약속은 작은 것이라도 지켰습니다.`, `반대로 ${record.pressureSource}처럼 말과 행동이 다른 사람에게는 작은 어긋남도 오래 기억했습니다.`] },
          { title: "지금까지 이어진 습관", paragraphs: [`어느 날 당신이 확인한 사실과 ${record.pressureSource}의 주장이 어긋났습니다. 당신은 ${withObject(objectName)} 다시 살핀 뒤, 사실을 나누고 역할을 맡기는 편이 더 정확하다고 판단했습니다.`, `${canon.legacy} 지금도 마지막 세부를 책임지는 힘과 모든 것을 혼자 고치려는 부담이 함께 나타날 수 있습니다.`] },
        ],
        presentMeaning: `${presentBridge} 꾸준함과 세부를 보는 힘은 강점이지만, 상대가 고칠 의지가 없는 일까지 자신의 책임으로 받아들이지 않는 경계가 필요합니다.`, readingTimeMinutes: 4,
      };
    case "family_bonds":
      return {
        opening: `${context}. 어린 시절 당신은 가족의 사랑을 말보다 책임과 생계로 배웠습니다. ${dramaticHook} 그 사건을 겪은 뒤 보호와 통제의 경계를 보는 방식이 달라졌습니다.`,
        chapters: [
          { title: "부모에게 배운 보호", paragraphs: [`가족은 당신을 아꼈지만 위험을 막는다는 이유로 선택을 대신하곤 했습니다. 당신은 인정받기 위해 도움을 청하지 않는 아이가 되었습니다.`, `${withSubject(canon.sharedObject)} 처음으로 가족의 뜻과 다른 길을 택했을 때 가지고 나온 물건이었습니다.`] },
          { title: "사랑이라는 이름의 반복", paragraphs: [`세월이 흘러 당신은 어린 가족 또는 제자를 돌보게 됐습니다. 그 아이가 위험한 선택을 하자 이유를 듣기 전에 막아섰고, 자신이 받았던 보호를 그대로 반복했습니다.`, `${canon.turningPoint} 그 사건을 지켜본 아이는 보호받는 대신 믿어달라고 말했습니다. 그 문장에서 오래전 자신의 마음을 알아봤습니다.`] },
          { title: "가족의 규칙을 바꾼 날", paragraphs: [`${canon.decisiveAction} 두려움이 아이의 부족함 때문이 아니라 또 가족을 잃을까 무서웠기 때문이라고 설명했습니다.`, `${canon.consequence} ${canon.legacy}`] },
        ],
        presentMeaning: `${presentBridge} 가족을 걱정할 때 대신 결정하기보다 자신의 두려움을 먼저 말하고 선택을 돌려주는 방식이 오래된 보호의 패턴을 바꿀 수 있습니다.`, readingTimeMinutes: 4,
      };
  }
}

function createLockedPreview(profile: SoulProfile, contentType: LockedContentType): string {
  const record = profile.mainPastLife;
  const canon = profile.lifeCanon;
  if (canon) {
    const previews: Record<LockedContentType, string> = {
      past_love: `${record.meetingReason}에서 시작된 ${withAnd(canon.keyRelationship)}의 관계. ${canon.sharedObject}에 숨은 비밀이 두 사람의 선택을 바꿉니다.`,
      last_day: `${canon.finalDay} 용서보다 먼저 돌려줘야 했던 진실이 남아 있습니다.`,
      wealth_status: `${record.socialClass}의 삶에서 ${withSubject(record.pressureSource)} 제안한 거래와 실제로 지킨 재산을 보여줍니다.`,
      decisive_choice: `${canon.turningPoint} 당신이 직접 고른 행동과 그 뒤 실제로 잃고 얻은 것을 보여줍니다.`,
      karma_trace: `${canon.centralFear} 때문에 혼자 감당하던 방식이 어떤 관계를 멀어지게 했는지 살펴봅니다.`,
      present_influence: `${record.workplaceDetail}에서 익힌 기준이 지금의 취향과 신뢰 방식에 남아 있습니다.`,
      family_bonds: `부모에게 배운 보호가 가까운 아이에게 반복된 순간과 그 반복을 멈춘 선택을 보여줍니다.`,
    };
    return previews[contentType];
  }
  const previews: Record<LockedContentType, string> = {
    past_love: `당신은 ${record.location}에서 한 사람을 오래 기다렸습니다. 두 사람 사이에 남은 물건 하나가 끝내 하지 못한 말을 대신하고 있습니다.`,
    last_day: `마지막 아침, 당신은 떠날 준비보다 남겨질 사람들의 하루를 먼저 정리했습니다. 마지막 편지에 적힌 한 문장이 지금의 책임감과 이어집니다.`,
    wealth_status: `${record.socialClass}이었던 당신에게 돈은 사치보다 선택권에 가까웠습니다. 큰 이익을 포기하게 만든 단 한 번의 거래가 남아 있습니다.`,
    decisive_choice: `안전한 자리와 ${getProtectedValue(profile.decisiveChoice)} 사이에서 하나를 골라야 했습니다. 그날의 대답이 이후의 삶을 완전히 바꾸었습니다.`,
    karma_trace: `누군가의 빈자리를 대신한 날부터 당신은 부탁받기 전에 움직였습니다. 끝내 지키지 못한 약속은 지금도 반복되는 침묵의 시작점으로 남았습니다.`,
    present_influence: `${asPastRole(record.occupation)} 삶에서 익힌 습관이 지금의 취향과 관계를 고르는 기준에 남아 있습니다. 특히 오래된 것을 쉽게 버리지 못하는 이유가 드러납니다.`,
    family_bonds: `부모에게 받은 사랑과 상처가 자식을 지키는 방식으로 되풀이된 순간이 있습니다. 현생의 부모·자녀·가족 관계에서 비슷하게 나타날 수 있는 감정도 함께 살펴봅니다.`,
  };
  return previews[contentType];
}

function genderLabel(gender: SoulProfile["gender"]): string {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "미상";
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
