"use client"
import { useState } from 'react';
import styles from './liotaccount.module.css';
import Image from 'next/image';

const MatchDetail = ({ match }) => {
  if (!match) return null;
  
  const getChampionImage = (championName) => {
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${championName}.png`;
  };
  
  return (
    <div className={styles.matchDetail}>
      {/* Game Info Section */}
      <div className={styles.gameInfo}>
        <h3 className={styles.sectionTitle}>Game Info</h3>
        <div className={styles.gameInfoGrid}>
          <div className={styles.gameInfoItem}>
            <span className={styles.summonerName}>Game Mode:</span> {match.info.gameMode}
          </div>
          <div className={styles.gameInfoItem}>
            <span className={styles.summonerName}>Duration:</span> {Math.floor(match.info.gameDuration / 60)}m {match.info.gameDuration % 60}s
          </div>
          <div className={styles.gameInfoItem}>
            <span className={styles.summonerName}>Version:</span> {match.info.gameVersion}
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div>
        <h3 className={styles.sectionTitle}>Players</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>Player</th>
                <th className={styles.tableHeaderCell}>Champion</th>
                <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>K/D/A</th>
                <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>KDA Ratio</th>
                <th className={`${styles.tableHeaderCell} ${styles.textRight}`}>Damage</th>
                <th className={`${styles.tableHeaderCell} ${styles.textRight}`}>Gold</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {match.info.participants.map((participant) => {
                const kda = participant.deaths === 0 
                  ? 'Perfect' 
                  : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);
                
                return (
                  <tr 
                    key={participant.puuid}
                    className={`${styles.tableRow} ${participant.win ? styles.winningTeam : styles.losingTeam}`}
                  >
                    <td className={`${styles.tableCell} ${styles.summonerName}`}>
                      {participant.summonerName}
                    </td>
                    <td className={`${styles.tableCell} ${styles.championCell}`}>
                      <div className={styles.championInfo}>
                        <Image
                          src={getChampionImage(participant.championName)}
                          alt={participant.championName}
                          width={32}
                          height={32}
                          className={styles.championImage}
                        />
                        <span>{participant.championName}</span>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.textCenter}`}>
                      {participant.kills}/{participant.deaths}/{participant.assists}
                    </td>
                    <td className={`${styles.tableCell} ${styles.textCenter}`}>
                      {kda}
                    </td>
                    <td className={`${styles.tableCell} ${styles.textRight}`}>
                      {participant.totalDamageDealtToChampions.toLocaleString()}
                    </td>
                    <td className={`${styles.tableCell} ${styles.textRight}`}>
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
  const [inputValue, setInputValue] = useState('');
  const [summonerDetail, setSummonerDetail] = useState(null);
  const [matchIds, setMatchIds] = useState(null);
  const [matchDetails, setMatchDetails] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseInput = (value) => {
    const [gameName, tagLine] = value.split('#');
    return {
      gameName: gameName?.trim() || '',
      tagLine: tagLine ? tagLine.trim() : ''
    };
  };

  const isValidInput = (value) => {
    const { gameName, tagLine } = parseInput(value);
    return gameName && tagLine;
  };

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

    const { gameName, tagLine } = parseInput(inputValue);

    try {
      // Fetch summoner info and match history in parallel
      const [summonerResponse, matchResponse] = await Promise.all([
        fetch(`/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`),
        fetch(`/api/matches?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`)
      ]);

      if (!summonerResponse.ok) {
        const errorData = await summonerResponse.json();
        throw new Error(errorData.error || 'Failed to fetch summoner info');
      }

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch match history');
      }

      const [summonerData, matchData] = await Promise.all([
        summonerResponse.json(),
        matchResponse.json()
      ]);

      setSummonerDetail(summonerData);
      setMatchIds(matchData.matchIds);

      // Fetch match details in parallel
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
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="플레이어 이름 + #KR1"
            className={styles.input}
          />
          {inputValue && !inputValue.includes('#') && (
            <p className={styles.inputHint}>
              Don't forget to add #TagLine
            </p>
          )}
        </div>
        <button
          onClick={fetchSummonerInfo}
          disabled={isLoading || !isValidInput(inputValue)}
          className={styles.searchButton}
        >
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          Error: {error}
        </div>
      )}

      {summonerDetail && (
        <div className={styles.summonerProfile}>
          <h2 className={styles.profileTitle}>Summoner Profile</h2>
          <div className={styles.profileGrid}>
            <div>
              <p className={styles.summonerName}>Name</p>
              <p>{summonerDetail.name}</p>
            </div>
            <div>
              <p className={styles.summonerName}>Level</p>
              <p>{summonerDetail.summonerLevel}</p>
            </div>
          </div>
        </div>
      )}

      {matchDetails.length > 0 && (
        <div className={styles.matchesSection}>
          <h2 className={styles.matchesTitle}>Recent Matches</h2>
          {matchDetails.map((match) => (
            <MatchDetail key={match.metadata.matchId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}