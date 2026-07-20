// Placeholder content — swap for Shahzaman's content deliverable (spec section 8)
// when it lands. Keep the {title, body} shape and the five-step order.

export type GuideStep = {
  title: string;
  body: string;
};

export const guideSteps: GuideStep[] = [
  {
    title: "Check the source",
    body: "Look at who posted the content first. Is it a verified account, a known news outlet, or an anonymous page? Unverified or brand-new accounts are a red flag.",
  },
  {
    title: "Reverse image search",
    body: "Search the image on Google Images or TinEye to see where else it has appeared. If it shows up in unrelated stories or much older posts, treat it with suspicion.",
  },
  {
    title: "Verify the date",
    body: "Old photos and videos are often recirculated out of context to look like breaking news. Check when the content was first published before reacting to it.",
  },
  {
    title: "Cross-check with trusted sources",
    body: "See if established, reputable outlets are reporting the same thing. If only one obscure source has the story, wait for confirmation before trusting it.",
  },
  {
    title: "Decide whether to share",
    body: "If you're still unsure after checking the source, searching the image, and verifying the date, don't share it. When in doubt, sit it out.",
  },
];
