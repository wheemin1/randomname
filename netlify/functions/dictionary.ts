import { Handler } from "@netlify/functions";

// Korean dictionary data (sample - in production this would come from actual API)
const sampleKoreanWords = {
  2: ["하늘", "바다", "산", "강", "달", "별", "해", "구름", "비", "눈", "꽃", "나무", "새", "물", "불", "땅", "돌", "흙", "잎", "열매"],
  3: ["하늘빛", "바다색", "산새", "강물", "달빛", "별빛", "해님", "구름이", "비둘기", "눈사람", "꽃잎", "나무꾼", "새벽", "물고기", "불빛", "땅콩", "돌멩이", "흙길", "잎사귀", "열매즙"],
  4: ["하늘나라", "바다거품", "산속길", "강가에서", "달무리", "별자리", "해바라기", "구름다리", "비오는날", "눈꽃송이", "꽃다발", "나무그늘", "새소리", "물방울", "불꽃놀이", "땅속으로", "돌아가자", "흙냄새", "잎새소리", "열매향기"],
  5: ["하늘공원에서", "바다냄새나는", "산속오두막", "강변풍경", "달빛속에서", "별빛처럼", "해바라기꽃", "구름위에서", "비오는오후", "눈사람만들기", "꽃밭에서", "나무아래에서", "새벽공기", "물속여행", "불빛축제", "땅속보물", "돌담길따라", "흙손으로", "잎사귀춤", "열매따기"],
  6: ["하늘색바다에서", "바다거품냄새", "산속작은집", "강변산책길", "달빛아래에서", "별빛가득한", "해바라기밭에서", "구름사이로", "비오는날풍경", "눈꽃송이춤", "꽃잎하나하나", "나무그늘아래", "새소리가득한", "물방울반짝", "불꽃놀이축제", "땅속깊은곳", "돌아가는길", "흙냄새가득", "잎새바람소리", "열매향기진한"],
};

const samplePureKoreanWords = {
  2: ["하늘", "바다", "산", "강", "달", "별", "해", "구름", "비", "눈", "꽃", "나무", "새", "물", "불", "땅", "돌", "흙", "잎", "열매"],
  3: ["하늘빛", "바다색", "산새", "강물", "달빛", "별빛", "해님", "구름이", "비둘기", "눈사람", "꽃잎", "나무꾼", "새벽", "물고기", "불빛", "땅콩", "돌멩이", "흙길", "잎사귀", "열매즙"],
  4: ["하늘나라", "바다거품", "산속길", "강가에서", "달무리", "별자리", "해바라기", "구름다리", "비오는날", "눈꽃송이", "꽃다발", "나무그늘", "새소리", "물방울", "불꽃놀이", "땅속으로", "돌아가자", "흙냄새", "잎새소리", "열매향기"],
  5: ["하늘공원에서", "바다냄새나는", "산속오두막", "강변풍경", "달빛속에서", "별빛처럼", "해바라기꽃", "구름위에서", "비오는오후", "눈사람만들기", "꽃밭에서", "나무아래에서", "새벽공기", "물속여행", "불빛축제", "땅속보물", "돌담길따라", "흙손으로", "잎사귀춤", "열매따기"],
  6: ["하늘색바다에서", "바다거품냄새", "산속작은집", "강변산책길", "달빛아래에서", "별빛가득한", "해바라기밭에서", "구름사이로", "비오는날풍경", "눈꽃송이춤", "꽃잎하나하나", "나무그늘아래", "새소리가득한", "물방울반짝", "불꽃놀이축제", "땅속깊은곳", "돌아가는길", "흙냄새가득", "잎새바람소리", "열매향기진한"],
};

const sampleEnglishWords = {
  2: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  3: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  4: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  5: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  6: ["azured", "oceanic", "sunlit", "moonlit", "starlit", "wooded", "birdie", "aquatic", "flamed", "breezy", "rainy", "snowy", "rocky", "leafy", "rosy", "blued", "ruby", "golden", "frosty", "jeweled"],
};

async function fetchFromDictionaryAPI(length: number, type: string): Promise<string[]> {
  // In production, this would call the actual Korean Standard Dictionary API
  // For now, return sample data
  const wordSets = {
    korean: sampleKoreanWords,
    pure: samplePureKoreanWords,
    english: sampleEnglishWords,
  };
  
  const wordSet = wordSets[type as keyof typeof wordSets];
  if (!wordSet) return [];
  
  const words = wordSet[length as keyof typeof wordSet] || [];
  return words;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=43200', // 12 hours
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
    
    // Shuffle and limit results
    const shuffled = words.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, count);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        words: limited,
        length,
        type,
        count: limited.length,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Dictionary API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
