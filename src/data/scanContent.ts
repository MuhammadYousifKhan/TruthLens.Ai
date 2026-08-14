// Placeholder content — swap for Shahzaman's content deliverable (spec section 8)
// when it lands. Format (flag pools + explanation pools) must stay the same.

export const highProbabilityFlags = [
  "Unnatural finger geometry detected",
  "Lighting on subject does not match background",
  "Inconsistent shadow directions across the image",
  "Skin texture appears unnaturally smooth",
  "Background elements show repeating or warped patterns",
  "Reflections in eyes do not match the scene",
];

export const lowProbabilityFlags = [
  "Natural lighting and shadow consistency",
  "Camera sensor noise pattern detected",
  "No visible generation artifacts found",
  "Metadata consistent with a standard camera capture",
];

export const highProbabilityExplanations = [
  "Several visual inconsistencies suggest this image may have been generated or heavily edited by AI. Don't share it until you've verified the source.",
  "The patterns detected are commonly seen in AI-generated imagery. Use the fact-checking guide before trusting this content.",
];

export const lowProbabilityExplanations = [
  "No strong signs of AI generation were found, but no detector is perfect — a quick source check is still a good habit.",
  "This image shows characteristics consistent with an authentic photo. Still worth a quick verification before sharing widely.",
];

export type Tell = { label: string; why: string };

// "What to look at" teaching block (spec v2 4.4) — framed as "look and judge
// for yourself", not "the AI says", so these stay independent of whatever
// detector actually ran.
export const highProbabilityTells: Tell[] = [
  { label: "Hands and fingers", why: "AI models often get finger count or hand proportions wrong." },
  { label: "Lighting vs. background", why: "Check whether shadows and light direction on the subject match the scene." },
  { label: "Skin and texture", why: "Unnaturally smooth skin or repeating background patterns are common tells." },
  { label: "Fine detail and text", why: "Warped text, jewelry, or small objects often break down under generation." },
];

export const lowProbabilityTells: Tell[] = [
  { label: "Natural imperfections", why: "Real photos usually have small imperfections — sensor noise, slight blur." },
  { label: "Consistent shadows", why: "Shadow direction and softness typically match a single real light source." },
  { label: "Coherent background", why: "Real backgrounds have consistent, non-repeating detail rather than warped patterns." },
];
