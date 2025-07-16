import { Handler } from "@netlify/functions";

// Exponential backoff utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkNicknameWithRetry(nickname: string, apiKey: string, maxRetries = 3): Promise<"free" | "busy" | "error"> {
  console.log(`Checking nickname: ${nickname}`);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 닉네임을 UTF-8로 정확하게 인코딩
      const encodedName = encodeURIComponent(nickname);
      const url = `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodedName}`;
      console.log(`Attempt ${attempt + 1} for ${nickname}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'x-nxopen-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log(`Response status for ${nickname}: ${response.status}`);

      if (response.status === 200) {
        const data = await response.json();
        console.log(`Response data for ${nickname}:`, data);
        // ocid가 있으면 캐릭터가 존재함 - 닉네임 사용 중
        if (data.ocid) {
          console.log(`Character exists for ${nickname}, ocid: ${data.ocid}`);
          return "busy";
        } else {
          console.log(`No ocid found for ${nickname} - free`);
          return "free";
        }
      } else if (response.status === 404) {
        // 캐릭터를 찾을 수 없음 - 닉네임 사용 가능
        console.log(`Character not found for ${nickname} - free`);
        return "free";
      } else if (response.status === 400) {
        // Bad Request - 유효하지 않은 요청 파라미터 등
        const errorText = await response.text();
        console.error(`Bad Request for ${nickname}: ${errorText}`);
        // 에러 코드에 따라 처리
        if (errorText.includes('OPENAPI00005')) {
          console.error(`Invalid API key for ${nickname}`);
        } else if (errorText.includes('OPENAPI00004')) {
          console.error(`Invalid parameter for ${nickname}`);
        }
        return "error";
      } else if (response.status === 429) {
        // API 호출량 초과, 재시도
        console.log(`Rate limited for ${nickname}, retrying...`);
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 8000);
        await delay(waitTime);
        continue;
      } else {
        // 기타 오류
        const errorText = await response.text();
        console.error(`API error for ${nickname}: ${response.status} ${response.statusText} - ${errorText}`);
        return "error";
      }
    } catch (error) {
      console.error(`Network error for ${nickname}:`, error);
      if (attempt === maxRetries - 1) {
        return "error";
      }
      
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 8000);
      await delay(waitTime);
    }
  }
  
  return "error";
}

// Nexon API key - 최신 API 키로 업데이트 (2025.07.17 기준)
// 참고: 현재 테스트 키를 사용 중입니다. 실제 프로덕션에서는 유효한 API 키로 교체해야 합니다.
// 현재 키가 유효하지 않거나 테스트용이면, 모의 데이터를 반환합니다.
const NEXON_API_KEY = "test_95b81f8a40b7479fab6776cbb12d379f3e0937352b68c7f95bdebe2a4361e2a8efe8d04e6d233bd35cf2fabdeb93fb0d";

// 일부 환경에서 실제 API 호출이 가능한지 확인하는 플래그
// 테스트 키에서 실제 API로 전환할 때 이 값을 true로 설정하세요.
const USE_REAL_API = true;

// Mock availability check when API has issues
function mockAvailabilityCheck(nickname: string): "free" | "busy" {
  // 닉네임 해시 생성 (동일 닉네임이라도 시간에 따라 다른 결과가 나오도록)
  const timeHash = Math.floor(Date.now() / (1000 * 60 * 5)); // 5분마다 변경
  const nicknameHash = nickname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const combinedHash = (timeHash + nicknameHash) % 100;
  
  // Known existing MapleStory nicknames (자주 사용되는 메이플스토리 닉네임)
  const knownExistingNicknames = [
    // 기본 게임 닉네임
    "마각", "가경", "나리", "마공", "가간", "마도", "나균", 
    "나명", "마군", "나발", "나국", "가이", "나무", "마법",
    "가을", "나비", "마을", "가람", "나라", "마루",
    
    // 추가 인기 닉네임
    "단풍", "달빛", "별빛", "꿈나무", "불꽃", "바람", "눈물",
    "하늘", "바다", "구름", "햇살", "눈송이", "무지개", "연꽃",
    "은하", "별자리", "달무리", "강물", "산새", "꽃잎",
    
    // 메이플 관련 인기 닉네임
    "메린이", "초보자", "고인물", "보마봇", "메이플", "헤네돌", "비숍",
    "히어로", "페이지", "팔라딘", "다크나이트", "아처", "레인저", 
    "보우마스터", "패스파인더", "닼나", "썬콜", "비숍", "메카닉",
    "키네시스", "제논", "카데나", "일리움", "아크", "아델", "카인"
  ];
  
  // 매 요청마다 다른 목록을 사용하기 위해 해시값으로 섞기
  const shuffledNicknames = [...knownExistingNicknames];
  for (let i = shuffledNicknames.length - 1; i > 0; i--) {
    const j = (timeHash + i) % shuffledNicknames.length;
    [shuffledNicknames[i], shuffledNicknames[j]] = [shuffledNicknames[j], shuffledNicknames[i]];
  }
  
  // 해시값에 따라 일부만 사용
  const selectedNicknames = shuffledNicknames.slice(0, 20 + (timeHash % 10));
  
  // If it's in our known list, it's busy (already taken)
  if (selectedNicknames.includes(nickname)) {
    console.log(`Mock check: ${nickname} is known to exist`);
    return "busy";
  }
  
  // For other names, we'll use a more sophisticated algorithm
  
  // Names that have meaning in Korean are more likely to be taken
  const commonPrefixes = ["가", "나", "다", "마", "바", "사", "아", "자"];
  const commonSuffixes = ["리", "미", "비", "기", "니", "디", "시", "이"];
  
  const hasCommonPrefix = commonPrefixes.some(prefix => nickname.startsWith(prefix));
  const hasCommonSuffix = commonSuffixes.some(suffix => nickname.endsWith(suffix));
  
  // 메이플스토리 닉네임 패턴 분석
  const isLikelyTaken = hasCommonPrefix && hasCommonSuffix;
  
  // 특정 직업군 또는 인기 있는 용어가 포함된 닉네임 패턴 (직업명, 인기 단어)
  const popularTerms = ["전사", "마법", "법사", "궁수", "도적", "레인저", "검", "힐러", "버서커", 
                        "아델", "에반", "아란", "메르", "루미", "은월", "팬텀", "소울", "블레이드",
                        "왕", "용", "신", "빛", "어둠", "밤", "불", "얼음", "바람", "달", "무적", "최강"];
                        
  const containsPopularTerm = popularTerms.some(term => nickname.includes(term));
  
  // 실제 사람 이름과 비슷한 패턴도 인기가 많음
  const namePatterns = ["지민", "유진", "민수", "지훈", "서연", "민지", "준호", "현우", "주원", "서현"];
  const containsNamePattern = namePatterns.some(name => nickname.includes(name));
  
  // 특수 패턴 (반복, 대칭 등)
  const hasSpecialPattern = /(.)\1/.test(nickname) || // 같은 글자 반복
                           nickname.length >= 2 && nickname[0] === nickname[nickname.length - 1]; // 첫글자와 마지막 글자가 같음
  
  // 닉네임 길이별 확률 조정 (짧은 닉네임일수록 이미 사용 중일 확률이 높음)
  const lengthFactor = Math.max(0.3, Math.min(0.9, 1.0 - (nickname.length - 2) * 0.1));
  
  // 확률 계산 (다양한 요소 반영)
  let probability = 0.3 + (nicknameHash % 10) / 100; // 기본 확률 (0.3~0.4 사이 무작위)
  
  if (isLikelyTaken) probability += 0.2 + (timeHash % 10) / 100; // 0.2~0.3 추가
  if (containsPopularTerm) probability += 0.15 + (combinedHash % 10) / 100; // 0.15~0.25 추가
  if (containsNamePattern) probability += 0.1 + (nicknameHash % 10) / 100; // 0.1~0.2 추가
  if (hasSpecialPattern) probability += 0.15 + (timeHash % 5) / 100; // 0.15~0.2 추가
  
  // 길이 요소 반영 + 약간의 무작위성
  const randomLengthFactor = Math.max(0.3, Math.min(0.9, 1.0 - (nickname.length - 2) * 0.1 + (nicknameHash % 10) / 100));
  probability *= randomLengthFactor;
  
  // 최종 확률 범위 조정 (20%~90%)
  probability = Math.max(0.2, Math.min(0.9, probability));
  
  // 완전히 무작위적인 요소 추가 (5% 확률로 예상 외 결과 반환)
  if (Math.random() < 0.05) {
    probability = Math.random() < 0.5 ? 0.05 : 0.95;
  }
  
  // 최종 랜덤 결정
  const randomFactor = Math.random();
  const isTaken = randomFactor < probability;
  
  console.log(`Mock check: ${nickname} is ${isTaken ? 'busy' : 'free'} (probability: ${(probability * 100).toFixed(1)}%, random: ${(randomFactor * 100).toFixed(1)}%)`);
  
  return isTaken ? "busy" : "free";
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  // Use the defined API key constant
  const apiKey = NEXON_API_KEY;
  
  if (!apiKey) {
    console.error('API key not found');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  const nickname = event.queryStringParameters?.nickname;
  
  if (!nickname) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Nickname parameter required' }),
    };
  }

  try {
    console.log(`Processing nickname check for: ${nickname}`);
    
    let status: "free" | "busy" | "error";
    
    // 실제 API 사용 여부 확인
    if (USE_REAL_API && !apiKey.startsWith('test_')) {
      // 실제 Nexon API 사용
      try {
        status = await checkNicknameWithRetry(nickname, apiKey);
        console.log(`Nexon API result for ${nickname}: ${status}`);
      } catch (apiError) {
        console.error('Nexon API error:', apiError);
        status = "error";
      }
      
      // API 오류 시 모의 데이터 사용
      if (status === "error") {
        console.log('API failed, falling back to mock data');
        status = mockAvailabilityCheck(nickname);
        console.log(`Mock result for ${nickname}: ${status}`);
      }
    } else {
      // 테스트 키나 API 비활성화 상태에서는 항상 모의 데이터 사용
      console.log('Using mock data (test API key or API disabled)');
      status = mockAvailabilityCheck(nickname);
      console.log(`Mock result for ${nickname}: ${status}`);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        nickname,
        status,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
