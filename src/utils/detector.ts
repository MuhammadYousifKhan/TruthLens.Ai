import {
  highProbabilityExplanations,
  highProbabilityFlags,
  highProbabilityTells,
  lowProbabilityExplanations,
  lowProbabilityFlags,
  lowProbabilityTells,
  type Tell,
} from "../data/scanContent";
import { generateMockResult, pickRandom, randomInt, type ScanResult } from "./mockAnalyzer";

export type DetectedResult = ScanResult & { tells: Tell[] };

type CandidateModel = { id: string; isAiLabel: (label: string) => boolean };

const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN;

// hf-inference is HF's legacy serverless "Inference API", now routed through
// the unified Inference Providers host. Not independently load-tested yet —
// confirm on first real device run (see AnalyzingScreen). If this 404s,
// the legacy host `https://api-inference.huggingface.co/models/{id}` is the
// fallback to try.
const HF_BASE_URL = "https://router.huggingface.co/hf-inference/models";
const PER_MODEL_TIMEOUT_MS = 6000;

// Candidate AI-detector models, tried in order. None are confirmed "warm" on
// the free tier yet — data-driven on purpose so the working model (and its
// exact label strings) can be swapped in after live testing without touching
// any other code. isAiLabel is a loose substring match as a safety net until
// exact labels are confirmed.
const CANDIDATE_MODELS: CandidateModel[] = [
  { id: "Organika/sdxl-detector", isAiLabel: (l) => /artificial|ai|fake|generated|synthetic/i.test(l) },
  { id: "dima806/ai_vs_real_image_detection", isAiLabel: (l) => /\bai\b|fake|artificial|generated/i.test(l) },
  { id: "umm-maybe/AI-image-detector", isAiLabel: (l) => /artificial|ai/i.test(l) },
];

type ModelOutcome = { probability: number; modelLabel: string };

async function callModel(model: CandidateModel, blob: Blob): Promise<ModelOutcome | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);
  try {
    const res = await fetch(`${HF_BASE_URL}/${model.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": blob.type || "image/jpeg",
      },
      body: blob,
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const predictions: { label: string; score: number }[] = await res.json();
    const hit = Array.isArray(predictions) ? predictions.find((p) => model.isAiLabel(p.label)) : null;
    if (!hit) return null;

    return { probability: Math.round(hit.score * 100), modelLabel: `${model.id} (${hit.label})` };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Distance-from-50% as a proxy for how decisive the call was, scaled to read
// consistently with the mock's existing 70-95 range. A heuristic, not a real
// statistical confidence.
function deriveConfidence(probability: number): number {
  return Math.min(97, 60 + Math.round(Math.abs(probability - 50) * 0.7));
}

function pickTells(probability: number): Tell[] {
  return pickRandom(probability >= 55 ? highProbabilityTells : lowProbabilityTells, randomInt(2, 3));
}

function pickBandContent(probability: number) {
  const isHigh = probability >= 55;
  const flagPool = isHigh ? highProbabilityFlags : lowProbabilityFlags;
  const explanationPool = isHigh ? highProbabilityExplanations : lowProbabilityExplanations;
  return {
    flags: pickRandom(flagPool, randomInt(2, 3)),
    explanation: explanationPool[randomInt(0, explanationPool.length - 1)],
  };
}

// Tries real HF detector models in order; on any failure (no token, network,
// timeout, cold model, unrecognized labels) falls back to the mock generator.
// Never throws — the scan flow can never break on this step.
export async function analyzeImage(localUri: string): Promise<DetectedResult> {
  try {
    if (!HF_TOKEN) throw new Error("EXPO_PUBLIC_HF_TOKEN not configured");
    const blob = await (await fetch(localUri)).blob();

    for (const model of CANDIDATE_MODELS) {
      const outcome = await callModel(model, blob);
      if (outcome) {
        const { flags, explanation } = pickBandContent(outcome.probability);
        return {
          probability: outcome.probability,
          confidence: deriveConfidence(outcome.probability),
          flags,
          explanation,
          tells: pickTells(outcome.probability),
          source: "model",
          modelLabel: outcome.modelLabel,
        };
      }
    }
    throw new Error("All candidate models unavailable or returned unrecognized labels");
  } catch (err) {
    if (__DEV__) console.warn("[detector] falling back to offline estimate:", err);
    const mock = generateMockResult();
    return { ...mock, tells: pickTells(mock.probability), source: "offline" };
  }
}
