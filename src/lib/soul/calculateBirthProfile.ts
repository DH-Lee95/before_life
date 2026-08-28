import { createSeededRandom } from "./seededRandom";
import type { BirthProfile } from "@/types/soul";

export function calculateBirthProfile(birthDate: string, birthTime: string): BirthProfile {
  const random = createSeededRandom(`birth:${birthDate}:${birthTime}`);
  const month = Number(birthDate.slice(5, 7));
  const day = Number(birthDate.slice(8, 10));

  return {
    vitality: clamp(35 + ((month * 7 + day) % 45) + random.integer(-8, 8)),
    relation: clamp(35 + ((month * 3 + day * 2) % 45) + random.integer(-8, 8)),
    ambition: clamp(35 + ((month * 5 + day * 4) % 45) + random.integer(-8, 8)),
    sensitivity: clamp(35 + ((month * 11 + day) % 45) + random.integer(-8, 8)),
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
