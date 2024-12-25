import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  
  const API_KEY = process.env.RIOT_API_KEY; 

  try {
    // 1단계: Riot ID로 PUUID 조회
    const riotIdResponse = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          'X-Riot-Token': API_KEY
        }
      }
    );

    if (!riotIdResponse.ok) {
      throw new Error(`Riot ID API Error: ${riotIdResponse.status}`);
    }

    const riotIdData = await riotIdResponse.json();
    const puuid = riotIdData.puuid;

    // 2단계: PUUID로 소환사 정보 조회
    const summonerResponse = await fetch(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': API_KEY
        }
      }
    );

    if (!summonerResponse.ok) {
      throw new Error(`Summoner API Error: ${summonerResponse.status}`);
    }

    const summonerData = await summonerResponse.json();
    return NextResponse.json(summonerData);

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}