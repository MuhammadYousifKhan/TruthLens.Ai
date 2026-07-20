import {
  highProbabilityExplanations,
  highProbabilityFlags,
  lowProbabilityExplanations,
  lowProbabilityFlags,
} from "../data/scanContent";

export type ScanResult = {
  probability: number;
  confidence: number;
  flags: string[];
  explanation: string;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(pool: T[], count: number): T[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Mock detection engine (spec section 6.6): random probability/confidence,
// flags and explanation always drawn from the same pool so the result stays
// internally consistent — probability >= 55 uses the high-probability pool.
export function generateMockResult(): ScanResult {
  const probability = randomInt(10, 95);
  const confidence = randomInt(70, 95);
  const isHighProbability = probability >= 55;

  const flagPool = isHighProbability ? highProbabilityFlags : lowProbabilityFlags;
  const explanationPool = isHighProbability
    ? highProbabilityExplanations
    : lowProbabilityExplanations;

  const flags = pickRandom(flagPool, randomInt(2, 3));
  const explanation = explanationPool[randomInt(0, explanationPool.length - 1)];

  return { probability, confidence, flags, explanation };
}
