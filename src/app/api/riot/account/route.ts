import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  const RIOT_API_BASE_URL = 'https://asia.api.riotgames.com';

  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');

  if (!gameName || !tagLine) {
    return NextResponse.json({ 
      error: '게임 이름과 태그 라인이 필요합니다.'
    }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `${RIOT_API_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
          'Accept-Language': 'ko-KR',
        }
      }
    );

    return NextResponse.json(response.data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('Riot API Error:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ 
        error: error.response?.data || 'API 요청 중 오류 발생',
        status: error.response?.status || 500
      }, { status: error.response?.status || 500 });
    }

    return NextResponse.json({ 
      error: '알 수 없는 오류 발생' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}