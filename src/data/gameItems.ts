import type { ImageSourcePropType } from "react-native";

export type GameItem = {
  id: string;
  image: ImageSourcePropType;
  isAI: boolean;
  tell: string;
};

// Bundle 8-12 images into assets/game/ (a mix of real photos and AI-generated
// images) and add one entry below per image. Metro requires static require()
// paths, so each image needs its own literal require() call — you can't loop
// over a list of filenames.
//
// Copy this per image once the files exist:
//
//   { id: "unique-id", image: require("../../assets/game/your-file.jpg"), isAI: true, tell: "One sentence on what gives it away." },
//
// isAI: true if the image is AI-generated, false if it's a real photo.
// GameScreen shows a friendly empty state until this array has items.
export const gameItems: GameItem[] = [];
