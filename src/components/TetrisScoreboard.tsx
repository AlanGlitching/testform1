import React, { useState, useEffect } from 'react';
import styles from './TetrisScoreboard.module.css';

interface TetrisScore {
  id: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  duration: number; // in seconds
}

interface TetrisStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  gamesPlayed: number;
  totalLines: number;
  averageLines: number;
  bestLines: number;
  totalLevels: number;
  averageLevel: number;
  bestLevel: number;
  totalDuration: number;
  averageDuration: number;
}

const TetrisScoreboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [scores, setScores] = useState<TetrisScore[]>([]);
  const [stats, setStats] = useState<TetrisStats>({
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    gamesPlayed: 0,
    totalLines: 0,
    averageLines: 0,
    bestLines: 0,
    totalLevels: 0,
    averageLevel: 0,
    bestLevel: 0,
    totalDuration: 0,
    averageDuration: 0
  });
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'level' | 'lines'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = () => {
    const savedScores = localStorage.getItem('tetrisScores');
    const savedStats = localStorage.getItem('tetrisGameStats');
    
    if (savedScores) {
      const parsedScores = JSON.parse(savedScores);
      setScores(parsedScores);
      
      // Calculate comprehensive stats
      if (parsedScores.length > 0) {
        const totalScore = parsedScores.reduce((sum: number, score: TetrisScore) => sum + score.score, 0);
        const totalLines = parsedScores.reduce((sum: number, score: TetrisScore) => sum + score.lines, 0);
        const totalLevels = parsedScores.reduce((sum: number, score: TetrisScore) => sum + score.level, 0);
        const totalDuration = parsedScores.reduce((sum: number, score: TetrisScore) => sum + score.duration, 0);
        const bestScore = Math.max(...parsedScores.map((s: TetrisScore) => s.score));
        const bestLines = Math.max(...parsedScores.map((s: TetrisScore) => s.lines));
        const bestLevel = Math.max(...parsedScores.map((s: TetrisScore) => s.level));
        
        setStats({
          totalGames: parsedScores.length,
          totalScore,
          averageScore: Math.round(totalScore / parsedScores.length),
          bestScore,
          gamesPlayed: parsedScores.length,
          totalLines,
          averageLines: Math.round(totalLines / parsedScores.length),
          bestLines,
          totalLevels,
          averageLevel: Math.round(totalLevels / parsedScores.length),
          bestLevel,
          totalDuration,
          averageDuration: Math.round(totalDuration / parsedScores.length)
        });
      }
    }
    
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setStats(prev => ({ ...prev, ...parsedStats }));
    }
  };

  const clearAllScores = () => {
    if (window.confirm('Are you sure you want to clear all scores? This action cannot be undone.')) {
      localStorage.removeItem('tetrisScores');
      localStorage.removeItem('tetrisHighScore');
      localStorage.removeItem('tetrisGameStats');
      setScores([]);
      setStats({
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        gamesPlayed: 0,
        totalLines: 0,
        averageLines: 0,
        bestLines: 0,
        totalLevels: 0,
        averageLevel: 0,
        bestLevel: 0,
        totalDuration: 0,
        averageDuration: 0
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedScores = [...scores].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'level':
        comparison = a.level - b.level;
        break;
      case 'lines':
        comparison = a.lines - b.lines;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🟦 Tetris Scoreboard</h1>
        <button className={styles.backButton} onClick={onBack}>
          🎮 Back to Arcade
        </button>
      </div>

      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.bestScore}</div>
          <div className={styles.statLabel}>Best Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.bestLines}</div>
          <div className={styles.statLabel}>Best Lines</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.bestLevel}</div>
          <div className={styles.statLabel}>Best Level</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalGames}</div>
          <div className={styles.statLabel}>Games Played</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.averageScore}</div>
          <div className={styles.statLabel}>Avg Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.averageLines}</div>
          <div className={styles.statLabel}>Avg Lines</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.averageLevel}</div>
          <div className={styles.statLabel}>Avg Level</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatDuration(stats.averageDuration)}</div>
          <div className={styles.statLabel}>Avg Duration</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'level' | 'lines')}
            className={styles.sortSelect}
          >
            <option value="score">Score</option>
            <option value="lines">Lines</option>
            <option value="level">Level</option>
            <option value="date">Date</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={styles.sortButton}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <button onClick={clearAllScores} className={styles.clearButton}>
          🗑️ Clear All Scores
        </button>
      </div>

      <div className={styles.scoreboard}>
        <div className={styles.scoreboardHeader}>
          <div className={styles.rankHeader}>Rank</div>
          <div className={styles.scoreHeader}>Score</div>
          <div className={styles.linesHeader}>Lines</div>
          <div className={styles.levelHeader}>Level</div>
          <div className={styles.durationHeader}>Duration</div>
          <div className={styles.dateHeader}>Date</div>
        </div>
        
        {sortedScores.length === 0 ? (
          <div className={styles.noScores}>
            <p>No scores recorded yet!</p>
            <p>Play some games to see your scores here.</p>
          </div>
        ) : (
          <div className={styles.scoresList}>
            {sortedScores.map((score, index) => (
              <div key={score.id} className={styles.scoreRow}>
                <div className={styles.rank}>#{index + 1}</div>
                <div className={styles.score}>{score.score}</div>
                <div className={styles.lines}>{score.lines}</div>
                <div className={styles.level}>{score.level}</div>
                <div className={styles.duration}>{formatDuration(score.duration)}</div>
                <div className={styles.date}>{formatDate(score.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TetrisScoreboard; 