import { describe, expect, it } from "vitest";

import { createStoryRepairPrompt, validateGeneratedStory, validateGeneratedWholeLife } from "./validateGeneratedStory";

const validStory = {
  title: "끝까지 놓지 못한 사람",
  opening: "해가 기울 무렵 오래된 시장의 문들이 하나씩 닫혔습니다. 당신은 작업대 위에 남은 편지를 정리하며 익숙한 발소리를 기다렸습니다.",
  chapters: [
    { title: "첫 번째 장", paragraphs: ["두 사람은 말보다 행동으로 마음을 확인했고, 작은 약속을 매일 지켰습니다.", "그러나 책임과 자유 사이의 선택은 예상보다 빨리 찾아왔습니다."] },
    { title: "두 번째 장", paragraphs: ["당신은 떠나고 싶다는 뜻을 처음으로 솔직하게 밝혔습니다.", "상대는 답을 재촉하지 않고 당신이 직접 선택할 시간을 주었습니다."] },
    { title: "세 번째 장", paragraphs: ["결국 서로 다른 길을 택했지만 그 선택은 두 사람을 배신한 일이 아니었습니다.", "당신은 사랑하면서도 자신의 삶을 지키는 법을 뒤늦게 이해했습니다."] },
  ],
  presentMeaning: "현재에도 일관된 행동을 보이는 사람에게 마음이 움직일 가능성이 있습니다. 관계 안에서 자신의 필요도 함께 말하는 연습이 도움이 될 수 있습니다.",
  readingTimeMinutes: 3,
};

describe("validateGeneratedStory", () => {
  it("accepts a complete and readable structured story", () => {
    expect(validateGeneratedStory(validStory)).toEqual({ success: true, data: validStory });
  });

  it("rejects known broken combinations and builds a compact repair prompt", () => {
    const broken = {
      ...validStory,
      opening: "기록원였던 당신에게 내 이름으로 선택하고 싶은 마음이라는 감정이 남았습니다.",
    };
    const result = validateGeneratedStory(broken);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues).toContain("부자연스러운 한국어 결합이 포함되어 있습니다.");

    const repair = createStoryRepairPrompt(broken, result.issues);
    expect(repair).toContain("내용과 JSON 구조는 유지");
    expect(repair).toContain("부자연스러운 한국어 결합");
    expect(repair.length).toBeLessThan(2500);
  });

  it("rejects an immersion-breaking fiction disclaimer inside the story", () => {
    const broken = {
      ...validStory,
      opening: "이 이야기는 점술적 사실이나 역사적 사실의 기록이 아니라, 한 사람의 선택을 바탕으로 엮은 허구의 생애담입니다.",
    };

    const result = validateGeneratedStory(broken);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues).toContain("본문 도입부에 몰입을 깨는 서비스 고지문이 포함되어 있습니다.");
  });

  it("accepts a complete chronological whole-life story", () => {
    const paragraph = "낡은 창문으로 들어온 아침빛 아래에서 당신은 어제의 선택이 오늘의 관계를 어떻게 바꾸었는지 돌아보았습니다. 작은 행동 하나가 다음 계절의 결심으로 이어졌고, 그 기억은 오래도록 삶의 방향을 붙들어 주었습니다. ".repeat(3);
    const wholeLife = {
      title: "한 사람의 생애",
      opening: "항구의 종이 울리던 아침, 한 아이가 오래된 여관의 다락방에서 처음으로 바깥세상의 소리를 기억했습니다.",
      chapters: ["유년기", "청년기", "중년기", "말년기"].map((stage, index) => ({
        stage,
        title: `${index + 1}번째 삶의 계절`,
        paragraphs: [paragraph, paragraph, paragraph],
      })),
      presentMeaning: "이 생애의 선택은 현재에도 책임과 자유 사이에서 자신의 기준을 찾으려는 경향으로 이어질 가능성이 있습니다.",
      readingTimeMinutes: 10,
    };

    expect(validateGeneratedWholeLife(wholeLife)).toEqual({ success: true, data: wholeLife });
  });

  it("rejects a whole-life story with missing or unordered life stages", () => {
    const broken = {
      title: "짧은 생애",
      opening: "항구의 종이 울리던 아침, 한 아이가 오래된 여관의 다락방에서 처음으로 바깥세상의 소리를 기억했습니다.",
      chapters: [
        { stage: "청년기", title: "첫 장", paragraphs: ["짧은 문단", "짧은 문단", "짧은 문단"] },
        { stage: "유년기", title: "둘째 장", paragraphs: ["짧은 문단", "짧은 문단", "짧은 문단"] },
      ],
      presentMeaning: "현재의 가능성을 살펴봅니다.",
      readingTimeMinutes: 4,
    };

    const result = validateGeneratedWholeLife(broken);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.issues).toContain("일생은 유년기, 청년기, 중년기, 말년기 순서의 정확히 4개 장이어야 합니다.");
    expect(result.issues).toContain("일생 본문의 분량이 3,000~5,500자 범위를 벗어났습니다.");
  });
});
