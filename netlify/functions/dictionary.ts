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

// 한글 음절 생성 유틸리티
function generateRandomSyllables(count: number): string[] {
  // 한글 초성, 중성, 종성 정의
  const initialConsonants = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const middleVowels = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
  const finalConsonants = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const chosung = initialConsonants[Math.floor(Math.random() * initialConsonants.length)];
    const jungsung = middleVowels[Math.floor(Math.random() * middleVowels.length)];
    const jongsung = Math.random() > 0.5 ? finalConsonants[Math.floor(Math.random() * finalConsonants.length)] : "";
    
    // 초성 인덱스 계산 (쌍자음 고려)
    let chosungIndex = initialConsonants.indexOf(chosung);
    if (chosungIndex === 1) chosungIndex = 0; // ㄲ -> ㄱ의 인덱스로 보정
    if (chosungIndex === 4) chosungIndex = 3; // ㄸ -> ㄷ의 인덱스로 보정
    if (chosungIndex === 8) chosungIndex = 7; // ㅃ -> ㅂ의 인덱스로 보정
    if (chosungIndex === 10) chosungIndex = 9; // ㅆ -> ㅅ의 인덱스로 보정
    if (chosungIndex === 13) chosungIndex = 12; // ㅉ -> ㅈ의 인덱스로 보정
    
    // 중성 인덱스 계산
    let jungsungIndex = middleVowels.indexOf(jungsung);
    
    // 종성 인덱스 계산
    let jongsungIndex = finalConsonants.indexOf(jongsung);
    
    // 한글 음절 유니코드 계산
    // 한글 음절 = 0xAC00 + (초성 * 21 * 28) + (중성 * 28) + 종성
    const charCode = 44032 + (chosungIndex * 21 * 28) + (jungsungIndex * 28) + jongsungIndex;
    
    result.push(String.fromCharCode(charCode));
  }
  return result;
}

