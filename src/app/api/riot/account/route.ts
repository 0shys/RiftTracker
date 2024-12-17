import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 계정 정보 조회 라우트
export async function GET(request: NextRequest) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  const RIOT_API_BASE_URL = 'https://asia.api.riotgames.com';

  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const puuid = searchParams.get('puuid');

  // 계정 정보 조회 (RiotID로)
  if (gameName && tagLine) {
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
      console.error('Riot Account API Error:', error);
      return handleApiError(error);
    }
  }

  // // 소환사 정보 조회 (PUUID로)
  // if (puuid) {
  //   try {
  //     const response = await axios.get(
  //       `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
  //       {
  //         headers: {
  //           'X-Riot-Token': RIOT_API_KEY,
  //           'Accept-Language': 'ko-KR',
  //         }
  //       }
  //     );

  //     return NextResponse.json(response.data, {
  //       headers: {
  //         'Access-Control-Allow-Origin': '*',
  //         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  //         'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Riot Summoner API Error:', error);
  //     return handleApiError(error);
  //   }
  // }

  
  // 매치 id 조회 (puuid)
  if(puuid){
    try {
      const response = await axios.get(
        `https://asia.api.riotgames.com/riot/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}/ids`,
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
      console.error('Riot Summoner API Error:', error);
      return handleApiError(error);
    }
  }

  // 파라미터가 없을 경우 400 에러
  return NextResponse.json({
    error: '게임 이름/태그 라인 또는 PUUID가 필요합니다.'
  }, { status: 400 });
}

// 공통 에러 핸들링 함수
function handleApiError(error: any) {
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

// CORS 대응을 위한 OPTIONS 핸들러
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}