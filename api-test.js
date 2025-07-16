// 국립국어원 API 직접 테스트 스크립트
const DICTIONARY_API_BASE_URL = "https://stdict.korean.go.kr/api/search.do";
const DICTIONARY_API_KEY = "4F4CF13529EABE510F4D67ACA4557923"; // 국립국어원 API 키

// 테스트 함수
async function testDictionaryAPI() {
  console.log("테스트 시작: 국립국어원 API 직접 호출");
  
  const term = "나";
  const length = 3;
  
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
    console.log(`응답 미리보기: ${text.substring(0, 500)}...`);
    
    try {
      const data = JSON.parse(text);
      if (data.error) {
        console.error(`API 에러: ${data.error.error_code} - ${data.error.message}`);
      } else if (data.channel?.item) {
        const items = Array.isArray(data.channel.item) ? data.channel.item : [data.channel.item];
        console.log(`총 ${items.length}개 항목 찾음`);
        
        const words = [];
        for (const item of items) {
          if (item.word && item.word.length === length) {
            if (/^[가-힣]+$/.test(item.word)) {
              words.push(item.word);
              console.log(`단어: ${item.word}, 품사: ${item.pos}`);
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

// 테스트 실행
(async () => {
  try {
    await testDictionaryAPI();
  } catch (error) {
    console.error("테스트 실행 오류:", error);
  }
})();
