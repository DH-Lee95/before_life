const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const RIEUL_FINAL_INDEX = 8;

function finalConsonantIndex(value: string): number | null {
  const lastCharacter = value.trim().at(-1);
  if (!lastCharacter) return null;
  const code = lastCharacter.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return null;
  return (code - HANGUL_START) % 28;
}

export function asPastRole(role: string): string {
  const finalIndex = finalConsonantIndex(role);
  return `${role}${finalIndex && finalIndex > 0 ? "이었던" : "였던"}`;
}

export function asRole(role: string): string {
  const finalIndex = finalConsonantIndex(role);
  const particle = finalIndex && finalIndex !== RIEUL_FINAL_INDEX ? "으로서" : "로서";
  return `${role}${particle}`;
}

export function withDirection(value: string): string {
  const finalIndex = finalConsonantIndex(value);
  const particle = finalIndex && finalIndex !== RIEUL_FINAL_INDEX ? "으로" : "로";
  return `${value}${particle}`;
}

export function withObject(value: string): string {
  const finalIndex = finalConsonantIndex(value);
  return `${value}${finalIndex && finalIndex > 0 ? "을" : "를"}`;
}

export function withSubject(value: string): string {
  const finalIndex = finalConsonantIndex(value);
  return `${value}${finalIndex && finalIndex > 0 ? "이" : "가"}`;
}

export function withAnd(value: string): string {
  const finalIndex = finalConsonantIndex(value);
  return `${value}${finalIndex && finalIndex > 0 ? "과" : "와"}`;
}

export function asIdentity(value: string): string {
  const finalIndex = finalConsonantIndex(value);
  return `${value}${finalIndex && finalIndex > 0 ? "이었습니다" : "였습니다"}`;
}