// 직접 API 테스트를 위한 함수
async function testDictionaryAPI() {
  console.log("테스트 시작: 국립국어원 API 직접 호출");
  
  // 다양한 초성을 기반으로 한 테스트 시작 음절 생성
  const initialSyllables = ["가", "나", "다", "메", "스", "헤", "아", "호"];
  const testResults: Record<string, string[]> = {};
  
  for (const term of initialSyllables) {
    const length = 3; // 테스트 길이 (2~6 사이 설정 가능)
    
    try {
      console.log(`테스트 중: 시작 음절 "${term}", 길이 ${length}글자`);
      
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
        continue;
      }
      
      const text = await response.text();
      console.log(`응답 길이: ${text.length} 바이트`);
      
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
              if (/^[가-힣]+$/.test(item.word) && item.word.length >= 2) {
                words.push(item.word);
              }
            }
          }
          
          console.log(`필터링 후 ${words.length}개 단어 남음`);
          testResults[term] = words;
          console.log(words.slice(0, 10)); // 처음 10개만 표시
        } else {
          console.log("검색 결과 없음");
        }
      } catch (error) {
        console.error("JSON 파싱 에러:", error);
      }
      
      // 다음 API 호출 전 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error("API 호출 에러:", error);
    }
  }
  
  // 전체 테스트 결과 요약
  console.log("\n=== 테스트 결과 요약 ===");
  for (const term in testResults) {
    console.log(`시작 음절 "${term}": ${testResults[term].length}개 단어 찾음`);
  }
  
  // 무작위 생성 함수 테스트
  console.log("\n=== 무작위 한글 음절 생성 테스트 ===");
  const randomSyllables = generateRandomSyllables(10);
  console.log(`생성된 10개 무작위 음절: ${randomSyllables.join(', ')}`);
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
  
  // 메이플스토리에서는 1글자 닉네임이 불가능하므로 2글자 미만 요청 거부
  if (length < 2) {
    console.warn(`Rejecting request for ${length} character words (minimum is 2)`);
    return [];
  }
  
  // For english words, return sample data
  if (type === "english") {
    const words = sampleEnglishWords[length as keyof typeof sampleEnglishWords] || [];
    console.log(`Returning ${words.length} English words`);
    return words;
  }

  // For Korean words, try to use the actual dictionary API
  try {
    const words: string[] = [];
    const maxResults = 2000; // 더 많은 결과를 가져와서 다양성 확보
    
    // 한글 초성, 중성, 종성 정의
    const initialConsonants = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const middleVowels = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
    const finalConsonants = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    
    // 더 다양한 검색 조합을 위한 탐색 전략
    const searchTerms: string[] = [];
    
    // 전략 1: 완전 랜덤 음절 생성 (초성 + 중성 + 종성)
    const generateRandomSyllables = (count: number) => {
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        const chosung = initialConsonants[Math.floor(Math.random() * initialConsonants.length)];
        const jungsung = middleVowels[Math.floor(Math.random() * middleVowels.length)];
        const jongsung = Math.random() > 0.5 ? finalConsonants[Math.floor(Math.random() * finalConsonants.length)] : "";
        
        // 초성 인덱스 계산 (쌍자음 고려)
        let chosungIndex = initialConsonants.indexOf(chosung);
        if (chosungIndex === 1) chosungIndex = 0; // ㄲ -> ㄱ의 인덱스로 보정
        if (chosungIndex === 4) chosungIndex = 3; // ㄸ -> ㄷ의 인덱스로 보정
        if (chosungIndex === 8) chosungIndex = 7; // ㅃ -> ㅂ의 인덱스로 보정
        if (chosungIndex === 10) chosungIndex = 9; // ㅆ -> ㅅ의 인덱스로 보정
        if (chosungIndex === 13) chosungIndex = 12; // ㅉ -> ㅈ의 인덱스로 보정
        
        // 중성 인덱스 계산 (복합 모음 고려)
        let jungsungIndex = middleVowels.indexOf(jungsung);
        
        // 종성 인덱스 계산
        let jongsungIndex = finalConsonants.indexOf(jongsung);
        
        // 한글 음절 유니코드 계산
        // 한글 음절 = 0xAC00 + (초성 * 21 * 28) + (중성 * 28) + 종성
        const charCode = 44032 + (chosungIndex * 21 * 28) + (jungsungIndex * 28) + jongsungIndex;
        
        result.push(String.fromCharCode(charCode));
      }
      return result;
    };
    
    // 전략 2: 자주 사용되는 초성 기반 음절 생성
    const commonInitials = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅎ"];
    commonInitials.forEach(consonant => {
      // 모든 중성과 조합
      middleVowels.forEach(vowel => {
        // 초성과 중성을 결합하여 실제 한글 음절로 변환
        const chosungIndex = initialConsonants.indexOf(consonant);
        const jungsungIndex = middleVowels.indexOf(vowel);
        
        // 각 초성-중성 조합에 대해 두 가지 버전 생성 (종성 있는 버전과 없는 버전)
        const baseCharCode = 44032 + (chosungIndex * 21 * 28) + (jungsungIndex * 28);
        searchTerms.push(String.fromCharCode(baseCharCode)); // 종성 없는 버전
        
        // 가장 흔한 종성 중 하나를 랜덤하게 추가 ("ㄱ", "ㄴ", "ㄹ", "ㅁ", "ㅂ", "ㅇ")
        const commonFinals = [1, 4, 8, 16, 17, 21]; // 해당 종성들의 인덱스
        const randomFinalIndex = commonFinals[Math.floor(Math.random() * commonFinals.length)];
        searchTerms.push(String.fromCharCode(baseCharCode + randomFinalIndex));
      });
    });
    
    // 전략 3: 빈도가 높은 음절 명시적 추가
    const additionalTerms = [
      // 기본 시작 음절 (가나다라마바사 등)
      "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하", 
      // 자주 사용되는 음절 (그느드르 등)
      "그", "느", "드", "르", "므", "브", "스", "으", "즈", "츠", "크", "트", "프", "흐",
      "기", "니", "디", "리", "미", "비", "시", "이", "지", "치", "키", "티", "피", "히",
      // 메이플스토리 관련 검색어
      "메", "헤", "스", "엘", "아", "보", "용", "검", "빛", "어", "루", "던", "힘", "눈", "해",
      "무", "영", "전", "소", "불", "얼", "바", "룬", "몬", "신", "팬", "숲", "귀", "음",
      // 게임 관련 유용한 시작 음절
      "강", "마", "성", "전", "황", "빙", "호", "서", "격", "여", "새", "돌", "칼", "활", "궁",
      "폭", "진", "쿨", "럭", "슬", "포", "패", "로", "파", "쉐", "블", "스", "썬", "썸", "해",
      // 숫자/컴퓨터 용어 관련
      "백", "천", "만", "억", "조", "키", "코", "픽", "셀", "윈", "넷", "핫", "랭", "순", "위"
    ];
    
    // 전략 4: 완전 랜덤 생성 음절 추가 (매번 다른 결과)
    const randomSyllables = generateRandomSyllables(100);
    
    // 모든 전략의 결과 합치기
    searchTerms.push(...additionalTerms, ...randomSyllables);
    
    // 중복 제거
    const uniqueTerms = [...new Set(searchTerms)];
    console.log(`Generated ${uniqueTerms.length} unique search terms`);
    
    // 랜덤하게 선택하여 다양성 확보 (Fisher-Yates 셔플 알고리즘 사용)
    const shuffledTerms = [...uniqueTerms];
    for (let i = shuffledTerms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTerms[i], shuffledTerms[j]] = [shuffledTerms[j], shuffledTerms[i]];
    }
    
    // 다양성을 위해 더 많은 검색어 사용 (매번 다른 양 사용)
    const termCount = Math.floor(Math.random() * 15) + 15; // 15~30개 사이 랜덤
    const selectedTerms = shuffledTerms.slice(0, termCount);
    
    // 다양한 전략의 검색 방법 정의
    const searchMethods = [
      // 기본 검색 방법
      { method: "start", weight: 0.4 },   // 검색어로 시작하는 단어 (40% 확률)
      { method: "exact", weight: 0.2 },   // 검색어와 정확히 일치하는 단어 (20% 확률)
      { method: "include", weight: 0.4 }  // 검색어를 포함하는 단어 (40% 확률)
    ];
    
    // 동적 검색 전략을 위한 포지션 코드
    const positionCodes = [
      { code: "1", name: "명사", weight: 0.7 },    // 명사 (70% 확률)
      { code: "2", name: "동사", weight: 0.15 },   // 동사 (15% 확률)
      { code: "5", name: "형용사", weight: 0.1 },  // 형용사 (10% 확률)
      { code: "3", name: "부사", weight: 0.05 }    // 부사 (5% 확률)
    ];
    
    // 다양한 API 호출 패턴을 사용하기 위한 설정
    const apiCallOptions = {
      starts: [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50],  // 다양한 시작점
      counts: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]  // 다양한 요청 수
    };
    
    // 각 검색어에 대해 다른 전략 적용하여 API 호출
    for (const term of selectedTerms) {
      try {
        const url = new URL(DICTIONARY_API_BASE_URL);
        url.searchParams.set("key", DICTIONARY_API_KEY);
        url.searchParams.set("q", term);
        url.searchParams.set("req_type", "json");
        
        // 다양한 시작점 설정 (매 호출마다 다름)
        const randomStartIndex = Math.floor(Math.random() * apiCallOptions.starts.length);
        const start = apiCallOptions.starts[randomStartIndex];
        url.searchParams.set("start", start.toString());
        
        // 다양한 개수 요청 (매 호출마다 다름)
        const randomCountIndex = Math.floor(Math.random() * apiCallOptions.counts.length);
        const count = apiCallOptions.counts[randomCountIndex];
        url.searchParams.set("num", count.toString());
        
        url.searchParams.set("advanced", "y");
        
        // 가중치 기반으로 검색 방법 선택
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedMethod = searchMethods[0].method;
        
        for (const method of searchMethods) {
          cumulativeWeight += method.weight;
          if (randomValue <= cumulativeWeight) {
            selectedMethod = method.method;
            break;
          }
        }
        url.searchParams.set("method", selectedMethod);
        
        // 어휘만 검색 (구/관용구/속담 제외)
        url.searchParams.set("type1", "word");
        
        // 가중치 기반으로 품사 선택
        const positionRandom = Math.random();
        let positionCumulativeWeight = 0;
        let selectedPosition = positionCodes[0].code;
        
        for (const position of positionCodes) {
          positionCumulativeWeight += position.weight;
          if (positionRandom <= positionCumulativeWeight) {
            selectedPosition = position.code;
            break;
          }
        }
        url.searchParams.set("pos", selectedPosition);
        
        // 글자 길이 설정
        url.searchParams.set("letter_s", length.toString());
        url.searchParams.set("letter_e", length.toString());
        
        // 단어 유형 설정 (parameter 기반)
        if (type === "pure") {
          url.searchParams.set("type2", "native"); // 고유어
        } else if (type === "korean") {
          // 한자어와 고유어 랜덤 비율 결정
          if (Math.random() > 0.3) {
            url.searchParams.set("type2", "native,chinese"); // 70% 확률로 고유어 + 한자어
          } else {
            url.searchParams.set("type2", "native"); // 30% 확률로 고유어만
          }
        }
        
        console.log(`Fetching from dictionary API: ${url.toString()}`);
        
        // 국립국어원 API 호출 (병렬 처리를 위한 Promise 기반)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃 (성능 최적화)
        
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
        
        let data: DictionaryResponse;
        
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          continue;
        }
        
        // Check if response contains error
        if (data.error) {
          console.error(`Dictionary API error: ${data.error.error_code} - ${data.error.message}`);
          continue;
        }
        
        if (data.channel?.item) {
          // API가 단일 항목일 경우 배열로 변환
          const items = Array.isArray(data.channel.item) ? data.channel.item : [data.channel.item];
          
          for (const item of items) {
            // 단어가 있고, 요청한 길이와 일치하는지 확인
            if (item.word && item.word.length === length) {
              // 한글 문자만 포함하는지 확인 (숫자, 특수문자 제외)
              if (/^[가-힣]+$/.test(item.word)) {
                // 최소 2글자 이상인지 확인 (메이플스토리 1글자 닉네임 제한)
                if (item.word.length >= 2) {
                  // 중복 확인 (이미 추가된 단어는 다시 추가하지 않음)
                  if (!words.includes(item.word)) {
                    words.push(item.word);
                  }
                }
              }
            }
          }
        }
        
        // 충분한 단어를 찾았으면 중단
        if (words.length >= maxResults) {
          console.log(`Reached maximum results limit (${maxResults}), stopping search`);
          break;
        }
        
        // API 호출 간 지연 시간을 랜덤화하여 다양성 증가
        const delay = Math.floor(Math.random() * 50) + 30; // 30~80ms 랜덤 지연
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.error(`Error fetching from dictionary API with term ${term}:`, error);
        continue;
      }
    }
    
    console.log(`Total words found: ${words.length}`);
    
    // API에서 충분한 단어를 찾지 못한 경우, 샘플 데이터로 보완
    if (words.length < 20) {
      console.warn(`Not enough words found via API (${words.length}), supplementing with sample data`);
      const sampleWords = sampleKoreanWords[length as keyof typeof sampleKoreanWords] || [];
      
      // 기존 단어와 중복되지 않는 샘플 단어만 추가
      for (const word of sampleWords) {
        if (!words.includes(word)) {
          words.push(word);
        }
      }
      
      console.log(`After supplementing: ${words.length} words`);
    }
    
    // 중복 제거 (Set 활용)
    const uniqueWords = [...new Set(words)];
    console.log(`After removing duplicates: ${uniqueWords.length} unique words`);
    
    // 철저한 무작위화를 위한 다중 셔플 알고리즘 적용
    const multiShuffleArray = (array: string[]): string[] => {
      // Fisher-Yates 셔플
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // 추가 셔플을 위한 분할 및 재결합
      const halfPoint = Math.floor(shuffled.length / 2);
      const firstHalf = shuffled.slice(0, halfPoint);
      const secondHalf = shuffled.slice(halfPoint);
      
      // 각 절반을 독립적으로 다시 셔플
      for (let i = firstHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [firstHalf[i], firstHalf[j]] = [firstHalf[j], firstHalf[i]];
      }
      
      for (let i = secondHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [secondHalf[i], secondHalf[j]] = [secondHalf[j], secondHalf[i]];
      }
      
      // 재결합 (교차 방식으로)
      const result: string[] = [];
      const maxLength = Math.max(firstHalf.length, secondHalf.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (i < firstHalf.length) result.push(firstHalf[i]);
        if (i < secondHalf.length) result.push(secondHalf[i]);
      }
      
      return result;
    };
    
    // 다중 셔플 알고리즘 적용
    const thoroughlyShuffledWords = multiShuffleArray(uniqueWords);
    
    console.log(`Returning ${thoroughlyShuffledWords.length} thoroughly shuffled unique words`);
    return thoroughlyShuffledWords;
    
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

  // 메이플스토리에서는 한 글자 닉네임이 존재하지 않으므로 최소 2글자 이상이어야 함
  if (length < 2 || length > 6) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: length < 2 ? 'Length must be at least 2' : 'Length must be at most 6',
        message: length < 2 ? '메이플스토리 닉네임은 최소 2글자 이상이어야 합니다.' : '메이플스토리 닉네임은 최대 6글자까지 가능합니다.' 
      }),
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
    
    // 최종 필터링: 1글자 단어는 절대 포함되지 않도록 한번 더 확인
    const filteredWords = words.filter(word => word && word.length >= 2);
    console.log(`Filtered out ${words.length - filteredWords.length} words with less than 2 characters`);
    
    // 다중 셔플 알고리즘 적용 (완전한 무작위성 보장)
    const multiShuffleArray = (array: string[]): string[] => {
      // Fisher-Yates 셔플
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // 추가 셔플을 위한 분할 및 재결합
      const chunkSize = Math.ceil(shuffled.length / 4);
      const chunks: string[][] = [];
      
      for (let i = 0; i < shuffled.length; i += chunkSize) {
        chunks.push(shuffled.slice(i, i + chunkSize));
      }
      
      // 각 청크를 독립적으로 다시 셔플
      chunks.forEach(chunk => {
        for (let i = chunk.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [chunk[i], chunk[j]] = [chunk[j], chunk[i]];
        }
      });
      
      // 청크 순서도 셔플
      for (let i = chunks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
      }
      
      // 재결합
      return chunks.flat();
    };
    
    // 다중 셔플 적용
    const thoroughlyShuffledWords = multiShuffleArray(filteredWords);
    
    // 결과 제한
    const limited = thoroughlyShuffledWords.slice(0, count);
    
    // 랜덤 요소 추가를 위한 타임스탬프 생성 (나노초 정밀도 모방)
    const timestamp = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const randomSeed = Math.floor(Math.random() * 100000000).toString();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        words: limited,
        total: thoroughlyShuffledWords.length,
        returned: limited.length,
        length,
        type,
        timestamp: new Date().toISOString(),
        random: timestamp.toString(), 
        seed: randomSeed,
        source: thoroughlyShuffledWords.length > 20 ? "api" : "mixed"
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
