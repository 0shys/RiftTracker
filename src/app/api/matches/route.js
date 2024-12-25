import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const API_KEY = process.env.RIOT_API_KEY;

  try {
    // 1. Riot ID로 PUUID 조회
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

    // 2. PUUID로 매치 ID 목록 조회
    const matchListResponse = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      {
        headers: {
          'X-Riot-Token': API_KEY
        }
      }
    );

    if (!matchListResponse.ok) {
      throw new Error(`Match List API Error: ${matchListResponse.status}`);
    }

    const matchIds = await matchListResponse.json();
    return NextResponse.json({ matchIds });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}