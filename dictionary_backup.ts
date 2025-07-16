import { Handler } from "@netlify/functions";

// Korean Dictionary API configuration
const DICTIONARY_API_BASE_URL = "https://stdict.korean.go.kr/api/search.do";
const DICTIONARY_API_KEY = "4F4CF13529EABE510F4D67ACA4557923"; // 국립국어원 API 키

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

// Sample Korean words for fallback (메이플스토리 테마 관련 단어들 추가)
const sampleKoreanWords = {
  2: [
    // 자연 관련
    "하늘", "바다", "산", "강", "달", "별", "해", "구름", "비", "눈", "꽃", "나무", "새", "물", "불", "땅", "돌", "흙", "잎", "열매",
    // 게임 관련
    "검", "방", "힘", "운", "덱", "갑", "활", "창", "인", "룩", "마", "법", "궁", "도", "빛", "용", "왕", "신", "룬", "팬",
    // 메이플 관련 추가
    "숲", "빵", "귀", "뿔", "글", "날", "칼", "풀", "꿈", "별", "빙", "불", "맵", "짱", "쿨", "핫", "슬", "잼", "쌍", "띠"
  ],
  3: [
    // 자연 관련
    "하늘빛", "바다색", "산새", "강물", "달빛", "별빛", "해님", "구름이", "비둘기", "눈사람", "꽃잎", "나무꾼", "새벽", "물고기", "불빛", "땅콩", "돌멩이", "흙길", "잎사귀", "열매즙",
    // 게임 관련
    "전사님", "마법사", "궁수님", "도적님", "해적님", "빛방어", "어둠검", "영웅님", "레벨업", "보스님", "정령사", "드래곤", "파이어", "아이스", "윈드샷", "소울검", "블레이드", "쉐도우", "마스터", "아케인",
    // 메이플 관련 추가
    "메린이", "초보자", "초고수", "고인물", "펫돌이", "썬콜이", "보마봇", "힘만찍", "럭덱덱", "인트맘", "펀치킹", "재획꾼", "세티즌", "헤네돌", "케리돌", "스우돌", "방랑자", "모험가", "이피온", "원더러"
  ],
  4: [
    // 자연 관련
    "하늘나라", "바다거품", "산속길", "강가에서", "달무리", "별자리", "해바라기", "구름다리", "비오는날", "눈꽃송이", "꽃다발", "나무그늘", "새소리", "물방울", "불꽃놀이", "땅속으로", "돌아가자", "흙냄새", "잎새소리", "열매향기",
    // 게임 관련
    "메이플로", "레벨업함", "보스격파", "어둠마법", "빛의기사", "불의마법", "얼음창술", "바람화살", "영웅검사", "그림자칼", "달빛검객", "숲의수호", "검의달인", "마법의힘", "영웅전설", "메소부자", "용의숨결", "룬의힘", "힘을내요", "신의축복",
    // 메이플 관련 추가
    "얼티밋", "메린이들", "카이저맘", "아델고수", "제논짱", "카데나킹", "빅토리아", "에레브섬", "리스항구", "엘나스산", "페리온", "커닝시티", "에우렐", "리엔포스", "헤네시스", "페이스톤", "내친구야", "파워엘릭", "재획의달", "대박나라"
  ],
  5: [
    // 자연 관련
    "하늘공원", "바다냄새", "산속오두막", "강변풍경", "달빛속에", "별빛처럼", "해바라기꽃", "구름위에서", "비오는오후", "눈사람만들기", "꽃밭에서", "나무아래에서", "새벽공기", "물속여행", "불빛축제", "땅속보물", "돌담길따라", "흙손으로", "잎사귀춤", "열매따기",
    // 게임 관련
    "메이플세상", "어둠의기사", "빛의마법사", "불의궁수님", "얼음도적님", "바람해적님", "영웅의귀환", "그림자검사", "달빛의마법", "숲의수호자", "검의달인님", "마법의대가", "영웅의전설", "메소모으기", "용의제자님", "룬의수호자", "힘내라친구", "신의축복을", "영원한영웅", "메이플의별",
    // 메이플 관련 추가
    "짱짱맨맨", "신수의숲", "트리오파티", "블랙헤븐", "아케인리버", "유니온랭커", "보스헌터", "템셋완성", "사냥전문가", "아르카나", "모라스여행", "에스페라", "셀라스여행", "그란디스", "판테온여행", "루타비스", "보스러너", "헤이븐파티", "칠흑의보스", "슬리피우드"
  ],
  6: [
    // 자연 관련
    "하늘색바다", "바다거품냄새", "산속작은집", "강변산책길", "달빛아래에서", "별빛가득한하늘", "해바라기밭에서", "구름사이로날다", "비오는날풍경", "눈꽃송이춤추기", "꽃잎하나하나", "나무그늘아래서", "새소리가득한숲", "물방울반짝이는", "불꽃놀이축제장", "땅속깊은곳에", "돌아가는길위에", "흙냄새가득한길", "잎새바람소리듣기", "열매향기진한숲",
    // 게임 관련
    "메이플의전설", "어둠기사의검", "빛마법사의지팡이", "불의궁수의활", "얼음도적의단검", "바람해적의총", "영웅의귀환소식", "그림자검사의칼", "달빛마법의대가", "숲수호자의활", "검술달인의검법", "마법대가의주문", "영웅전설의시작", "메소부자의비밀", "용의제자의검술", "룬수호자의힘", "힘내라친구들아", "신의축복받은자", "영원한영웅으로", "메이플스타의빛",
    // 메이플 관련 추가
    "검은마법사의저주", "루시드의꿈세계", "윌오브더시프트", "데미안의분노", "진힐라의성", "모험가길드마스터", "레지스탕스지도자", "영웅연합의기사", "창공의노바전사", "시그너스기사단원", "영웅의자손입니다", "핑크빈의재림이다", "불꽃늑대의후예", "메이플스토리짱짱", "헤이븐레이드팀장", "칠흑의마법사죽임", "레벨삼백달성했다", "노바의용병입니다", "메이플의영웅이야", "위대한모험가입니다"
  ],
};

