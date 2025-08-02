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
  const [isAITurn, setIsAITurn] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiStartsFirst, setAiStartsFirst] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

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

  // AI Logic Functions
  const getAvailableMoves = (boardState: BoardState): number[] => {
    if (!boardState || boardState.length !== 9) return [];
    return boardState.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
  };

  const makeMove = (boardState: BoardState, index: number, player: Player): BoardState => {
    const newBoard = [...boardState];
    newBoard[index] = player;
    return newBoard;
  };

  // Easy AI: Random moves
  const getEasyAIMove = (boardState: BoardState): number => {
    const availableMoves = getAvailableMoves(boardState);
    if (availableMoves.length === 0) return -1;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Medium AI: Block wins and take wins when possible
  const getMediumAIMove = (boardState: BoardState): number => {
    const availableMoves = getAvailableMoves(boardState);
    if (availableMoves.length === 0) return -1;
    
    try {
      // Check for winning move
      for (const move of availableMoves) {
        const testBoard = makeMove(boardState, move, 'O');
        if (checkWinner(testBoard) === 'O') {
          return move;
        }
      }
      
      // Check for blocking move
      for (const move of availableMoves) {
        const testBoard = makeMove(boardState, move, 'X');
        if (checkWinner(testBoard) === 'X') {
          return move;
        }
      }
      
      // Random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } catch (error) {
      console.error('Medium AI error:', error);
      return availableMoves[0]; // Fallback to first available move
    }
  };

  // Hard AI: Minimax algorithm with fallback
  const getHardAIMove = (boardState: BoardState): number => {
    const availableMoves = getAvailableMoves(boardState);
    if (availableMoves.length === 0) return -1;
    
    try {
      // Enhanced medium AI strategy for "hard" difficulty
      // Check for winning move first
      for (const move of availableMoves) {
        const testBoard = makeMove(boardState, move, 'O');
        if (checkWinner(testBoard) === 'O') {
          return move;
        }
      }
      
      // Check for blocking move
      for (const move of availableMoves) {
        const testBoard = makeMove(boardState, move, 'X');
        if (checkWinner(testBoard) === 'X') {
          return move;
        }
      }
      
      // Strategic moves for early game
      if (availableMoves.length >= 7) {
        // Prefer center, then corners, then edges
        if (availableMoves.includes(4)) return 4; // center
        if (availableMoves.includes(0)) return 0; // corner
        if (availableMoves.includes(2)) return 2; // corner
        if (availableMoves.includes(6)) return 6; // corner
        if (availableMoves.includes(8)) return 8; // corner
      }
      
      // For endgame, try to create fork opportunities
      if (availableMoves.length <= 3) {
        // Look for moves that create multiple winning opportunities
        for (const move of availableMoves) {
          const testBoard = makeMove(boardState, move, 'O');
          let winningOpportunities = 0;
          
          // Check how many winning moves this creates
          for (const nextMove of getAvailableMoves(testBoard)) {
            const nextBoard = makeMove(testBoard, nextMove, 'O');
            if (checkWinner(nextBoard) === 'O') {
              winningOpportunities++;
            }
          }
          
          if (winningOpportunities >= 2) {
            return move;
          }
        }
      }
      
      // Fallback to random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } catch (error) {
      console.error('Hard AI error:', error);
      return availableMoves[0]; // Fallback to first available move
    }
  };

  // Removed minimax function to prevent infinite thinking

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAITurn || !gameStarted || index < 0 || index >= 9) return;

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
      // Switch to AI turn and make move immediately
      setCurrentPlayer('O');
      setIsAITurn(true);
      setIsAILoading(true);
      
      // Make AI move immediately without useEffect
      setTimeout(() => {
        const availableMoves = getAvailableMoves(newBoard);
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const aiBoard = [...newBoard];
          aiBoard[randomMove] = 'O';
          setBoard(aiBoard);
          
          const aiWinner = checkWinner(aiBoard);
          if (aiWinner) {
            setWinner(aiWinner);
            if (aiWinner === 'X') {
              setGameHistory(prev => ({ ...prev, xWins: prev.xWins + 1 }));
            } else if (aiWinner === 'O') {
              setGameHistory(prev => ({ ...prev, oWins: prev.oWins + 1 }));
            } else {
              setGameHistory(prev => ({ ...prev, draws: prev.draws + 1 }));
            }
          } else {
            setCurrentPlayer('X');
          }
        }
        setIsAITurn(false);
        setIsAILoading(false);
      }, 300);
    }
  };

  // Removed problematic useEffect - AI moves are now handled directly in handleCellClick

  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameStarted(true);
    
    // If AI starts first, make AI move immediately
    if (aiStartsFirst) {
      setIsAITurn(true);
      setIsAILoading(true);
      
      setTimeout(() => {
        const availableMoves = getAvailableMoves(Array(9).fill(null));
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const aiBoard = Array(9).fill(null);
          aiBoard[randomMove] = 'O';
          setBoard(aiBoard);
          setCurrentPlayer('X');
        }
        setIsAITurn(false);
        setIsAILoading(false);
      }, 300);
    }
  };

  const resetHistory = () => {
    setGameHistory({ xWins: 0, oWins: 0, draws: 0 });
    localStorage.removeItem('ticTacToeHistory');
    setGameStarted(false);
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsAITurn(false);
  };

  const getStatusMessage = () => {
    if (!gameStarted) {
      return 'Choose who starts first!';
    } else if (winner === 'Draw') {
      return "It's a Draw!";
    } else if (winner) {
      if (winner === 'X') {
        return 'You Win! 🎉';
      } else if (winner === 'O') {
        return 'AI Wins! 🤖';
      }
      return `Player ${winner} Wins!`;
    } else {
      if (isAITurn) {
        return isAILoading ? `AI is thinking (${aiDifficulty} difficulty)... ⏳ [LOADING]` : 'AI is thinking... 🤔';
      } else if (currentPlayer === 'X') {
        return 'Your Turn (X)';
      } else {
        return 'AI Turn (O)';
      }
    }
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winner && winner !== 'Draw' && 
      winningCombinations.some(combination => 
        combination.includes(index) && 
        combination.every(pos => board[pos] === winner)
      );
    const isDisabled = !!winner || !!value || isAITurn || !gameStarted || isAILoading;

    return (
      <button
        key={index}
        className={`${styles.cell} ${isWinningCell ? styles.winningCell : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={isDisabled}
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
            <span className={styles.playerX}>You</span>
            <span className={styles.scoreValue}>{gameHistory.xWins}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.draw}>Draws</span>
            <span className={styles.scoreValue}>{gameHistory.draws}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.playerO}>AI</span>
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
        <div className={styles.difficultySelector}>
          <label>AI Difficulty:</label>
          <select 
            value={aiDifficulty} 
            onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className={styles.difficultySelect}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        {gameStarted && (
          <div className={styles.settingsInfo}>
            💡 You can change settings anytime - click the buttons above to restart with new settings
          </div>
        )}
        
        <div className={styles.startButtons}>
          <button 
            className={`${styles.startButton} ${!aiStartsFirst ? styles.activeButton : ''}`}
            onClick={() => {
              setAiStartsFirst(false);
              startNewGame();
            }}
          >
            🎮 You Start First
          </button>
          <button 
            className={`${styles.startButton} ${aiStartsFirst ? styles.activeButton : ''}`}
            onClick={() => {
              setAiStartsFirst(true);
              startNewGame();
            }}
          >
            🤖 AI Starts First
          </button>
        </div>
        
        {gameStarted && (
          <button className={styles.resetButton} onClick={startNewGame}>
            🎯 New Game
          </button>
        )}
        {(isAILoading || isAITurn) && (
          <button 
            className={styles.resetButton} 
            onClick={() => {
              console.log('Emergency reset triggered');
              setIsAITurn(false);
              setIsAILoading(false);
              setCurrentPlayer('X');
              // Force a random move to unstick the game
              const availableMoves = getAvailableMoves(board);
              if (availableMoves.length > 0) {
                const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                const newBoard = [...board];
                newBoard[randomMove] = 'O';
                setBoard(newBoard);
                console.log('Emergency move made:', randomMove);
              }
            }}
            style={{ backgroundColor: '#ff4444', color: 'white', fontWeight: 'bold' }}
          >
            🚨 Force Stop AI & Make Move
          </button>
        )}
        <button className={styles.resetHistoryButton} onClick={resetHistory}>
          📊 Reset History
        </button>
        <button 
          className={styles.resetButton} 
          onClick={() => setDebugMode(!debugMode)}
          style={{ backgroundColor: debugMode ? '#44ff44' : '#444444', color: 'white' }}
        >
          {debugMode ? '🐛 Debug ON' : '🐛 Debug OFF'}
        </button>
        <button 
          className={styles.resetButton} 
          onClick={() => {
            setIsAITurn(true);
            setIsAILoading(true);
          }}
          style={{ backgroundColor: '#ff8800', color: 'white' }}
        >
          🧪 Test AI Loading
        </button>
        <button 
          className={styles.resetButton} 
          onClick={() => {
            const availableMoves = getAvailableMoves(board);
            if (availableMoves.length > 0) {
              const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
              const newBoard = [...board];
              newBoard[randomMove] = 'O';
              setBoard(newBoard);
              setCurrentPlayer('X');
            }
          }}
          style={{ backgroundColor: '#0088ff', color: 'white' }}
        >
          🤖 Manual AI Move
        </button>
        <button 
          className={styles.resetButton} 
          onClick={() => {
            console.log('Complete game reset');
            setIsAITurn(false);
            setIsAILoading(false);
            setGameStarted(false);
            setBoard(Array(9).fill(null));
            setCurrentPlayer('X');
            setWinner(null);
          }}
          style={{ backgroundColor: '#880000', color: 'white' }}
        >
          🔄 Complete Reset
        </button>
      </div>

      <div className={styles.instructions}>
        <h3>How to Play:</h3>
        <ul>
          <li>You play as X against the AI (O)</li>
          <li>Choose who starts first: You or the AI</li>
          <li>Get three in a row (horizontally, vertically, or diagonally) to win</li>
          <li>If all cells are filled without a winner, it's a draw</li>
          <li>Choose AI difficulty: Easy (random), Medium (blocks wins), or Hard (unbeatable)</li>
          <li>You can change settings anytime during the game</li>
        </ul>
      </div>
    </div>
  );
};

export default TicTacToe; 