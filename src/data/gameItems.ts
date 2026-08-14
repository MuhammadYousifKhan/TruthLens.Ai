import type { ImageSourcePropType } from "react-native";

export type GameItem = {
  id: string;
  image: ImageSourcePropType;
  isAI: boolean;
  tell: string;
};

// isAI: true if the image is AI-generated, false if it's a real photo.
// GameScreen shows a friendly empty state until this array has items.
export const gameItems: GameItem[] = [
  {
    id: "ai-1",
    image: require("../../assets/game/ai-1.jpg"),
    isAI: true,
    tell: "Look over her shoulder — the pink object melts into her hair with no clean edge, and a stray blue-black blob sits on it that doesn't belong to anything.",
  },
  {
    id: "real-1",
    image: require("../../assets/game/real-1.jpg"),
    isAI: false,
    tell: "The individual strands of hair, the texture of the knit scarf, and the falling snow all hold up under close inspection — real optics capture fine detail consistently.",
  },
  {
    id: "ai-2",
    image: require("../../assets/game/ai-2.jpg"),
    isAI: true,
    tell: "The skin is airbrush-smooth with almost no pores or blemishes, and the background is a flat, featureless gradient — real photo backgrounds usually have some texture or depth.",
  },
  {
    id: "real-2",
    image: require("../../assets/game/real-2.jpg"),
    isAI: false,
    tell: "The necklace, the fabric folds, and the stray flyaway hairs are all sharp and physically consistent with the light source — nothing warps or blends together.",
  },
  {
    id: "ai-3",
    image: require("../../assets/game/ai-3.jpg"),
    isAI: true,
    tell: "The blurred background has no recognizable shapes at all, just soft color blobs — and the glasses' lens reflections don't quite match a single light source.",
  },
  {
    id: "real-3",
    image: require("../../assets/game/real-3.jpg"),
    isAI: false,
    tell: "The sunglasses show a coherent reflection of the car window, and the leather jacket's creases fall the way real fabric actually folds.",
  },
  {
    id: "ai-4",
    image: require("../../assets/game/ai-4.jpg"),
    isAI: true,
    tell: "Follow the hairline on the right side — it fades into the blurred green background without a clean edge, like the GAN gave up rendering it.",
  },
  {
    id: "real-4",
    image: require("../../assets/game/real-4.jpg"),
    isAI: false,
    tell: "Every strand of curly hair is individually distinct against the plain background, and the teeth and gumline show natural, uneven shapes.",
  },
  {
    id: "ai-5",
    image: require("../../assets/game/ai-5.jpg"),
    isAI: true,
    tell: "The scarf has a stray teal dot that isn't attached to anything, and the necklace cord just disappears behind the collar with no visible clasp or end.",
  },
  {
    id: "real-5",
    image: require("../../assets/game/real-5.jpg"),
    isAI: false,
    tell: "The patterned scarf's print stays coherent all the way around the folds, and individual eyelashes and skin pores are crisp and irregular.",
  },
  {
    id: "ai-6",
    image: require("../../assets/game/ai-6.jpg"),
    isAI: true,
    tell: "The skin looks airbrushed smooth despite the sharp focus everywhere else, and both ears are nearly perfect mirror images of each other — real faces are rarely that symmetric.",
  },
  {
    id: "real-6",
    image: require("../../assets/game/real-6.jpg"),
    isAI: false,
    tell: "Deep, irregular wrinkles, uneven stubble, and asymmetric skin texture — the kind of fine-grained detail generators still struggle to fake convincingly.",
  },
];
