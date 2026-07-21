// Placeholder names/descriptions — Shahzaman may rename these (spec section 8).
// Keep the four ids stable since Firestore badge docs and unlock logic key off them.

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
};

export const badges: BadgeDefinition[] = [
  {
    id: "first_look",
    name: "First Look",
    description: "Complete your first scan",
  },
  {
    id: "fact_finder",
    name: "Fact Finder",
    description: "Pass any quiz with a score of 3/5 or higher",
  },
  {
    id: "truth_seeker",
    name: "Truth Seeker",
    description: "Complete the quiz for all six lessons",
  },
  {
    id: "sharp_eye",
    name: "Sharp Eye",
    description: "Score 100% on any quiz",
  },
];
