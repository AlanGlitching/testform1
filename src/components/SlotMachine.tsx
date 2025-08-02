import { useState, useEffect } from 'react';

interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  value: number;
  color: string;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'seven', name: 'Seven', emoji: '7️⃣', value: 200, color: '#ff6b6b' },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', value: 100, color: '#ff8e8e' },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', value: 50, color: '#ffeb3b' },
  { id: 'orange', name: 'Orange', emoji: '🍊', value: 25, color: '#ff9800' },
  { id: 'plum', name: 'Plum', emoji: '🫐', value: 15, color: '#9c27b0' },
  { id: 'bell', name: 'Bell', emoji: '🔔', value: 10, color: '#ffc107' },
  { id: 'bar', name: 'Bar', emoji: '🍺', value: 5, color: '#4caf50' },
];

// Casino-style win rate control
const CASINO_WIN_RATE = 0.0000001; // 0.00001% win rate (practically zero for ALL wins)
const JACKPOT_CHANCE = 0.00000001; // 0.000001% chance for jackpot (never happens)

// Weighted symbol selection for lower win rates
const getRandomSymbol = () => {
  const weights = [2, 3, 4, 5, 6, 8, 15]; // More balanced but still favors lower values
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return SLOT_SYMBOLS[i];
    }
  }
  return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1]; // Fallback to bar
};

// Generate reels with controlled win rate
const generateCasinoReels = (): string[][] => {
  const random = Math.random();
  
  // 0.000001% chance for jackpot (three 7️⃣ symbols)
  if (random < JACKPOT_CHANCE) {
    return [
      ['7️⃣', '7️⃣', '7️⃣'],
      ['7️⃣', '7️⃣', '7️⃣'],
      ['7️⃣', '7️⃣', '7️⃣']
    ];
  }
  
  // 0.00001% chance of a regular win
  if (random < CASINO_WIN_RATE + JACKPOT_CHANCE) {
    // Generate a winning combination
    const winningSymbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    
    // Choose a random winning line (horizontal or diagonal)
    const winType = Math.floor(Math.random() * 5); // 0-4: 3 horizontals + 2 diagonals
    
    const reels = [
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji],
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji],
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji]
    ];
    
    // Apply winning symbol to the chosen line
    if (winType < 3) {
      // Horizontal line
      const row = winType;
      reels[0][row] = winningSymbol.emoji;
      reels[1][row] = winningSymbol.emoji;
      reels[2][row] = winningSymbol.emoji;
    } else {
      // Diagonal line
      const diagonal = winType - 3;
      if (diagonal === 0) {
        // Top-left to bottom-right
        reels[0][0] = winningSymbol.emoji;
        reels[1][1] = winningSymbol.emoji;
        reels[2][2] = winningSymbol.emoji;
      } else {
        // Top-right to bottom-left
        reels[0][2] = winningSymbol.emoji;
        reels[1][1] = winningSymbol.emoji;
        reels[2][0] = winningSymbol.emoji;
      }
    }
    
    return reels;
  } else {
    // 99.99999% chance of no win - generate random non-winning reels
    return [
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji],
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji],
      [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji]
    ];
  }
};

interface SlotMachineProps {
  onBack: () => void;
}

