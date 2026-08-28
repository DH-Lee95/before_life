import { lockedContentTypes } from "@/config/contentTypes";
import type { FreeResultContent, SoulProfile } from "@/types/soul";

export function createFreeResult(profile: SoulProfile): FreeResultContent {
  const record = profile.mainPastLife;

  return {
    title: `${profile.nickname || "당신"}님의 전생 서랍`,
    summary: `${record.period}, ${record.region}. 당신에게 가장 선명하게 남아 있는 기록은 ${record.location}에서 시작됩니다.`,
    natureSummary: profile.natureSummary,
    sections: {
      location: `${record.region}, ${record.location}`,
      occupation: record.occupation,
      atmosphere: `${record.hiddenNature}이었습니다. 이 기록의 중심에는 '${record.emotionalCore}'이라는 감정이 남아 있습니다.`,
      faintRecords: profile.faintRecords.map((faintRecord, index) => ({
        label: `희미한 기록 ${index + 1}`,
        hint: `${faintRecord.period}의 ${faintRecord.region}에서 ${faintRecord.occupation}의 흔적이 아주 옅게 보입니다.`,
      })),
      lockedHints: lockedContentTypes.slice(0, 5).map((contentType) => ({
        id: contentType.id,
        title: contentType.title,
        hint: contentType.hint,
      })),
    },
  };
}
