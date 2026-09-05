import type { ContentLens, LifeBlueprint, LockedContentType, SoulProfile, StoryNarrative } from "@/types/soul";
import { asIdentity, withSubject } from "./koreanGrammar";

type StoryBody = Omit<StoryNarrative, "title">;
type Scenes = { ordinary: string; relationship: string; trust: string; wealth: string; pressure: string; loss: string; kept: string; choice: string; later: string; final: string };

export const contentLensByType: Record<LockedContentType, ContentLens> = {
  past_love: "LOVE", wealth_status: "WEALTH_STATUS", decisive_choice: "DECISIVE_CHOICE",
  karma_trace: "UNFINISHED_PROMISE", last_day: "FINAL_DAY", present_influence: "PRESENT_TRACE", family_bonds: "PARENT_CHILD",
};

const sceneOverrides: Partial<Record<string, Partial<Scenes>>> = {
  "scholar-scotland-school": {
    ordinary: "해가 지면 아이들의 석판을 걷고 난롯불에 이탄을 한 장 더 얹었습니다. 학교 뒤 작은 방에서 자고 다음 날 다시 문을 여는 생활이면 충분했습니다.",
    relationship: "상속녀는 장날이 지난 오후마다 학교 문을 두드렸습니다. 처음에는 소작 계약서 한 장을 들고 왔고, 몇 달 뒤에는 글을 배우겠다는 핑계 없이도 난롯가에 앉아 있곤 했습니다.",
    trust: "모르는 문장이 나오면 답 대신 낱말의 뜻을 하나씩 적어 주었습니다. 상속녀가 불리한 조항을 처음 스스로 찾아낸 날, 두 사람은 식은 차를 앞에 두고 한참 웃었습니다.",
    wealth: "예배가 끝나자 토지 관리인이 학교 열쇠를 손바닥 위에 올려놓았습니다. 상속녀가 달아났다고 말하면 난롯가 방도 다음 겨울의 교사 자리도 그대로 두겠다고 했습니다.",
    pressure: "관리인은 조카와의 혼인 날짜가 적힌 종이를 접어 넣고 거짓 증언문을 내밀었습니다. 펜을 들지 않자 학교 문에 붙일 봉인까지 탁자 위에 꺼냈습니다.",
    loss: "그날 저녁 학교 문에는 밀랍 봉인이 붙었습니다. 다음 달부터 열쇠를 돌려줘야 했고, 침대와 책 두 상자를 학교 뒤편의 작은 살림방에서도 빼내야 했습니다.",
    kept: "상속녀는 교구 책임자 앞에서 혼인을 원하지 않는다고 자기 목소리로 말했습니다. 마을 사람들도 계약서를 남에게 맡기지 않고 한 줄씩 확인하기 시작했습니다.",
    choice: "폭풍우가 학교 창을 흔드는 밤, 상속녀가 젖은 망토 차림으로 문을 두드렸습니다. 사흘 뒤 원치 않는 혼인을 해야 한다는 말을 마친 그는 저택의 불빛이 꺼지기 전에 돌아가야 했습니다.",
    later: "학교를 잃은 뒤에는 마구간과 부엌의 빈 탁자가 교실이 됐습니다. 수업이 끝날 때마다 주민들은 계약 아래에 남의 표시 대신 자기 이름을 썼습니다.",
    final: "눈이 얇게 쌓인 오후, 문밖에서 오래된 열쇠가 부딪치는 소리가 났습니다. 백발이 된 상속녀가 옛 학교에 연 문서 읽는 방의 첫 열쇠를 들고 서 있었습니다.",
  },
  "artisan-venice-glass": {
    ordinary: "새벽마다 가족 공방의 큰 화로 옆에 작은 불씨를 따로 살렸습니다. 언젠가 공방주의 표식이 아니라 자기 이름을 새긴 잔을 올릴 생각이었습니다.",
    relationship: "직물상 집의 하녀가 보자기에 싼 깨진 잔을 품고 뒷문으로 찾아왔습니다. 값을 부르기 전에 조각을 빛에 비춰 보고, 흔적 없이 고칠 수 없다는 말부터 건넸습니다.",
    trust: "하녀는 꾸중을 피할 거짓말을 부탁하지 않았습니다. 그날 이후 주문품에 이상이 생기면 공방주보다 먼저 뒷문을 두드렸습니다.",
    wealth: "공방주는 혼례 주문의 선금 주머니를 이미 채권자에게 건넸습니다. 다시 살 모래값은 없었고, 작업대에는 낮게 울리는 푸른 잔이 상자마다 쌓였습니다.",
    pressure: "그는 금 간 잔 하나만 깨뜨린 뒤 나머지는 포장하라고 했습니다. 어린 견습생에게는 배합을 망쳤다고 인정하면 일자리를 남겨주겠다는 종이를 내밀었습니다.",
    loss: "검사가 끝난 날 화로 열쇠는 채권자의 손으로 넘어갔습니다. 오래 닦아 둔 작업대와 다음 주문에 새길 이름표도 가족 공방에 두고 나와야 했습니다.",
    kept: "견습생의 자백서는 찢어졌고 혼례상에는 다시 만든 잔만 올랐습니다. 이후 수리대에서는 완성품보다 시험용 잔을 먼저 깨뜨려 보았습니다.",
    choice: "식은 푸른 잔을 손톱으로 두드리자 맑은 소리 대신 짧고 낮은 울림이 났습니다. 빛에 기울여 보니 잔허리의 금이 실오라기처럼 길어지고 있었습니다.",
    later: "작은 수리대에는 늘 주문 수보다 잔이 하나 더 놓였습니다. 젊은 장인들이 아까워하면 그 하나에 먼저 뜨거운 물을 부었습니다.",
    final: "운하의 물빛이 천장에 흔들릴 때, 직물 가게의 주인이 된 옛 하녀가 푸른 잔 둘을 들고 왔습니다. 예전과 같은 색은 아니었지만 두 잔 모두 온전했습니다.",
  },
  "caretaker-jeju-clinic": {
    ordinary: "급료를 받는 날이면 쌀통 뒤 깡통에 지폐를 접어 넣었습니다. 동생들이 돌아오면 깔 요 두 채와 작은 밥상 하나를 살 돈이었습니다.",
    relationship: "폭풍 다음 날, 젊은 의사는 진흙길 한가운데서 젖은 지도를 뒤집어 보고 있었습니다. 약 상자를 자전거 뒤에 묶은 당신이 바닷바람을 등진 집부터 따라오라고 손짓했습니다.",
    trust: "왕진 뒤 어느 집에 무슨 약을 두었는지 묻자, 종이를 펼치기도 전에 복용 시간과 알레르기까지 답했습니다. 다음 달부터 의사는 처방전 묶음과 창고 열쇠를 함께 내밀었습니다.",
    wealth: "약 창고 문 앞에서 아이의 어머니가 구겨진 처방전을 두 손으로 폈습니다. 선반에는 약이 있었지만 새 명단에는 아이의 이름이 없었고, 책임자는 열쇠를 주머니에 넣었습니다.",
    pressure: "책임자는 빠진 이름을 입에 올리면 다음 달 식량표도 내주지 않겠다고 했습니다. 주민들이 고개를 숙이는 동안 비어 있는 약 상자 세 칸을 장부로 가렸습니다.",
    loss: "며칠 뒤 보건소 열쇠와 관사 배정표를 함께 돌려줘야 했습니다. 동생들을 재우려 비워 둔 방에는 다른 직원의 이삿짐이 들어왔고, 정기 급료도 그달로 끝났습니다.",
    kept: "주민들은 진료 쪽지를 들고 보건소 앞에 섰습니다. 명단에서 지워졌던 이름이 한 줄씩 다시 올라갔고, 아이의 어머니는 그날 저녁 해열제를 받아 돌아갔습니다.",
    choice: "창고지기는 처방전을 한 번 보고도 작은 창을 닫았습니다. 열이 오른 아이는 어머니 등에 업혀 있었고, 안쪽 선반에는 처방된 약병이 그대로 보였습니다.",
    later: "포구의 빈집 한쪽 벽에는 새 보건원들이 적은 이름이 빼곡했습니다. 명단에 없다는 말을 듣고 돌아선 사람이 없는지 매일 마지막에 물었습니다.",
    final: "늦은 오후, 해진 왕진 가방을 든 보건원이 방문을 열었습니다. 오래전 명단에서 지워졌던 아이가 이제 자신이 그 길을 돈다고 말했습니다.",
  },
};

