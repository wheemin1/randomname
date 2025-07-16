import { Handler } from "@netlify/functions";

// Exponential backoff utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkNicknameWithRetry(nickname: string, apiKey: string, maxRetries = 3): Promise<"free" | "busy" | "error"> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(nickname)}`, {
        headers: {
          'X-NX-Open-API-Key': apiKey,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        // If ocid exists, nickname is busy
        return data.ocid ? "busy" : "free";
      } else if (response.status === 404) {
        // Character not found, nickname is free
        return "free";
      } else if (response.status === 429) {
        // Rate limited, wait and retry
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 8000);
        await delay(waitTime);
        continue;
      } else {
        // Other error
        console.error(`API error for ${nickname}: ${response.status} ${response.statusText}`);
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

// Nexon API key
const NEXON_API_KEY = "test_95b81f8a40b7479fab6776cbb12d379f3e0937352b68c7f95bdebe2a4361e2a8efe8d04e6d233bd35cf2fabdeb93fb0d";

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
    const status = await checkNicknameWithRetry(nickname, apiKey);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        nickname,
        status,
        timestamp: new Date().toISOString(),
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
