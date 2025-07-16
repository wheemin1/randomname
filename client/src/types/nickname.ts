export interface NicknameResult {
  nickname: string;
  status: "free" | "busy" | "loading" | "error";
  lastChecked: Date;
  length: number;
}

export interface GenerationOptions {
  length: number;
  count: number;
  useRealWords: boolean;
  wordType: "korean" | "pure" | "english";
  excludeFinalConsonants: boolean;
  specificInitial: string;
}

export interface SavedNickname {
  nickname: string;
  status: "free" | "busy" | "loading" | "error";
  savedAt: Date;
  length: number;
}

export interface GeneratedNickname {
  nickname: string;
  status: "free" | "busy" | "loading" | "error";
  type: "random" | "korean" | "pure" | "english";
  options: Record<string, any>;
}
