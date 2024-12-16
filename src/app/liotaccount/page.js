'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Liotaccount() {
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');

  const fetchAccountByRiotId = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/riot/account', {
        params: { gameName, tagLine }
      });
      setAccountData(response.data);
    } catch (error) {
      console.error('Account fetch error:', error);
      setError(error.response?.data?.error || '계정 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
        <input type='text' value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder='게임 닉네임'  />
        <input type='text' value={tagLine} onChange={(e) => setTagLine(e.target.value)} placeholder='태그라인' />
      <button 
        onClick={fetchAccountByRiotId} 
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '로딩 중...' : '계정 정보 가져오기'}
      </button>

      {error && (
        <div className="text-red-500 mt-4">
          오류: {error}
        </div>
      )}

      {accountData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">계정 정보</h2>
          <pre className="mt-2 overflow-x-auto">
            {JSON.stringify(accountData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}