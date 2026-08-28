import { createHash } from "node:crypto";

export type SeededRandom = {
  next: () => number;
  integer: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
};

export function createSeededRandom(seed: string): SeededRandom {
  let counter = 0;

  function next(): number {
    const hash = createHash("sha256").update(`${seed}:${counter}`).digest("hex");
    counter += 1;
    return Number.parseInt(hash.slice(0, 12), 16) / 0xffffffffffff;
  }

  return {
    next,
    integer(min: number, max: number) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error("cannot pick from an empty array");
      }
      return items[this.integer(0, items.length - 1)] as T;
    },
  };
}