const SlotMachine = ({ onBack }: SlotMachineProps) => {
  const [credits, setCredits] = useState(0);
  const [bet, setBet] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['7️⃣', '🍒', '🍋'],
    ['🍊', '🫐', '🔔'],
    ['🍺', '7️⃣', '🍒']
  ]);
  const [spinningReels, setSpinningReels] = useState<string[][]>([
    ['7️⃣', '🍒', '🍋'],
    ['🍊', '🫐', '🔔'],
    ['🍺', '7️⃣', '🍒']
  ]);
  const [winAmount, setWinAmount] = useState(0);
  const [winLines, setWinLines] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStats, setGameStats] = useState({
    totalSpins: 0,
    totalWon: 0,
    totalBet: 0,
    biggestWin: 0
  });
  const [jackpot, setJackpot] = useState(10000); // Progressive jackpot starts at 10,000

  // Initialize stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('slotMachineStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('slotMachineStats', JSON.stringify(gameStats));
  }, [gameStats]);

  const playSound = (soundName: string) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency = 440;
    let duration = 0.1;
    
    switch (soundName) {
      case 'spin':
        frequency = 800;
        duration = 0.2;
        break;
      case 'win':
        frequency = 1200;
        duration = 0.3;
        break;
      case 'bigWin':
        frequency = 1500;
        duration = 0.5;
        break;
      case 'click':
        frequency = 600;
        duration = 0.1;
        break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const spin = () => {
    if (isSpinning || credits < bet) return;
    
    playSound('spin');
    setIsSpinning(true);
    setWinAmount(0);
    setWinLines([]);
    
    // Deduct bet
    setCredits(prev => prev - bet);
    setGameStats(prev => ({
      ...prev,
      totalSpins: prev.totalSpins + 1,
      totalBet: prev.totalBet + bet
    }));

    // Start spinning animation
    const spinInterval = setInterval(() => {
      setSpinningReels(prev => prev.map(reel => 
        reel.map(() => getRandomSymbol().emoji)
      ));
    }, 100);

    // Stop spinning after 2 seconds and show final result
    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Generate final reels with controlled win rate
      const newReels = generateCasinoReels();
      
      setReels(newReels);
      setSpinningReels(newReels);
      
      // Check for wins
      const wins = checkWins(newReels);
      let totalWin = wins.reduce((sum, win) => sum + win.amount, 0);
      
      // Check for jackpot (all 7️⃣ symbols)
      const isJackpot = newReels.every(reel => reel.every(symbol => symbol === '7️⃣'));
      if (isJackpot) {
        totalWin = jackpot;
        setJackpot(10000); // Reset jackpot
        playSound('bigWin');
      } else {
        // Increase jackpot by 1% of bet
        setJackpot(prev => prev + Math.floor(bet * 0.01));
      }
      
      if (totalWin > 0) {
        setWinAmount(totalWin);
        setWinLines(wins.map(win => win.line));
        setCredits(prev => prev + totalWin);
        
        if (isJackpot) {
          playSound('bigWin');
        } else if (totalWin >= bet * 10) {
          playSound('bigWin');
        } else {
          playSound('win');
        }
        
        setGameStats(prev => ({
          ...prev,
          totalWon: prev.totalWon + totalWin,
          biggestWin: Math.max(prev.biggestWin, totalWin)
        }));
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  const checkWins = (currentReels: string[][]) => {
    const wins: { line: number; amount: number; symbol: string }[] = [];
    
    // Check horizontal lines (middle row is most important)
    for (let row = 0; row < 3; row++) {
      const symbols = currentReels.map(reel => reel[row]);
      const symbol = symbols[0];
      
      if (symbols.every(s => s === symbol)) {
        const symbolData = SLOT_SYMBOLS.find(s => s.emoji === symbol);
        if (symbolData) {
          wins.push({
            line: row,
            amount: symbolData.value * bet, // Full bet multiplier
            symbol: symbol
          });
        }
      }
    }
    
    // Check diagonal lines (top-left to bottom-right)
    const diagonal1 = [currentReels[0][0], currentReels[1][1], currentReels[2][2]];
    const diagonal2 = [currentReels[0][2], currentReels[1][1], currentReels[2][0]];
    
    [diagonal1, diagonal2].forEach((diagonal, index) => {
      const symbol = diagonal[0];
      if (diagonal.every(s => s === symbol)) {
        const symbolData = SLOT_SYMBOLS.find(s => s.emoji === symbol);
        if (symbolData) {
          wins.push({
            line: index === 0 ? 3 : 4, // Diagonal lines
            amount: symbolData.value * bet, // Full bet multiplier
            symbol: symbol
          });
        }
      }
    });
    
    return wins;
  };

  const resetStats = () => {
    setGameStats({
      totalSpins: 0,
      totalWon: 0,
      totalBet: 0,
      biggestWin: 0
    });
    localStorage.removeItem('slotMachineStats');
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
  };

  const addCustomCredits = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0 && amount <= 10000) {
      setCredits(prev => prev + amount);
      setCustomAmount('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a1c1c 50%, #1a0f0f 100%)',
      color: 'white',
      padding: '16px',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        width: '100%'
      }}>
              <h1 style={{ 
        fontSize: '2.5rem', 
        margin: '8px 0', 
        color: '#ffd700', 
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        🎰 777 SLOT MACHINE 🎰
      </h1>
      <div style={{
        fontSize: '0.9rem',
        color: '#ccc',
        textAlign: 'center',
        marginBottom: '8px',
        fontStyle: 'italic'
      }}>
        🎲 NEVER WIN - 0.00001% Win Rate 🎲
      </div>
        
        {/* Control Buttons */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button onClick={onBack} style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(145deg, #555, #444)',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}>
            ← Back
          </button>
          <button onClick={toggleSound} style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: soundEnabled ? 
              'linear-gradient(145deg, #00f0f0, #00d0d0)' : 
              'linear-gradient(145deg, #888, #666)',
            color: soundEnabled ? '#222' : '#ccc',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}>
            {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'flex-start', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* Main Game Area */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          minWidth: '400px',
          flex: '1'
        }}>
          {/* Credits and Bet Display */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            flexWrap: 'wrap',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '2px solid #DAA520'
          }}>
            <div style={{ color: '#00ff00', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              💰 Credits: {credits}
            </div>
            <div style={{ color: '#ffd700', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
              🎯 Bet: {bet}
            </div>
            <div style={{ color: '#ff6b6b', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
              🎰 Jackpot: {jackpot}
            </div>
            {winAmount > 0 && (
              <div style={{ 
                color: '#ff6b6b', 
                animation: 'pulse 0.5s infinite',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}>
                🎉 WIN: {winAmount}!
              </div>
            )}
          </div>

          {/* Slot Machine */}
          <div style={{
            background: 'linear-gradient(145deg, #8B4513, #654321)',
            border: '8px solid #DAA520',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
            position: 'relative',
            minWidth: '360px',
            marginBottom: '20px'
          }}>
            {/* Machine Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              color: '#ffd700',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '2px solid #B8860B'
            }}>
              LUCKY 777
            </div>
            
            {/* Reels Container */}
            <div style={{
              background: '#000',
              border: '6px solid #333',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.8)'
            }}>
              {/* Reels */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {(isSpinning ? spinningReels : reels).map((reel, reelIndex) => (
                  <div key={reelIndex} style={{
                    background: 'linear-gradient(180deg, #1a1a1a, #000)',
                    border: '4px solid #444',
                    borderRadius: '12px',
                    padding: '12px 8px',
                    width: '100px',
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8)',
                    overflow: 'hidden'
                  }}>
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={symbolIndex}
                        style={{
                          fontSize: '2.2rem',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '8px',
                          background: winLines.includes(symbolIndex) ? 
                            'rgba(255, 215, 0, 0.4)' : 
                            'rgba(255,255,255,0.05)',
                          border: winLines.includes(symbolIndex) ? 
                            '3px solid #ffd700' : 
                            '2px solid #666',
                          animation: isSpinning ? 
                            'spin 0.1s linear infinite' : 
                            (winLines.includes(symbolIndex) ? 'pulse 0.5s infinite' : 'none'),
                          boxShadow: winLines.includes(symbolIndex) ? 
                            '0 0 20px rgba(255, 215, 0, 0.8)' : 
                            'none',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px'
                        }}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spin}
              disabled={isSpinning || credits < bet}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                background: isSpinning || credits < bet ? 
                  'linear-gradient(145deg, #666, #555)' : 
                  'linear-gradient(145deg, #ff6b6b, #ff5252)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: isSpinning || credits < bet ? 'not-allowed' : 'pointer',
                boxShadow: isSpinning || credits < bet ? 
                  '0 4px 8px rgba(0,0,0,0.3)' : 
                  '0 8px 16px rgba(255, 107, 107, 0.4)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                transition: 'all 0.3s ease',
                transform: isSpinning || credits < bet ? 'none' : 'scale(1)'
              }}
            >
              {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN!'}
            </button>
          </div>

          {/* Bet Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            padding: '16px',
            borderRadius: '12px',
            border: '2px solid #DAA520'
          }}>
            <button
              onClick={() => setBet(Math.max(1, bet - 5))}
              disabled={isSpinning}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(145deg, #555, #444)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              -5
            </button>
            <button
              onClick={() => setBet(Math.max(1, bet - 1))}
              disabled={isSpinning}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(145deg, #555, #444)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              -1
            </button>
            <div style={{
              padding: '10px 20px',
              background: 'linear-gradient(145deg, #444, #333)',
              borderRadius: '8px',
              minWidth: '80px',
              textAlign: 'center',
              border: '2px solid #666',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#ffd700'
            }}>
              {bet}
            </div>
            <button
              onClick={() => setBet(Math.min(100, bet + 1))}
              disabled={isSpinning}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(145deg, #555, #444)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              +1
            </button>
            <button
              onClick={() => setBet(Math.min(100, bet + 5))}
              disabled={isSpinning}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(145deg, #555, #444)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              +5
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div style={{ 
          minWidth: '250px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Paytable */}
          <div style={{
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            border: '3px solid #DAA520',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ 
              marginBottom: '16px', 
              color: '#ffd700', 
              textAlign: 'center', 
              fontSize: '1.3rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              💰 Paytable
            </h3>
            {SLOT_SYMBOLS.map(symbol => (
              <div key={symbol.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '1rem',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{symbol.emoji}</span>
                  <span>{symbol.name}</span>
                </span>
                <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {symbol.value}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
            borderRadius: '16px',
            padding: '20px',
            border: '3px solid #DAA520',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ 
              marginBottom: '16px', 
              color: '#ffd700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.3rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => addCredits(100)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(145deg, #4caf50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                +100 Credits
              </button>
              <button
                onClick={() => addCredits(500)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(145deg, #2196f3, #1976d2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                +500 Credits
              </button>
              <button
                onClick={() => setCredits(0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(145deg, #ff9800, #f57c00)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                Reset to 0
              </button>
            </div>
            
            {/* Custom Amount Input */}
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ 
                marginBottom: '10px', 
                fontSize: '1rem', 
                color: '#ffd700',
                fontWeight: 'bold'
              }}>
                Custom Amount:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="1-10000"
                  min="1"
                  max="10000"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#333',
                    color: 'white',
                    border: '2px solid #555',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={addCustomCredits}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(145deg, #9c27b0, #7b1fa2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div style={{
            background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
            borderRadius: '16px',
            padding: '20px',
            border: '3px solid #DAA520',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ 
              marginBottom: '16px', 
              color: '#ffd700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.3rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              📊 Statistics
            </h3>
            <div style={{ 
              fontSize: '0.95rem', 
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span>Spins:</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{gameStats.totalSpins}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span>Total Bet:</span>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{gameStats.totalBet}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span>Total Won:</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{gameStats.totalWon}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0'
              }}>
                <span>Biggest Win:</span>
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{gameStats.biggestWin}</span>
              </div>
            </div>
            <button
              onClick={resetStats}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(145deg, #f44336, #d32f2f)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Reset Stats
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          }
          
          button:active {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default SlotMachine; 