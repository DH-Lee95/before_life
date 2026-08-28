import type { AnswerId, QuestionId } from "@/types/soul";

export type QuestionOption = {
  id: AnswerId;
  label: string;
};

export type Question = {
  id: QuestionId;
  title: string;
  helper: string;
  options: QuestionOption[];
};

export const questions: Question[] = [
  {
    id: "inner_response",
    title: "갑자기 하루가 비어 있다면 가장 먼저 무엇을 하나요?",
    helper: "계획보다 먼저 움직이는 마음의 방향을 살펴봅니다.",
    options: [
      { id: "a", label: "혼자 멀리 걸어본다" },
      { id: "b", label: "밀린 감정을 정리한다" },
      { id: "c", label: "누군가를 만나 이야기한다" },
      { id: "d", label: "새로운 일을 배워본다" },
      { id: "e", label: "아무것도 하지 않고 쉰다" },
    ],
  },
  {
    id: "decision_pattern",
    title: "중요한 선택 앞에서 가까운 쪽은?",
    helper: "중요한 순간에 무엇을 기준으로 삼는지 살펴봅니다.",
    options: [
      { id: "a", label: "마음이 먼저 아는 편" },
      { id: "b", label: "근거가 쌓여야 움직인다" },
      { id: "c", label: "사람과의 관계를 크게 본다" },
      { id: "d", label: "손해보다 가능성을 본다" },
      { id: "e", label: "끝까지 미루다 한 번에 정한다" },
    ],
  },
  {
    id: "emotional_trace",
    title: "이유 없이 오래 남는 감정은?",
    helper: "설명하기 어려워도 자주 되돌아오는 감정을 골라주세요.",
    options: [
      { id: "a", label: "그리움" },
      { id: "b", label: "억울함" },
      { id: "c", label: "책임감" },
      { id: "d", label: "기대감" },
      { id: "e", label: "허전함" },
    ],
  },
  {
    id: "conflict_style",
    title: "상처받았을 때 보통 어떻게 하나요?",
    helper: "마음이 다쳤을 때 자신을 지키는 방식을 살펴봅니다.",
    options: [
      { id: "a", label: "조용히 거리를 둔다" },
      { id: "b", label: "바로 확인해야 편하다" },
      { id: "c", label: "괜찮은 척 오래 버틴다" },
      { id: "d", label: "혼자 결론을 내린다" },
      { id: "e", label: "다른 일에 몰입한다" },
    ],
  },
  {
    id: "hidden_desire",
    title: "남에게 잘 말하지 않는 욕구에 가까운 것은?",
    helper: "가장 솔직한 마음과 가까운 것을 골라주세요.",
    options: [
      { id: "a", label: "완전히 자유롭고 싶다" },
      { id: "b", label: "한 사람에게 깊이 이해받고 싶다" },
      { id: "c", label: "조용히 인정받고 싶다" },
      { id: "d", label: "내 힘으로 크게 이뤄보고 싶다" },
      { id: "e", label: "아무에게도 흔들리지 않고 싶다" },
    ],
  },
  {
    id: "repeated_theme",
    title: "삶에서 자주 반복되는 주제는?",
    helper: "당신의 삶에서 되풀이되는 이야기의 중심을 살펴봅니다.",
    options: [
      { id: "a", label: "사랑과 타이밍" },
      { id: "b", label: "돈과 안정감" },
      { id: "c", label: "일과 인정" },
      { id: "d", label: "가족과 책임" },
      { id: "e", label: "떠남과 시작" },
      { id: "f", label: "배움과 집착" },
    ],
  },
  {
    id: "decisive_choice",
    title: "모든 것을 잃을 수 있는 순간, 무엇을 지키겠어요?",
    helper: "가장 위태로운 순간에도 놓지 못할 한 가지를 골라주세요.",
    options: [
      { id: "a", label: "사랑하는 사람" },
      { id: "b", label: "내가 옳다고 믿는 기준" },
      { id: "c", label: "가족과 공동체" },
      { id: "d", label: "쌓아온 자리와 명예" },
      { id: "e", label: "자유롭게 떠날 기회" },
    ],
  },
];
