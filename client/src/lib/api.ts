import { apiRequest } from "./queryClient";

export interface NicknameCheckRequest {
  nicknames: string[];
}

export interface NicknameCheckResponse {
  nickname: string;
  status: "free" | "busy" | "loading" | "error";
  lastChecked: string;
}

export interface GenerateNicknamesRequest {
  length: number;
  count: number;
  type: "random" | "korean" | "pure" | "english";
  options?: {
    excludeFinalConsonants?: boolean;
    specificInitial?: string;
  };
}

export const nicknameApi = {
  async checkNicknames(nicknames: string[]): Promise<NicknameCheckResponse[]> {
    const res = await apiRequest("POST", "/api/nickname-check", { nicknames });
    return res.json();
  },

  async generateNicknames(params: GenerateNicknamesRequest) {
    const res = await apiRequest("POST", "/api/generate-nicknames", params);
    return res.json();
  },

  async getGeneratedNicknames() {
    const res = await apiRequest("GET", "/api/generated-nicknames");
    return res.json();
  },
};

// External API functions that will be called via Netlify Functions
export const externalApi = {
  async checkNicknameAvailability(nickname: string): Promise<"free" | "busy" | "error"> {
    try {
      const res = await fetch(`/.netlify/functions/nickname-check?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      return data.status;
    } catch (error) {
      console.error("External nickname check error:", error);
      return "error";
    }
  },

  async getDictionaryWords(params: {
    length: number;
    type: "korean" | "pure" | "english";
    count?: number;
  }): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams({
        length: params.length.toString(),
        type: params.type,
        count: (params.count || 100).toString(),
      });
      
      const res = await fetch(`/.netlify/functions/dictionary?${queryParams}`);
      const data = await res.json();
      return data.words || [];
    } catch (error) {
      console.error("Dictionary API error:", error);
      return [];
    }
  },
};
