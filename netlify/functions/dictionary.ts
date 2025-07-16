import { Handler } from "@netlify/functions";

// Korean Dictionary API configuration
const DICTIONARY_API_BASE_URL = "https://stdict.korean.go.kr/api/search.do";
const DICTIONARY_API_KEY = "4F4CF13529EABE510F4D67ACA4557923";

// Dictionary API response interface
interface DictionaryResponse {
  channel: {
    title: string;
    link: string;
    description: string;
    lastbuilddate: string;
    total: number;
    start: number;
    num: number;
    item?: DictionaryItem[];
  };
  error?: {
    error_code: string;
    message: string;
  };
}

interface DictionaryItem {
  target_code: number;
  word: string;
  sup_no: number;
  pos: string;
  sense: {
    definition: string;
    link: string;
    type: string;
  };
}

// Sample Korean words for fallback
const sampleKoreanWords = {
  2: ["하늘", "바다", "산", "강", "달", "별", "해", "구름", "비", "눈", "꽃", "나무", "새", "물", "불", "땅", "돌", "흙", "잎", "열매"],
  3: ["하늘빛", "바다색", "산새", "강물", "달빛", "별빛", "해님", "구름이", "비둘기", "눈사람", "꽃잎", "나무꾼", "새벽", "물고기", "불빛", "땅콩", "돌멩이", "흙길", "잎사귀", "열매즙"],
  4: ["하늘나라", "바다거품", "산속길", "강가에서", "달무리", "별자리", "해바라기", "구름다리", "비오는날", "눈꽃송이", "꽃다발", "나무그늘", "새소리", "물방울", "불꽃놀이", "땅속으로", "돌아가자", "흙냄새", "잎새소리", "열매향기"],
  5: ["하늘공원에서", "바다냄새나는", "산속오두막", "강변풍경", "달빛속에서", "별빛처럼", "해바라기꽃", "구름위에서", "비오는오후", "눈사람만들기", "꽃밭에서", "나무아래에서", "새벽공기", "물속여행", "불빛축제", "땅속보물", "돌담길따라", "흙손으로", "잎사귀춤", "열매따기"],
  6: ["하늘색바다에서", "바다거품냄새", "산속작은집", "강변산책길", "달빛아래에서", "별빛가득한", "해바라기밭에서", "구름사이로", "비오는날풍경", "눈꽃송이춤", "꽃잎하나하나", "나무그늘아래", "새소리가득한", "물방울반짝", "불꽃놀이축제", "땅속깊은곳", "돌아가는길", "흙냄새가득", "잎새바람소리", "열매향기진한"],
};

// Sample English words for fallback
const sampleEnglishWords = {
  2: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  3: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  4: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  5: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  6: ["azured", "oceanic", "sunlit", "moonlit", "starlit", "wooded", "birdie", "aquatic", "flamed", "breezy", "rainy", "snowy", "rocky", "leafy", "rosy", "blued", "ruby", "golden", "frosty", "jeweled"],
};

/**
 * 국립국어원 표준국어대사전 API를 통해 단어 가져오기
 */
async function fetchFromDictionaryAPI(length: number, type: string): Promise<string[]> {
  console.log(`Fetching dictionary words: length=${length}, type=${type}`);
  
  // For english words, return sample data
  if (type === "english") {
    const words = sampleEnglishWords[length as keyof typeof sampleEnglishWords] || [];
    console.log(`Returning ${words.length} English words`);
    return words;
  }

  // For Korean words, try to use the actual dictionary API
  try {
    const words: string[] = [];
    const maxResults = 500; // Get more results to filter by length
    
    // Common Korean syllables and particles to search for words
    const searchTerms = [
      "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하",
      "게", "네", "데", "레", "메", "베", "세", "에", "제", "체", "케", "테", "페", "헤",
      "고", "노", "도", "로", "모", "보", "소", "오", "조", "초", "코", "토", "포", "호"
    ];
    
    console.log(`Searching with ${searchTerms.length} terms, using first 5`);
    
    // Get words from multiple search terms
    for (const term of searchTerms.slice(0, 5)) { // Limit to first 5 terms to avoid rate limits
      try {
        const url = new URL(DICTIONARY_API_BASE_URL);
        url.searchParams.set("key", DICTIONARY_API_KEY);
        url.searchParams.set("q", term);
        url.searchParams.set("req_type", "json");
        url.searchParams.set("start", "1");
        url.searchParams.set("num", "100");
        url.searchParams.set("advanced", "y");
        url.searchParams.set("method", "start");
        url.searchParams.set("letter_s", length.toString());
        url.searchParams.set("letter_e", length.toString());
        
        // Set type based on parameter
        if (type === "pure") {
          url.searchParams.set("type2", "native"); // 고유어
        } else if (type === "korean") {
          url.searchParams.set("type2", "native,chinese"); // 고유어 + 한자어
        }
        
        console.log(`Fetching from dictionary API: ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': 'MapleNicknameGenerator/1.0'
          }
        });
        
        if (!response.ok) {
          console.error(`Dictionary API error: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const text = await response.text();
        console.log(`Dictionary response length: ${text.length}`);
        console.log(`Dictionary response preview: ${text.substring(0, 200)}...`);
        
        let data: DictionaryResponse;
        
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', text.substring(0, 500));
          continue;
        }
        
        // Check if response contains error
        if (data.error) {
          console.error(`Dictionary API error: ${data.error.error_code} - ${data.error.message}`);
          continue;
        }
        
        if (data.channel?.item) {
          console.log(`Found ${data.channel.item.length} items for term "${term}"`);
          for (const item of data.channel.item) {
            if (item.word && item.word.length === length) {
              // Filter out words with numbers or special characters
              if (/^[가-힣]+$/.test(item.word)) {
                words.push(item.word);
              }
            }
          }
        } else {
          console.log(`No items found for term "${term}"`);
        }
        
        // Break if we have enough words
        if (words.length >= maxResults) break;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error fetching from dictionary API with term ${term}:`, error);
        continue;
      }
    }
    
    console.log(`Total words found: ${words.length}`);
    
    // If we couldn't get enough words from the API, use sample data
    if (words.length < 10) {
      console.warn(`Not enough words found via API (${words.length}), using sample data`);
      return sampleKoreanWords[length as keyof typeof sampleKoreanWords] || [];
    }
    
    // Remove duplicates and return
    const uniqueWords = [...new Set(words)];
    console.log(`Returning ${uniqueWords.length} unique words`);
    return uniqueWords;
    
  } catch (error) {
    console.error("Dictionary API error:", error);
    // Fallback to sample data
    return type === "pure" || type === "korean" 
      ? sampleKoreanWords[length as keyof typeof sampleKoreanWords] || []
      : [];
  }
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=3600', // 1 hour cache for dictionary results
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const params = event.queryStringParameters || {};
  const length = parseInt(params.length || '3');
  const type = params.type || 'korean';
  const count = parseInt(params.count || '100');

  if (length < 2 || length > 6) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Length must be between 2 and 6' }),
    };
  }

  if (!['korean', 'pure', 'english'].includes(type)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Type must be korean, pure, or english' }),
    };
  }

  try {
    const words = await fetchFromDictionaryAPI(length, type);
    
    if (words.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          words: [],
          message: 'No words found for the specified criteria',
          length,
          type,
        }),
      };
    }
    
    // Shuffle and limit results
    const shuffled = words.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, count);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        words: limited,
        total: words.length,
        returned: limited.length,
        length,
        type,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Dictionary API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch dictionary words',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
