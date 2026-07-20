// Placeholder content — swap for Shahzaman's content deliverable (spec section 8)
// when it lands. Keep the {id, title, body, order} shape and lesson id values,
// since quizQuestions.ts and Firestore quizResults docs key off lesson id.

export type Lesson = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export const lessons: Lesson[] = [
  {
    id: "what-is-misinformation",
    title: "What is misinformation?",
    order: 1,
    body: "Misinformation is false or misleading information shared without the intent to deceive — someone believes it's true and passes it along. This is different from disinformation, which is spread deliberately to mislead people. Both can cause real harm: they shape opinions, influence elections, damage reputations, and even put people's safety at risk when, for example, false health advice goes viral.\n\nMisinformation spreads fastest on social media because posts are designed to be shared quickly, often before anyone has time to check if they're accurate. A striking headline or an emotional image can spread to thousands of people in minutes, long before a correction catches up — if it ever does.\n\nThe good news is that most misinformation shares a few warning signs: it triggers a strong emotional reaction, it lacks a credible source, and it's rarely questioned before being shared. Learning to notice these patterns is the first step toward not becoming part of the problem. The rest of this course will teach you specific techniques — like reverse image search and source checking — to verify content before you trust or share it.",
  },
  {
    id: "deepfakes",
    title: "Deepfakes",
    order: 2,
    body: "A deepfake is a video or audio clip that uses AI to make it look or sound like someone said or did something they never actually did. The technology works by training a model on real footage of a person's face or voice, then generating new, fabricated footage that mimics them convincingly.\n\nDeepfakes have been used for harmless entertainment, but also for serious harm — fake political speeches, fraudulent voice calls impersonating executives, and non-consensual fake videos of private individuals. As the technology improves, deepfakes are getting harder to spot with the naked eye.\n\nCommon signs of a deepfake video include unnatural blinking, blurry or warped edges around the face and hair, lighting that doesn't match the rest of the scene, and audio that's slightly out of sync with lip movements. Voice deepfakes may sound slightly robotic or have odd pacing.\n\nBecause detection tools aren't perfect, the safest habit is context-checking: does this video make sense given what you know about the person and situation? Is it being reported by any trustworthy news source? If a video seems designed to provoke outrage or shock, that's exactly when to slow down and verify before sharing.",
  },
  {
    id: "ai-generated-images",
    title: "AI-generated images",
    order: 3,
    body: "AI image generators can now create photorealistic pictures of people, places, and events that never existed. These tools are used for art and design, but they're increasingly used to create convincing fake photos — from fabricated disaster scenes to images of public figures in situations that never happened.\n\nAI-generated images often contain small but telling flaws: hands with too many or too few fingers, jewelry or text that looks warped, backgrounds with repeating or nonsensical patterns, and lighting that doesn't quite make sense across the image. Skin can also look unnaturally smooth or airbrushed.\n\nAs generators improve, these flaws are becoming rarer, so no single visual clue is reliable on its own. That's why TruthLens pairs its scan feature with a broader verification habit: check where the image first appeared, search for it elsewhere online, and see whether credible sources are reporting on it.\n\nRemember that a detector — including this app's — can be wrong in both directions: it can flag a real photo as suspicious, or miss a well-made fake. Treat every detection result as a starting point for further checking, not a final verdict.",
  },
  {
    id: "fake-news",
    title: "Fake news",
    order: 4,
    body: "Fake news is fabricated content presented as legitimate journalism, designed to look credible while spreading falsehoods. It ranges from entirely invented stories to real events that are twisted with misleading headlines, missing context, or cherry-picked facts.\n\nFake news sites often mimic the look of real news outlets, using similar logos, fonts, and layouts to seem trustworthy at a glance. Some even use URLs that are one letter off from a legitimate publication's domain, hoping readers won't notice.\n\nTo spot fake news, check the outlet's About page and track record — is it a known, established publication? Look for author names you can verify, and check whether other reputable outlets are reporting the same story. Be especially cautious of headlines written to provoke strong emotions like anger or fear, since these are shared far more often than calm, accurate reporting.\n\nAlso watch for stories with no named sources, no dates, or claims that seem too dramatic to be true. If a story would be huge news but you've never heard of the outlet reporting it, that's a signal to search for corroboration before you believe or share it.",
  },
  {
    id: "social-media-safety",
    title: "Social media safety",
    order: 5,
    body: "Social media platforms are built to maximize engagement, which means content that provokes strong reactions — outrage, fear, excitement — tends to spread the furthest, regardless of whether it's true. Understanding this design helps explain why misinformation so often goes viral faster than corrections do.\n\nProtecting yourself starts with a few habits: pause before resharing anything that makes you feel a strong emotion, check the account posting it (is it verified, established, and consistent, or new and anonymous?), and be skeptical of content with no clear source.\n\nIt's also worth reviewing your own privacy settings regularly — limiting who can see your posts, being cautious about sharing your location, and thinking twice before posting personal details that could be used against you.\n\nFinally, remember that what you share reflects on you and affects the people who see it. Before hitting share, ask: do I know this is true? Would I be comfortable if it turned out to be false? Building this pause into your routine is one of the most effective ways to slow the spread of misinformation across your own network.",
  },
  {
    id: "responsible-ai-use",
    title: "Responsible AI use",
    order: 6,
    body: "AI tools — for writing, image generation, and more — are powerful and increasingly part of everyday life. Using them responsibly means being transparent about when you've used AI, especially when the output could be mistaken for something real or original, like a photo or a quote.\n\nWhen creating content with AI, consider the impact: could this be used to mislead someone, even if that's not your intent? Labeling AI-generated content clearly helps prevent it from being mistaken for authentic material as it spreads beyond your control.\n\nResponsible use also means being a critical consumer of AI output. AI models can be confidently wrong — generating plausible-sounding but false information, or images with subtle inaccuracies. Always verify important facts from an AI tool against a reliable source before acting on them or sharing them further.\n\nFinally, think about consent and fairness: don't use AI to generate content that impersonates real people without their permission, and be mindful of how AI-generated content might affect people's trust in genuine media over time. Responsible use protects both the people around you and the broader information ecosystem everyone relies on.",
  },
];
