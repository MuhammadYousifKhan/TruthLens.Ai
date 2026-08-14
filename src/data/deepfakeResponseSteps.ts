export type DeepfakeAction = { label: string; url: string };

export type DeepfakeStep = {
  title: string;
  body: string;
  actions?: DeepfakeAction[];
};

// Calm, supportive first-response guidance (spec v2 4.6) — framed around the
// "first five minutes" after finding a deepfake of someone you know, not
// alarmist. Order matters: stop the spread before anything else.
export const deepfakeResponseSteps: DeepfakeStep[] = [
  {
    title: "Stop",
    body: "Don't share, forward, or screenshot it further. Even sharing it to warn others can spread the harm and make it harder to get removed.",
  },
  {
    title: "Save evidence",
    body: "Take a screenshot and save the link or URL before it disappears. You'll need this if you report it or ask an adult for help.",
  },
  {
    title: "Report it",
    body: "Report the content directly to the platform it's on — most platforms remove non-consensual or deepfake content quickly once reported.",
    actions: [
      { label: "Instagram Help Center", url: "https://help.instagram.com/" },
      { label: "TikTok Safety Center", url: "https://www.tiktok.com/safety" },
      { label: "Facebook Help Center", url: "https://www.facebook.com/help/" },
      { label: "StopNCII.org (intimate images)", url: "https://stopncii.org/" },
    ],
  },
  {
    title: "Tell someone you trust",
    body: "A parent, teacher, school counselor, or other trusted adult can help you take the next steps. You don't have to handle this alone.",
  },
  {
    title: "It is not your fault",
    body: "Being targeted by a deepfake is not something you caused. The responsibility is entirely on the person who made or shared it.",
  },
];
