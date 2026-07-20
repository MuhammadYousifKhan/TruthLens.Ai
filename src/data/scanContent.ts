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
