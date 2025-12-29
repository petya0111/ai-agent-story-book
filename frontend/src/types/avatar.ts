export type Viseme =
  | "REST" | "A" | "E" | "O" | "FV" | "MBP" | "L" | "WQ" | "SCDG";

export interface EmotionConfig {
  brows: string;
  eyes: string;
  mouthBias?: string;
  rimLightBoost?: number;
  shadowBoost?: number;
}

export interface EmotionsManifest {
  emotions: Record<string, EmotionConfig>;
}

export interface LayeringManifest {
  renderOrder: string[];
}