function scenesFor(profile: SoulProfile, b: LifeBlueprint): Scenes {
  const t = b.timeline;
  const [loss, ...kept] = b.aftermath.split(". ");
  const base: Scenes = {
    ordinary: `일을 마치면 ${b.protagonistDesire}에 필요한 몫을 따로 남겨 두었습니다. 다음 날 쓸 돈과 건드리지 않을 돈을 작은 주머니 두 개에 나눴습니다.`,
    relationship: `${withSubject(b.keyRelationship)} ${profile.mainPastLife.location}에 찾아왔습니다. 처음 함께 붙든 일은 ${asIdentity(profile.mainPastLife.meetingReason)}.`,
    trust: b.trustReason,
    wealth: b.incitingIncident,
    pressure: b.firstEscalation,
    loss: `${loss.replace(/[.。]$/, "")}. 다음 달부터 머물 곳과 정기 수입을 새로 구해야 했습니다.`,
    kept: kept.length > 0 ? kept.join(". ") : `${withSubject(b.actualGainOrPreservedThing)} 그 자리에 있던 사람들이 직접 확인할 수 있었습니다.`,
    choice: b.incitingIncident,
    later: t.laterLife.summary,
    final: `${withSubject(b.keyRelationship)} 해 질 무렵 ${profile.mainPastLife.location}의 문을 두드렸습니다. 손에는 오래전 두 사람이 함께 보았던 ${withSubject(profile.mainPastLife.signatureObject)} 들려 있었습니다.`,
  };
  return { ...base, ...sceneOverrides[profile.lifeCanon.scenarioId] };
}

