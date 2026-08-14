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
// the unified Inference Providers host. Requires a token with the
// "inference.serverless.write" (Inference Providers) permission specifically —
// a plain "read" fine-grained token 403s even though it can read the repo.
const HF_BASE_URL = "https://router.huggingface.co/hf-inference/models";
const PER_MODEL_TIMEOUT_MS = 6000;

// Candidate AI-detector models, tried in order, first successful response wins
// (not an ensemble). Live-tested 2026-08-15 against 2 real photos + 2 AI faces:
// Organika (3/4 correct, one false positive on a real photo at 99% confidence)
// beats dima806 (2/4, biased toward always saying fake) and umm-maybe (2/4,
// biased toward always saying human/real — misses StyleGAN2-style faces
// specifically). Order below is already best-first; a wrong call from Organika
// is expected free-tier detector noise, not a bug — it's exactly what the
// "estimate, not proof" disclaimer on the result screen exists for.
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
