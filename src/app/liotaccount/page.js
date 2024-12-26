"use client"
import { useState } from 'react';

const MatchDetail = ({ match }) => {
  if (!match) return null;
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      {/* Game Info Section */}
      <div className="mb-6">
        <h3 className="font-bold text-xl mb-3">Game Info</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-medium">Game Mode:</span> {match.info.gameMode}
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-medium">Duration:</span> {Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="font-medium">Version:</span> {match.info.gameVersion}
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div>
        <h3 className="font-bold text-xl mb-4">Players</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold">Player</th>
                <th className="px-4 py-3 text-left font-semibold">Champion</th>
                <th className="px-4 py-3 text-center font-semibold">K/D/A</th>
                <th className="px-4 py-3 text-center font-semibold">KDA Ratio</th>
                <th className="px-4 py-3 text-right font-semibold">Damage</th>
                <th className="px-4 py-3 text-right font-semibold">Gold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {match.info.participants.map((participant) => {
                const kda = participant.deaths === 0 
                  ? 'Perfect' 
                  : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);
                
                return (
                  <tr 
                    key={participant.puuid}
                    className={`
                      ${participant.win ? 'bg-blue-50 hover:bg-blue-100' : 'bg-red-50 hover:bg-red-100'}
                      transition-colors duration-150
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{participant.summonerName}</div>
                    </td>
                    <td className="px-4 py-3">
                      {participant.championName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {participant.kills}/{participant.deaths}/{participant.assists}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {kda}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {participant.totalDamageDealtToChampions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {participant.goldEarned.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function RiotAccount() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [summonerDetail, setSummonerDetail] = useState(null);
  const [matchIds, setMatchIds] = useState(null);
  const [matchDetails, setMatchDetails] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMatchDetails = async (matchId) => {
    try {
      const response = await fetch(`/api/match/${matchId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '매치 상세 정보 조회 실패');
      }
      return await response.json();
    } catch (err) {
      console.error(`매치 ${matchId} 조회 중 오류 발생:`, err);
      return null;
    }
  };
  const fetchSummonerInfo = async () => {
    setIsLoading(true);
    setError(null);
    setSummonerDetail(null);
    setMatchIds(null);
    setMatchDetails([]);

    try {
      // Fetch summoner info
      const summonerResponse = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!summonerResponse.ok) {
        const errorData = await summonerResponse.json();
        throw new Error(errorData.error || 'Failed to fetch summoner info');
      }

      const summonerData = await summonerResponse.json();
      setSummonerDetail(summonerData);

      // Fetch match history
      const matchResponse = await fetch(
        `/api/matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch match history');
      }

      const matchData = await matchResponse.json();
      setMatchIds(matchData.matchIds);

      // Fetch details for each match
      const details = await Promise.all(
        matchData.matchIds.slice(0, 5).map(fetchMatchDetails)
      );
      setMatchDetails(details.filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4 flex">
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="Game Name"
          className="mr-2 px-2 py-1 border rounded flex-grow"
        />
        <input
          type="text"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          placeholder="Tag Line"
          className="px-2 py-1 border rounded w-24"
        />
        <button
          onClick={fetchSummonerInfo}
          disabled={isLoading || !gameName || !tagLine}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-4 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {summonerDetail && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h2 className="font-bold text-xl mb-2">Summoner Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-semibold">Name</p>
              <p>{summonerDetail.name}</p>
            </div>
            <div>
              <p className="font-semibold">Level</p>
              <p>{summonerDetail.summonerLevel}</p>
            </div>
          </div>
        </div>
      )}

      {matchDetails.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold text-xl mb-4">Recent Matches</h2>
          {matchDetails.map((match) => (
            <MatchDetail key={match.metadata.matchId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}