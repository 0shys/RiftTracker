"use client"

import { useState } from 'react';

export default function RiotAccount() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [summonerDetail, setSummonerDetail] = useState(null);
  const [matchIds, setMatchIds] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummonerInfo = async () => {
    setIsLoading(true);
    setError(null);
    setSummonerDetail(null);
    setMatchIds(null);

    try {
      // 소환사 정보 조회
      const summonerResponse = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!summonerResponse.ok) {
        const errorData = await summonerResponse.json();
        throw new Error(errorData.error || '소환사 정보 조회 중 오류가 발생했습니다.');
      }

      const summonerData = await summonerResponse.json();
      setSummonerDetail(summonerData);

      // 매치 기록 조회
      const matchResponse = await fetch(
        `/api/matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || '매치 기록 조회 중 오류가 발생했습니다.');
      }

      const matchData = await matchResponse.json();
      setMatchIds(matchData.matchIds);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4 flex">
        <input
          type='text'
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder='게임 닉네임'
          className="mr-2 px-2 py-1 border rounded flex-grow"
        />
        <input
          type='text'
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          placeholder='태그라인'
          className="px-2 py-1 border rounded w-24"
        />
        <button
          onClick={fetchSummonerInfo}
          disabled={isLoading || !gameName || !tagLine}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '로딩 중...' : '조회'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-4">
          오류: {error}
        </div>
      )}

      {summonerDetail && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">소환사 정보</h2>
          <pre className="overflow-x-auto">
            {JSON.stringify(summonerDetail, null, 2)}
          </pre>
        </div>
      )}

      {matchIds && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">최근 매치 기록</h2>
          <ul className="space-y-2">
            {matchIds.map((matchId, index) => (
              <li key={matchId} className="text-sm">
                {index + 1}. {matchId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}