export async function GET(request, { params }) {
    const { matchId } = params;
    
    try {
      const response = await fetch(
        `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('매치 데이터를 가져오는데 실패했습니다');
      }
  
      const matchData = await response.json();
      return Response.json(matchData);
    } catch (error) {
      console.error('매치 데이터 조회 오류:', error);
      return new Response(
        JSON.stringify({ error: '매치 데이터를 가져오는데 실패했습니다' }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }