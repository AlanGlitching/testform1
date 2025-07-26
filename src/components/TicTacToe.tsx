import React, { useState, useEffect } from 'react';
import styles from './TicTacToe.module.css';

interface TicTacToeProps {
  onBack?: () => void;
}

type Player = 'X' | 'O';
type BoardState = (Player | null)[];

const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [gameHistory, setGameHistory] = useState<{ xWins: number; oWins: number; draws: number }>({
    xWins: 0,
    oWins: 0,
    draws: 0
  });

  // Load game history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ticTacToeHistory');
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save game history to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (boardState: BoardState): Player | 'Draw' | null => {
    // Check for winner
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a] as Player;
      }
    }

    // Check for draw
    if (boardState.every(cell => cell !== null)) {
      return 'Draw';
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') {
        setGameHistory(prev => ({ ...prev, xWins: prev.xWins + 1 }));
      } else if (gameWinner === 'O') {
        setGameHistory(prev => ({ ...prev, oWins: prev.oWins + 1 }));
      } else {
        setGameHistory(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const resetHistory = () => {
    setGameHistory({ xWins: 0, oWins: 0, draws: 0 });
    localStorage.removeItem('ticTacToeHistory');
  };

  const getStatusMessage = () => {
    if (winner === 'Draw') {
      return "It's a Draw!";
    } else if (winner) {
      return `Player ${winner} Wins!`;
    } else {
      return `Player ${currentPlayer}'s Turn`;
    }
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winner && winner !== 'Draw' && 
      winningCombinations.some(combination => 
        combination.includes(index) && 
        combination.every(pos => board[pos] === winner)
      );

    return (
      <button
        key={index}
        className={`${styles.cell} ${isWinningCell ? styles.winningCell : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={!!winner || !!value}
      >
        {value && (
          <span className={`${styles.player} ${value === 'X' ? styles.playerX : styles.playerO}`}>
            {value}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⭕ Tic Tac Toe</h1>
        <button className={styles.backButton} onClick={onBack}>
          🎮 Back to Arcade
        </button>
      </div>

      <div className={styles.gameInfo}>
        <div className={styles.status}>{getStatusMessage()}</div>
        
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.playerX}>X</span>
            <span className={styles.scoreValue}>{gameHistory.xWins}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.draw}>Draws</span>
            <span className={styles.scoreValue}>{gameHistory.draws}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.playerO}>O</span>
            <span className={styles.scoreValue}>{gameHistory.oWins}</span>
          </div>
        </div>
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.board}>
          {Array(9).fill(null).map((_, index) => renderCell(index))}
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.resetButton} onClick={resetGame}>
          🎯 New Game
        </button>
        <button className={styles.resetHistoryButton} onClick={resetHistory}>
          📊 Reset History
        </button>
      </div>

      <div className={styles.instructions}>
        <h3>How to Play:</h3>
        <ul>
          <li>Players take turns placing X and O on the board</li>
          <li>Get three in a row (horizontally, vertically, or diagonally) to win</li>
          <li>If all cells are filled without a winner, it's a draw</li>
        </ul>
      </div>
    </div>
  );
};

export default TicTacToe; 