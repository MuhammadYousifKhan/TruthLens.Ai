import type { ImageSourcePropType } from "react-native";

export type GameItem = {
  id: string;
  image: ImageSourcePropType;
  isAI: boolean;
  tell: string;
  tellUr: string;
};

// isAI: true if the image is AI-generated, false if it's a real photo.
// GameScreen shows a friendly empty state until this array has items.
export const gameItems: GameItem[] = [
  {
    id: "ai-1",
    image: require("../../assets/game/ai-1.jpg"),
    isAI: true,
    tell: "Look over her shoulder — the pink object melts into her hair with no clean edge, and a stray blue-black blob sits on it that doesn't belong to anything.",
    tellUr: "اس کے کندھے کے پیچھے دیکھیں — گلابی چیز بغیر کسی واضح کنارے کے اس کے بالوں میں گھل مل گئی ہے، اور اس پر ایک نیلا سیاہ دھبہ ہے جو کسی چیز سے تعلق نہیں رکھتا۔",
  },
  {
    id: "real-1",
    image: require("../../assets/game/real-1.jpg"),
    isAI: false,
    tell: "The individual strands of hair, the texture of the knit scarf, and the falling snow all hold up under close inspection — real optics capture fine detail consistently.",
    tellUr: "بالوں کے الگ الگ ریشے، بنے ہوئے سکارف کی ساخت، اور گرتی برف — سب باریک بینی سے جانچنے پر درست نظر آتے ہیں۔ اصل کیمرہ باریک تفصیلات کو مستقل طور پر قید کرتا ہے۔",
  },
  {
    id: "ai-2",
    image: require("../../assets/game/ai-2.jpg"),
    isAI: true,
    tell: "The skin is airbrush-smooth with almost no pores or blemishes, and the background is a flat, featureless gradient — real photo backgrounds usually have some texture or depth.",
    tellUr: "جلد ایئر برش کی طرح ہموار ہے، اس میں مساموں یا داغ دھبوں کا نام و نشان نہیں، اور پس منظر بالکل ہموار اور بے خصوصیت ہے — اصل تصویروں کے پس منظر میں عام طور پر کچھ ساخت یا گہرائی ہوتی ہے۔",
  },
  {
    id: "real-2",
    image: require("../../assets/game/real-2.jpg"),
    isAI: false,
    tell: "The necklace, the fabric folds, and the stray flyaway hairs are all sharp and physically consistent with the light source — nothing warps or blends together.",
    tellUr: "ہار، کپڑے کی سلوٹیں، اور بکھرے ہوئے بال سب واضح ہیں اور روشنی کے منبع سے مطابقت رکھتے ہیں — کچھ بھی مسخ یا آپس میں گھل مل نہیں رہا۔",
  },
  {
    id: "ai-3",
    image: require("../../assets/game/ai-3.jpg"),
    isAI: true,
    tell: "The blurred background has no recognizable shapes at all, just soft color blobs — and the glasses' lens reflections don't quite match a single light source.",
    tellUr: "دھندلا پس منظر میں کوئی پہچانی جانے والی شکل نہیں، صرف نرم رنگ کے دھبے ہیں — اور عینک کے شیشوں کا عکس کسی ایک روشنی کے منبع سے میل نہیں کھاتا۔",
  },
  {
    id: "real-3",
    image: require("../../assets/game/real-3.jpg"),
    isAI: false,
    tell: "The sunglasses show a coherent reflection of the car window, and the leather jacket's creases fall the way real fabric actually folds.",
    tellUr: "دھوپ کی عینک میں گاڑی کی کھڑکی کا واضح عکس نظر آتا ہے، اور چمڑے کی جیکٹ کی سلوٹیں اسی طرح پڑی ہیں جیسے اصل کپڑا واقعی مڑتا ہے۔",
  },
  {
    id: "ai-4",
    image: require("../../assets/game/ai-4.jpg"),
    isAI: true,
    tell: "Follow the hairline on the right side — it fades into the blurred green background without a clean edge, like the GAN gave up rendering it.",
    tellUr: "دائیں جانب بالوں کی لکیر دیکھیں — یہ بغیر کسی واضح کنارے کے دھندلے سبز پس منظر میں گم ہو جاتی ہے، جیسے اسے مکمل طور پر نہیں بنایا گیا۔",
  },
  {
    id: "real-4",
    image: require("../../assets/game/real-4.jpg"),
    isAI: false,
    tell: "Every strand of curly hair is individually distinct against the plain background, and the teeth and gumline show natural, uneven shapes.",
    tellUr: "گھنگریالے بالوں کا ہر ریشہ سادہ پس منظر کے مقابلے میں الگ نظر آتا ہے، اور دانت اور مسوڑھے فطری اور غیر ہموار شکل رکھتے ہیں۔",
  },
  {
    id: "ai-5",
    image: require("../../assets/game/ai-5.jpg"),
    isAI: true,
    tell: "The scarf has a stray teal dot that isn't attached to anything, and the necklace cord just disappears behind the collar with no visible clasp or end.",
    tellUr: "سکارف پر ایک الگ تھلگ نیلگوں نقطہ ہے جو کسی چیز سے جڑا نہیں، اور ہار کی ڈوری کالر کے پیچھے بغیر کسی نظر آنے والی کلپ یا سرے کے غائب ہو جاتی ہے۔",
  },
  {
    id: "real-5",
    image: require("../../assets/game/real-5.jpg"),
    isAI: false,
    tell: "The patterned scarf's print stays coherent all the way around the folds, and individual eyelashes and skin pores are crisp and irregular.",
    tellUr: "دوپٹے کی چھپائی سلوٹوں کے باوجود پوری طرح واضح رہتی ہے، اور پلکیں اور جلد کے مسام صاف اور فطری طور پر بے ترتیب ہیں۔",
  },
  {
    id: "ai-6",
    image: require("../../assets/game/ai-6.jpg"),
    isAI: true,
    tell: "The skin looks airbrushed smooth despite the sharp focus everywhere else, and both ears are nearly perfect mirror images of each other — real faces are rarely that symmetric.",
    tellUr: "باقی ہر جگہ صاف فوکس کے باوجود جلد ایئر برش کی طرح ہموار لگتی ہے، اور دونوں کان تقریباً ایک دوسرے کا آئینہ ہیں — اصل چہرے شاذ و نادر ہی اتنے متوازن ہوتے ہیں۔",
  },
  {
    id: "real-6",
    image: require("../../assets/game/real-6.jpg"),
    isAI: false,
    tell: "Deep, irregular wrinkles, uneven stubble, and asymmetric skin texture — the kind of fine-grained detail generators still struggle to fake convincingly.",
    tellUr: "گہری، بے ترتیب جھریاں، غیر یکساں داڑھی، اور غیر متوازن جلد کی ساخت — ایسی باریک تفصیلات جنہیں اے آئی جنریٹرز ابھی تک قائل کن انداز میں نقل نہیں کر پاتے۔",
  },
];
