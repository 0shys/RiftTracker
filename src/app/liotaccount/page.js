"use client"
import { useState } from 'react';
import axios from 'axios';

export default function RiotAccount() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [summonerDetail, setSummonerDetail] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummonerInfo = async () => {
    setIsLoading(true);
    setError(null);
    setSummonerDetail(null);

    try {
      // 먼저 계정 정보(PUUID) 가져오기
      const accountResponse = await axios.get('/api/riot/account', {
        params: { gameName, tagLine }
      });

      // 계정 정보를 기반으로 소환사 상세 정보 가져오기
      const summonerResponse = await axios.get('/api/riot/account', {
        params: { puuid: accountResponse.data.puuid }
      });
      setSummonerDetail(summonerResponse.data);
    } catch (error) {
      console.error('소환사 정보 조회 오류', error);
      setError(error.response?.data?.error || '소환사 정보를 불러오는 데 실패했습니다.');
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
    </div>
  );
}