// Sample English words for fallback
const sampleEnglishWords = {
  2: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  3: ["sky", "sea", "sun", "moon", "star", "tree", "bird", "fish", "fire", "wind", "rain", "snow", "rock", "leaf", "rose", "blue", "red", "gold", "ice", "gem"],
  4: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  5: ["azure", "ocean", "sunny", "lunar", "starry", "woody", "avian", "aqua", "flame", "windy", "rainy", "snowy", "rocky", "green", "rosy", "blue", "ruby", "gold", "frost", "jewel"],
  6: ["azured", "oceanic", "sunlit", "moonlit", "starlit", "wooded", "birdie", "aquatic", "flamed", "breezy", "rainy", "snowy", "rocky", "leafy", "rosy", "blued", "ruby", "golden", "frosty", "jeweled"],
};

// 직접 API 테스트를 위한 함수
async function testDictionaryAPI() {
  console.log("테스트 시작: 국립국어원 API 직접 호출");
  
  const term = "가";
  const length = 2;
  
  try {
    const url = new URL(DICTIONARY_API_BASE_URL);
    url.searchParams.set("key", DICTIONARY_API_KEY);
    url.searchParams.set("q", term);
    url.searchParams.set("req_type", "json");
    url.searchParams.set("start", "1");
    url.searchParams.set("num", "100");
    url.searchParams.set("advanced", "y");
    url.searchParams.set("method", "start"); // start로 시작하는 단어 검색
    url.searchParams.set("type1", "word"); // 어휘만 검색 (구/관용구/속담 제외)
    url.searchParams.set("pos", "1"); // 명사만 검색
    url.searchParams.set("letter_s", length.toString());
    url.searchParams.set("letter_e", length.toString());
    url.searchParams.set("type2", "native,chinese"); // 고유어 + 한자어
    
    console.log(`API 요청 URL: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MapleNicknameGenerator/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`API 에러: ${response.status} ${response.statusText}`);
      return;
    }
    
    const text = await response.text();
    console.log(`응답 길이: ${text.length} 바이트`);
    console.log(`응답 미리보기: ${text.substring(0, 1000)}...`);
    
    try {
      const data = JSON.parse(text);
      if (data.error) {
        console.error(`API 에러: ${data.error.error_code} - ${data.error.message}`);
      } else if (data.channel?.item) {
        const items = Array.isArray(data.channel.item) ? data.channel.item : [data.channel.item];
        console.log(`총 ${items.length}개 항목 찾음`);
        
        const words: string[] = [];
        for (const item of items) {
          if (item.word && item.word.length === length) {
            if (/^[가-힣]+$/.test(item.word)) {
              words.push(item.word);
            }
          }
        }
        
        console.log(`필터링 후 ${words.length}개 단어 남음:`);
        console.log(words);
      } else {
        console.log("검색 결과 없음");
      }
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
    }
  } catch (error) {
    console.error("API 호출 에러:", error);
  }
}

// 스크립트가 직접 실행될 때 API 테스트 실행
if (typeof require !== 'undefined' && require.main === module) {
  testDictionaryAPI();
}

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
    const maxResults = 1000; // Get more results to filter by length
    
    // Common Korean syllables and particles to search for words
    const initialConsonants = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const middleVowels = ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ", "ㅐ", "ㅒ", "ㅔ", "ㅖ", "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ"];
    
    // 모든 가능한 첫 글자 조합 생성 (초성 + 중성)
    const searchTerms: string[] = [];
    
    // 기본 첫 글자 (가-하) 외에도 더 많은 조합 추가
    initialConsonants.forEach(consonant => {
      middleVowels.slice(0, 8).forEach(vowel => { // 더 많은 모음 조합 사용
        // 초성과 중성을 결합하여 실제 한글 음절로 변환
        const charCode = 44032 + 
                        (initialConsonants.indexOf(consonant) * 588) + 
                        (middleVowels.indexOf(vowel) * 28);
        searchTerms.push(String.fromCharCode(charCode));
      });
    });
    
    // 추가로 특정 유용한 시작 음절 직접 추가
    const additionalTerms = ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하", 
                            "그", "느", "드", "르", "므", "브", "스", "으", "즈", "츠", "크", "트", "프", "흐",
                            "기", "니", "디", "리", "미", "비", "시", "이", "지", "치", "키", "티", "피", "히",
                            // 메이플스토리 관련 검색어 추가
                            "메", "헤", "스", "엘", "아", "보", "용", "검", "빛", "어", "루", "던", "힘", "눈", "해",
                            "무", "영", "전", "소", "불", "얼", "바", "룬", "몬", "신", "팬", "숲", "귀", "음",
                            // 현재 시간으로 랜덤 변수 추가
                            "초", "황", "화", "동", "퀴", "철", "금", "목", "논", "산", "교", "장", "제", "개", "밑",
                            "큰", "작", "긴", "짧", "깊", "높", "낮", "멀", "빠", "느", "럭", "덱", "럭"];
    searchTerms.push(...additionalTerms);
    
    // 중복 제거
    const uniqueTerms = [...new Set(searchTerms)];
    console.log(`Generated ${uniqueTerms.length} unique search terms`);
    
    // 랜덤하게 선택하여 다양성 확보 (Fisher-Yates 셔플 알고리즘 사용)
    const shuffledTerms = [...uniqueTerms];
    for (let i = shuffledTerms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTerms[i], shuffledTerms[j]] = [shuffledTerms[j], shuffledTerms[i]];
    }
    
    // 더 많은 검색어를 사용하여 다양성 확보 (매번 다른 개수 사용)
    const termCount = Math.floor(Math.random() * 8) + 8; // 8~16개 사이 랜덤 (성능 최적화)
    const selectedTerms = shuffledTerms.slice(0, termCount);
    
    // Get words from multiple search terms
    for (const term of selectedTerms) {
      try {
        const url = new URL(DICTIONARY_API_BASE_URL);
        url.searchParams.set("key", DICTIONARY_API_KEY);
        url.searchParams.set("q", term);
        url.searchParams.set("req_type", "json");
        
        // 매 호출마다 다른 시작점을 사용하여 다양한 결과 얻기
        // 국립국어원 API는 결과가 많을 경우 페이징 처리를 함
        const randomStart = Math.floor(Math.random() * 30) + 1; // 1~30 사이의 랜덤 시작점
        url.searchParams.set("start", randomStart.toString());
        
        // 매 호출마다 다른 개수 요청
        const randomCount = Math.floor(Math.random() * 30) + 80; // 80~110 사이 랜덤 개수
        url.searchParams.set("num", randomCount.toString());
        
        url.searchParams.set("advanced", "y");
        
        // 매 호출마다 다른 검색 방법을 사용하여 다양한 결과 얻기
        const searchMethods = ["start", "exact", "include"];
        const randomMethod = searchMethods[Math.floor(Math.random() * searchMethods.length)]; // 모든 방법 중 랜덤 선택
        url.searchParams.set("method", randomMethod);
        
        // 검색 카테고리 랜덤 선택 (품사)
        url.searchParams.set("type1", "word"); // 어휘만 검색 (구/관용구/속담 제외)
        
        // 다양한 품사 검색을 위한 랜덤 선택
        const posCodes = ["1", "2"]; // 1: 명사, 2: 동사
        if(Math.random() > 0.7) { // 30%의 확률로 동사도 포함
          url.searchParams.set("pos", posCodes[Math.floor(Math.random() * posCodes.length)]);
        } else {
          url.searchParams.set("pos", "1"); // 기본값은 명사
        }
        url.searchParams.set("letter_s", length.toString());
        url.searchParams.set("letter_e", length.toString());
        
        // Set type based on parameter
        if (type === "pure") {
          url.searchParams.set("type2", "native"); // 고유어
        } else if (type === "korean") {
          url.searchParams.set("type2", "native,chinese"); // 고유어 + 한자어
        }
        
        console.log(`Fetching from dictionary API: ${url.toString()}`);
        
        // 국립국어원 API 호출
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃 (성능 최적화)
        
        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': 'MapleNicknameGenerator/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // 타임아웃 취소
        
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
          console.log(`Found ${Array.isArray(data.channel.item) ? data.channel.item.length : 1} items for term "${term}"`);
          
          // API가 단일 항목일 경우 배열로 변환
          const items = Array.isArray(data.channel.item) ? data.channel.item : [data.channel.item];
          
          for (const item of items) {
            if (item.word && item.word.length === length) {
              // 단어만 필터링 (숫자나 특수문자 제외)
              if (/^[가-힣]+$/.test(item.word)) {
                console.log(`Adding word: ${item.word}`);
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
        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms 지연 (성능 최적화)
        
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
    
    // Remove duplicates
    const uniqueWords = [...new Set(words)];
    console.log(`After removing duplicates: ${uniqueWords.length} unique words`);
    
    // 더 철저한 셔플 알고리즘 적용 (Fisher-Yates 알고리즘)
    for (let i = uniqueWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueWords[i], uniqueWords[j]] = [uniqueWords[j], uniqueWords[i]];
    }
    
    console.log(`Returning ${uniqueWords.length} thoroughly shuffled unique words`);
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
    'Cache-Control': 'no-cache, no-store, must-revalidate', // 캐싱 방지
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store', // CDN 캐싱 방지
    'Vary': '*' // 모든 요청 헤더에 따라 응답이 다름을 명시
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
    // Fisher-Yates 알고리즘을 사용한 철저한 셔플링
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    
    const limited = words.slice(0, count);
    
    // 실시간으로 생성된 무작위 타임스탬프 추가
    const timestamp = Date.now() + Math.floor(Math.random() * 10000).toString();
    
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
        random: timestamp // 무작위성을 높이기 위한 추가 필드
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
