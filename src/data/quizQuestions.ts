// Placeholder content — swap for Shahzaman's content deliverable (spec section 8)
// when it lands. The spreadsheet format (lesson_id, question, option_a..d,
// correct_option) maps directly onto this shape.

export type QuizQuestion = {
  lessonId: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
};

export const quizQuestions: QuizQuestion[] = [
  // what-is-misinformation
  {
    lessonId: "what-is-misinformation",
    question: "What is misinformation?",
    options: [
      "False information shared without intent to deceive",
      "Information that is always shared on purpose to harm others",
      "Any opinion you disagree with",
      "A type of computer virus",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "what-is-misinformation",
    question: "What is the key difference between misinformation and disinformation?",
    options: [
      "There is no difference",
      "Disinformation is spread deliberately to mislead; misinformation is not",
      "Misinformation is always about politics",
      "Disinformation only appears in videos",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "what-is-misinformation",
    question: "Why does misinformation spread so quickly on social media?",
    options: [
      "Platforms are designed for slow, careful reading",
      "Only verified accounts can post",
      "Posts are designed to be shared quickly before facts can be checked",
      "It spreads at the same rate as corrections",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "what-is-misinformation",
    question: "Which of these is a common warning sign of misinformation?",
    options: [
      "A calm, neutral tone",
      "A clearly cited, credible source",
      "A boring headline",
      "A strong emotional reaction and no credible source",
    ],
    correctIndex: 3,
  },
  {
    lessonId: "what-is-misinformation",
    question: "What's the best first step before sharing a surprising claim?",
    options: [
      "Share it immediately so others can see it",
      "Pause and verify it before sharing",
      "Only share it if it has a lot of likes",
      "Ignore where it came from",
    ],
    correctIndex: 1,
  },

  // deepfakes
  {
    lessonId: "deepfakes",
    question: "What is a deepfake?",
    options: [
      "A video/audio clip that uses AI to fake what someone said or did",
      "A type of blurry photo",
      "A verified news report",
      "An old-fashioned photo edit",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "deepfakes",
    question: "Which of these is a common visual sign of a deepfake video?",
    options: [
      "Perfectly synced audio and lips",
      "Unnatural blinking or warped edges around the face",
      "Consistent lighting throughout",
      "A clear, credited source",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "deepfakes",
    question: "Deepfakes have been used for:",
    options: [
      "Only harmless entertainment",
      "Nothing, they don't really exist",
      "Fraud, fake political speeches, and non-consensual fake videos",
      "Only movie special effects",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "deepfakes",
    question: "A voice deepfake might sound:",
    options: [
      "Perfectly natural in every way",
      "Slightly robotic or oddly paced",
      "Always louder than normal",
      "Impossible to create",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "deepfakes",
    question: "What should you do if a shocking video seems designed to provoke outrage?",
    options: [
      "Share it right away",
      "Assume it's real because it's shocking",
      "Delete your account",
      "Slow down and check the context before trusting it",
    ],
    correctIndex: 3,
  },

  // ai-generated-images
  {
    lessonId: "ai-generated-images",
    question: "What is a common flaw in AI-generated images of people?",
    options: [
      "Perfect hands with the correct number of fingers",
      "Hands with too many or too few fingers",
      "Always black and white",
      "No background at all",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "ai-generated-images",
    question: "What should you do after TruthLens flags an image as suspicious?",
    options: [
      "Assume it's definitely fake and stop checking",
      "Treat it as a starting point and verify further",
      "Immediately delete the image",
      "Ignore the result completely",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "ai-generated-images",
    question: "Which detail often looks strange in AI-generated images?",
    options: [
      "Text or jewelry that looks warped",
      "Perfectly proportioned text",
      "Accurate reflections always",
      "Nothing ever looks wrong",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "ai-generated-images",
    question: "Can a detection tool be wrong?",
    options: [
      "No, detectors are always 100% accurate",
      "Only humans can make mistakes",
      "Yes, it can flag real photos as fake or miss fakes",
      "Detectors only work on video",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "ai-generated-images",
    question: "Besides visual clues, what else should you check for a suspicious image?",
    options: [
      "Nothing else matters",
      "Where it first appeared and whether credible sources report on it",
      "Only the file size",
      "The color palette only",
    ],
    correctIndex: 1,
  },

  // fake-news
  {
    lessonId: "fake-news",
    question: "What is fake news?",
    options: [
      "Fabricated content presented as legitimate journalism",
      "Any news you personally disagree with",
      "News that is always labeled as fake",
      "A genre of entertainment only",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "fake-news",
    question: "How do fake news sites often try to appear credible?",
    options: [
      "By using a completely different, unrelated design",
      "By clearly stating \"this is fake\" on the homepage",
      "By mimicking real outlets' logos, fonts, and layout",
      "By refusing to publish any images",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "fake-news",
    question: "What's a good way to check if an outlet is trustworthy?",
    options: [
      "Check its About page and track record",
      "Trust it if the headline is exciting",
      "Trust it if it has a lot of ads",
      "Never check, just trust every source",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "fake-news",
    question: "What kind of headlines should make you extra cautious?",
    options: [
      "Calm, factual headlines",
      "Headlines written to provoke strong emotions like anger or fear",
      "Headlines with a byline",
      "Headlines with a publish date",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "fake-news",
    question: "If a story seems huge but you've never heard of the outlet, you should:",
    options: [
      "Share it immediately since it's big news",
      "Assume it must be true",
      "Search for corroboration from other sources first",
      "Ignore the outlet name entirely",
    ],
    correctIndex: 2,
  },

  // social-media-safety
  {
    lessonId: "social-media-safety",
    question: "Why does emotionally provocative content spread fastest on social media?",
    options: [
      "Platforms are designed to maximize engagement",
      "It's always fact-checked first",
      "It's shared less than calm content",
      "Algorithms ignore emotional content",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "social-media-safety",
    question: "What's a good habit before resharing something that makes you angry or afraid?",
    options: [
      "Share it as fast as possible",
      "Pause and check the account and source first",
      "Never read the full post",
      "Assume all emotional posts are true",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "social-media-safety",
    question: "What should you regularly review for your own safety online?",
    options: [
      "Nothing, privacy settings don't matter",
      "Only your follower count",
      "Your privacy settings and what personal info you share",
      "Your screen time app icon",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "social-media-safety",
    question: "A new, anonymous account posting big news should be treated:",
    options: [
      "As fully trustworthy",
      "As more reliable than established outlets",
      "As definitely fake",
      "With extra caution until verified",
    ],
    correctIndex: 3,
  },
  {
    lessonId: "social-media-safety",
    question: "Before hitting share, a good question to ask yourself is:",
    options: [
      "\"Will this get a lot of likes?\"",
      "\"Do I know this is true, and am I comfortable if it's false?\"",
      "\"Is this the most dramatic post I've seen today?\"",
      "\"Did a stranger send this to me?\"",
    ],
    correctIndex: 1,
  },

  // responsible-ai-use
  {
    lessonId: "responsible-ai-use",
    question: "What does responsible AI use include?",
    options: [
      "Hiding that AI was used, even if misleading",
      "Being transparent about when AI-generated content is used",
      "Never questioning AI output",
      "Using AI only to impersonate others",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "responsible-ai-use",
    question: "Why should you verify facts from an AI tool?",
    options: [
      "AI is always 100% correct",
      "AI never generates text, only images",
      "AI can be confidently wrong or generate false information",
      "Verification is unnecessary",
    ],
    correctIndex: 2,
  },
  {
    lessonId: "responsible-ai-use",
    question: "What's an important consent issue with AI-generated content?",
    options: [
      "Impersonating real people without their permission is a concern",
      "Consent doesn't apply to AI content",
      "Only celebrities need to give consent",
      "AI content can never impersonate anyone",
    ],
    correctIndex: 0,
  },
  {
    lessonId: "responsible-ai-use",
    question: "Labeling AI-generated content helps prevent:",
    options: [
      "People from ever seeing it",
      "It from being mistaken for authentic material",
      "It from being shared at all",
      "Nothing, labeling has no effect",
    ],
    correctIndex: 1,
  },
  {
    lessonId: "responsible-ai-use",
    question: "Responsible AI use protects:",
    options: [
      "Only the person using the AI tool",
      "Nobody, it's just a technical detail",
      "Both the people around you and the broader information ecosystem",
      "Only large companies",
    ],
    correctIndex: 2,
  },
];
