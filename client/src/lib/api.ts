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
    console.log(`Checking ${nicknames.length} nicknames:`, nicknames);
    
    // Use /.netlify/functions/ directly instead of /api/ path
    const results = await Promise.all(
      nicknames.map(async (nickname) => {
        try {
          const url = `/.netlify/functions/nickname-check?nickname=${encodeURIComponent(nickname)}`;
          console.log(`Checking nickname availability: ${url}`);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`HTTP error for ${nickname}: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`Response for ${nickname}:`, data);
          
          return {
            nickname,
            status: data.status || "error",
            lastChecked: data.timestamp || new Date().toISOString()
          };
        } catch (error) {
          console.error("Nickname check error:", error);
          return {
            nickname,
            status: "error" as const,
            lastChecked: new Date().toISOString()
          };
        }
      })
    );
    console.log(`Check results:`, results);
    return results;
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
      console.log(`Checking nickname availability: ${nickname}`);
      const url = `/.netlify/functions/nickname-check?nickname=${encodeURIComponent(nickname)}`;
      console.log(`Calling URL: ${url}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error(`HTTP ${res.status}: ${res.statusText}`);
        return "error";
      }
      
      const data = await res.json();
      console.log(`Availability response for ${nickname}:`, data);
      
      return data.status || "error";
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
      console.log(`Getting dictionary words:`, params);
      const queryParams = new URLSearchParams({
        length: params.length.toString(),
        type: params.type,
        count: (params.count || 100).toString(),
      });
      
      const url = `/.netlify/functions/dictionary?${queryParams}`;
      console.log(`Calling dictionary API: ${url}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        console.error(`Dictionary API HTTP ${res.status}: ${res.statusText}`);
        return [];
      }
      
      const data = await res.json();
      console.log(`Dictionary API response:`, data);
      
      return data.words || [];
    } catch (error) {
      console.error("Dictionary API error:", error);
      return [];
    }
  },
};