export function createBlueprintStory(profile: SoulProfile, contentType: LockedContentType): StoryBody | null {
  const b = profile.lifeCanon?.lifeBlueprint;
  const t = profile.lifeCanon?.lifeTimeline;
  if (!b || !t) return null;
  const s = scenesFor(profile, b);
  const context = `${profile.mainPastLife.period}, ${profile.mainPastLife.region}`;
  const bridge = "이 기록을 현재와 잇는다면, 정해진 운명보다 비슷한 순간에 어느 쪽을 먼저 살피는지 돌아보는 단서에 가깝습니다.";

  switch (contentLensByType[contentType]) {
    case "LOVE": return story(`${s.relationship} 그날 곁에는 ${withSubject(profile.mainPastLife.signatureObject)} 남았습니다. ${context}에서 두 사람이 처음 함께 버틴 시간이었습니다.`, [
      ["말없이 가까워진 시간", [s.trust, "위험한 부탁을 꺼낸 것도 그 뒤였습니다. 대답을 재촉하지 않고, 상대가 먼저 말을 마칠 때까지 익숙한 자리에서 기다렸습니다."]],
      ["끝내 건네지 못한 말", [`${profile.mainPastLife.pressureSource}. ${b.firstEscalation} 잃게 될 집과 일까지 말하면 상대가 물러설까 봐 둘 다 입을 다물었습니다.`, b.unspokenWords]],
      ["같은 자리에 없었던 두 사람", [s.loss, `${s.later} 오래 뒤에도 둘을 이어 준 것은 상대가 자기 목소리로 결정하도록 곁을 내준 순간이었습니다.`]],
    ], `${bridge} 가까운 사람을 염려할수록 원하는 말을 늦추는 모습으로 나타날 수 있습니다. 두려운 점과 바라는 점을 함께 말할 때 관계의 여지가 더 오래 남을 수 있습니다.`);
    case "WEALTH_STATUS": return story(`${s.wealth} ${context}, 가진 것을 지키려면 누군가의 몫을 못 본 척해야 하는 날이었습니다.`, [
      ["손에 쥐고 있던 생활", [s.ordinary, `${t.earlyAdult.summary} 매달 들어오는 돈과 잠글 수 있는 문이 있어 누구의 허락 없이 다음 날을 정할 수 있었습니다.`]],
      ["값을 매길 수 없던 요구", [s.pressure, `${b.antagonistInterestInProtagonist} 다른 사람의 침묵만으로는 끝나지 않았고 주인공의 손이나 이름이 꼭 필요했습니다.`]],
      ["다음 달 달라진 것", [s.loss, s.kept]],
    ], `${bridge} 돈을 많이 갖는 일보다 부당한 요구 앞에서 아니라고 말할 여유를 중요하게 여기는 경향으로 읽어볼 수 있습니다. 액수와 함께 실제 생활에서 바뀔 장면을 세어보는 편이 도움이 될 수 있습니다.`);
    case "DECISIVE_CHOICE": return story(`${s.choice} ${context}에서 선택은 이미 눈앞의 물건과 사람 사이에 놓여 있었습니다.`, [
      ["돌아서도 끝나지 않는 일", [b.noEasyExit, `${b.midpointRevelation} 문을 닫고 떠나더라도 그날의 책임은 더 약한 사람에게 넘어갈 뿐이었습니다.`]],
      ["손을 움직인 순간", [`${b.pointOfNoReturn} 이어 ${profile.lifeCanon.decisiveAction}`, b.climax]],
      ["선택 다음 날", [s.loss, s.kept]],
    ], `${bridge} 외면했을 때 그 비용을 대신 치를 사람이 누구인지 먼저 보는 선택으로 나타날 수 있습니다. 다만 모든 대가를 혼자 떠안을 필요까지 있다는 뜻은 아닙니다.`);
    case "UNFINISHED_PROMISE": return story(`${s.relationship} 두 사람의 약속은 바로 그 장면에서 시작됐습니다.`, [
      ["함께 그린 다음 계절", [s.trust, `입 밖에 낸 약속은 ${b.promise}이었습니다. 날짜와 장소까지 정해 막연한 다짐으로 두지 않았습니다.`]],
      ["비어 버린 약속의 자리", [`${b.pointOfNoReturn} ${b.promiseBreakReason}`, `${s.loss} 약속한 날에는 기다리던 사람도 돌아갈 장소도 전과 같지 않았습니다.`]],
      ["다른 손으로 이어진 일", [s.later, `${t.finalYears.summary} 둘이 상상한 모양은 아니었지만 지키려던 일은 다른 사람의 손을 거쳐 계속됐습니다.`]],
    ], `${bridge} 끝내지 못한 일보다 누구에게 충분히 설명하지 못했는지가 더 오래 남는 편일 수 있습니다. 늦어진 약속은 다른 모양으로도 다시 건넬 수 있습니다.`);
    case "FINAL_DAY": return story(`${s.final} 마지막 날은 오래전 싸움보다 같은 기억을 서로 다르게 꺼내 보는 시간으로 흘렀습니다.`, [
      ["평소와 다르지 않은 아침", [`아침에는 손에 익은 물건 하나를 정리했습니다. ${s.later}`, `${withSubject(profile.mainPastLife.signatureObject)} 결백을 증명할 물건이 아니었습니다. 닳은 자리를 더듬자 함께 걷던 날이 떠올랐습니다.`]],
      ["문턱을 넘은 마지막 손님", [`마지막으로 찾아온 이는 ${asIdentity(b.lastVisitor)}. 헤어진 뒤 어떤 하루를 살았는지부터 말했습니다.`, b.unspokenWords]],
      ["끝까지 남은 장면", [`마지막으로 떠오른 것은 ${b.finalMemory}이었습니다. 가장 시끄러운 충돌이 아니라 처음 행동을 믿었던 순간이었습니다.`, `${t.finalYears.summary} ${s.kept} 그 변화는 남은 사람들의 다음 행동 속에서 이어졌습니다.`]],
    ], `${bridge} 같은 기억을 다르게 품을 수 있음을 받아들이는 태도로 이어질 수 있습니다. 완전한 결론보다 미뤄 둔 한 문장을 일찍 건네는 편이 중요할 때도 있습니다.`);
    case "PRESENT_TRACE": return story(`${s.ordinary} 거창한 사건보다 이런 작은 순서가 그 삶을 더 오래 보여줍니다.`, [
      ["몸이 먼저 하던 일", [`${t.earlyAdult.summary} 부탁을 기다리기보다 빠진 이름과 모자란 몫부터 세었습니다.`, `${b.protagonistInvolvement} 책임이 관계와 맞닿으면 자기 일이 아니라며 물러서기 어려웠습니다.`]],
      ["버릇이 치른 값", [s.loss, `${s.kept} 지킨 것과 잃은 것은 같은 선택에서 생겼습니다.`]],
      ["지금 닮아 보일 수 있는 부분", [`현재의 ${strongestTraitLabel(profile)} 성향은 약속의 빈틈이나 빠진 사람을 먼저 알아채는 모습으로 나타날 수 있습니다.`, "보이는 문제를 모두 자기 몫으로 가져오기보다 다른 사람이 맡을 자리까지 남겨둘 수 있습니다."]],
    ], `${bridge} 이 흔적은 현재 성향을 단정하는 답이 아니라 반복되는 선택을 살펴보는 하나의 해석으로 연결해볼 수 있습니다.`);
    case "PARENT_CHILD": return story(`${t.youth.summary} 그때 익힌 보호는 말보다 먼저 몸을 움직이는 방식이었습니다.`, [
      ["어린 사람이 맡은 몫", [`어른의 걱정을 덜기 위해 필요한 말을 삼키고 먼저 할 일을 찾았습니다. 칭찬을 기다리기보다 물과 먹을 것을 세고, 뒤처진 사람의 손을 먼저 잡았습니다.`, `훗날 바란 것은 ${b.protagonistDesire}이었습니다. 어린 시절의 불안정한 하루를 다음 사람에게는 물려주고 싶지 않았습니다.`]],
      ["보호가 선택을 가릴 때", ["위험이 닥치면 이유를 묻기 전에 안전한 길부터 정해 주곤 했습니다. 상대가 침묵하자 그 모습이 오래전 어른들과 닮았음을 알아차렸습니다.", "그 뒤에는 위험과 치를 값을 설명하되 마지막 대답은 상대가 하도록 기다렸습니다. 문밖에서 돌아올 자리를 지켰습니다."]],
      ["다음 사람에게 남긴 규칙", [s.later, `${t.finalYears.summary} 남은 이들은 모르는 것을 묻고 자기 이름으로 결정하는 법을 이어갔습니다.`]],
    ], `${bridge} 가까운 사람을 걱정할수록 해결책부터 내놓는 모습으로 나타날 수 있습니다. 걱정하는 이유를 먼저 말하고 대답을 기다리는 일도 보호가 될 수 있습니다. 상대가 스스로 고른 뒤 돌아올 문을 열어 두는 방식도 함께 살펴볼 수 있습니다.`);
  }
}

function story(opening: string, chapters: Array<[string, string[]]>, presentMeaning: string): StoryBody {
  return {
    opening: secondPerson(opening),
    chapters: chapters.map(([title, paragraphs]) => ({ title, paragraphs: paragraphs.map(secondPerson) })),
    presentMeaning: secondPerson(presentMeaning),
    readingTimeMinutes: 4,
  };
}

function secondPerson(value: string): string {
  return value.replaceAll("주인공의", "당신의").replaceAll("주인공이", "당신이").replaceAll("주인공은", "당신은").replaceAll("주인공", "당신");
}

function strongestTraitLabel(profile: SoulProfile): string {
  const labels: Record<keyof SoulProfile["traits"], string> = { vitality: "활력", relation: "관계성", ambition: "야망", sensitivity: "감수성", independence: "독립성", restraint: "절제", longing: "그리움" };
  const [trait] = Object.entries(profile.traits).sort(([, a], [, b]) => b - a)[0] as [keyof SoulProfile["traits"], number];
  return labels[trait];
}
