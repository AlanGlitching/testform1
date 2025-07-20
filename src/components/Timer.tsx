import React, { useState, useEffect, useRef } from 'react';
import styles from './Timer.module.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface SoundOption {
  value: string;
  label: string;
  icon: string;
  audioUrl: string;
}

const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');
  const [isEditing, setIsEditing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [selectedSound, setSelectedSound] = useState('bell');
  const [volume, setVolume] = useState(0.7);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [soundInterval, setSoundInterval] = useState<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const quotes = [
    "Time is what we want most, but what we use worst. - William Penn",
    "The two most powerful warriors are patience and time. - Leo Tolstoy",
    "Time is the most valuable coin in your life. - Carl Sandburg",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Time is the wisest counselor of all. - Pericles",
    "The future is something which everyone reaches at the rate of sixty minutes an hour. - C.S. Lewis",
    "Time flies over us, but leaves its shadow behind. - Nathaniel Hawthorne",
    "Time is the longest distance between two places. - Tennessee Williams"
  ];

  const soundOptions: SoundOption[] = [
    {
      value: 'bell',
      label: 'Classic Bell',
      icon: '🔔',
      audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    },
    {
      value: 'chime',
      label: 'Gentle Chime',
      icon: '🎵',
      audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    },
    {
      value: 'digital',
      label: 'Digital Beep',
      icon: '📱',
      audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    },
    {
      value: 'nature',
      label: 'Nature Sounds',
      icon: '🌿',
      audioUrl: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    }
  ];

  const achievements: Achievement[] = [
    { id: '1', title: 'First Timer', description: 'Complete your first timer', icon: '🎯', unlocked: false },
    { id: '2', title: 'Streak Master', description: 'Complete 5 timers in a row', icon: '🔥', unlocked: false },
    { id: '3', title: 'Hour Warrior', description: 'Complete a 1-hour timer', icon: '⏰', unlocked: false },
    { id: '4', title: 'Productivity Pro', description: 'Complete 10 timers total', icon: '🚀', unlocked: false },
    { id: '5', title: 'Focus Master', description: 'Complete 3 timers without breaks', icon: '🎯', unlocked: false }
  ];

  useEffect(() => {
    // Load saved data
    const savedStreak = localStorage.getItem('timerStreak');
    const savedCompleted = localStorage.getItem('timerCompleted');
    const savedSound = localStorage.getItem('timerSound');
    const savedVolume = localStorage.getItem('timerVolume');
    
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedCompleted) setTotalCompleted(parseInt(savedCompleted));
    if (savedSound) setSelectedSound(savedSound);
    if (savedVolume) setVolume(parseFloat(savedVolume));

    // Set random motivational quote
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    // Cleanup function
    return () => {
      if (soundInterval) {
        clearInterval(soundInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('timerSound', selectedSound);
    localStorage.setItem('timerVolume', volume.toString());
    
    // Update audio volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [selectedSound, volume]);

  const playTimerSound = async (continuous: boolean = false) => {
    if (!audioRef.current) return;

    const selectedSoundOption = soundOptions.find(sound => sound.value === selectedSound);
    if (!selectedSoundOption) return;

    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sound patterns based on selection
      switch (selectedSound) {
        case 'bell':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
          break;
        case 'chime':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4); // G
          break;
        case 'digital':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
          break;
        case 'nature':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
          break;
        default:
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      }

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      setIsPlayingSound(true);
      setTimeout(() => setIsPlayingSound(false), 500);

      // If continuous, set up repeating sound
      if (continuous) {
        const interval = setInterval(() => {
          playTimerSound(false);
        }, 1000); // Repeat every 1 second
        setSoundInterval(interval);
      }
    } catch (error) {
      console.log('Audio playback failed, falling back to notification');
    }
  };

  const stopSound = () => {
    if (soundInterval) {
      clearInterval(soundInterval);
      setSoundInterval(null);
    }
    setIsTimerComplete(false);
    setIsPlayingSound(false);
  };

  const handleTimerComplete = () => {
    // Play continuous sound until stopped
    playTimerSound(true);
    setIsTimerComplete(true);

    // Show notification when timer completes
    if (Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: 'Great job! Your timer has finished!',
        icon: '/vite.svg'
      });
    }

    // Update stats
    const newCompleted = totalCompleted + 1;
    const newStreak = streak + 1;
    setTotalCompleted(newCompleted);
    setStreak(newStreak);
    
    // Save to localStorage
    localStorage.setItem('timerCompleted', newCompleted.toString());
    localStorage.setItem('timerStreak', newStreak.toString());

    // Check for achievements
    checkAchievements(newCompleted, newStreak);
  };

  const checkAchievements = (completed: number, currentStreak: number) => {
    achievements.forEach(achievement => {
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case '1':
          shouldUnlock = completed >= 1;
          break;
        case '2':
          shouldUnlock = currentStreak >= 5;
          break;
        case '3':
          shouldUnlock = timeLeft >= 3600; // 1 hour
          break;
        case '4':
          shouldUnlock = completed >= 10;
          break;
        case '5':
          shouldUnlock = currentStreak >= 3;
          break;
      }

      if (shouldUnlock && !achievement.unlocked) {
        setCurrentAchievement(achievement);
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 3000);
      }
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
      setIsEditing(false);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsEditing(false);
  };

  const setCustomTime = () => {
    const hours = parseInt(inputHours) || 0;
    const minutes = parseInt(inputMinutes) || 0;
    const seconds = parseInt(inputSeconds) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsEditing(false);
    }
  };

  const quickSet = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsEditing(false);
  };

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const testSound = () => {
    playTimerSound(false);
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerHeader}>
        <h2>Timer</h2>
        <div className={styles.headerControls}>
          <button 
            className={styles.notificationButton}
            onClick={requestNotificationPermission}
            title="Enable notifications for timer alerts"
          >
            🔔
          </button>
          <button 
            className={styles.soundButton}
            onClick={testSound}
            title="Test sound"
            disabled={isPlayingSound}
          >
            {isPlayingSound ? '🔊' : '🔊'}
          </button>
        </div>
      </div>

      {/* Sound Settings */}
      <div className={styles.soundSettings}>
        <div className={styles.soundSelector}>
          <label>Sound:</label>
          <select 
            value={selectedSound} 
            onChange={(e) => setSelectedSound(e.target.value)}
            className={styles.soundSelect}
          >
            {soundOptions.map(sound => (
              <option key={sound.value} value={sound.value}>
                {sound.icon} {sound.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.volumeControl}>
          <label>Volume:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className={styles.volumeSlider}
          />
          <span className={styles.volumeValue}>{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Stats Display */}
      <div className={styles.statsDisplay}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{streak}</span>
          <span className={styles.statLabel}>Streak</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statValue}>{totalCompleted}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
      </div>

      {/* Motivational Quote */}
      {!isRunning && timeLeft === 0 && (
        <div className={styles.quoteContainer}>
          <p className={styles.motivationalQuote}>"{motivationalQuote}"</p>
        </div>
      )}

      <div className={styles.timerDisplay}>
        <div className={styles.timeDisplay}>
          {formatTime(timeLeft)}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${timeLeft > 0 ? ((timeLeft / (parseInt(inputHours) * 3600 + parseInt(inputMinutes) * 60 + parseInt(inputSeconds))) * 100) : 0}%` 
            }}
          />
        </div>
        
        {/* Stop Sound Button - appears when timer completes */}
        {isTimerComplete && (
          <div className={styles.stopSoundContainer}>
            <button 
              className={styles.stopSoundButton}
              onClick={stopSound}
            >
              🔇 Stop Sound
            </button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        {!isRunning && timeLeft === 0 && (
          <div className={styles.quickSetButtons}>
            <button onClick={() => quickSet(1)}>1 min</button>
            <button onClick={() => quickSet(5)}>5 min</button>
            <button onClick={() => quickSet(10)}>10 min</button>
            <button onClick={() => quickSet(15)}>15 min</button>
            <button onClick={() => quickSet(30)}>30 min</button>
            <button onClick={() => quickSet(60)}>1 hour</button>
          </div>
        )}

        {!isEditing && timeLeft === 0 && (
          <button 
            className={styles.customTimeButton}
            onClick={() => setIsEditing(true)}
          >
            Set Custom Time
          </button>
        )}

        {isEditing && (
          <div className={styles.customTimeInput}>
            <div className={styles.timeInputGroup}>
              <input
                type="number"
                min="0"
                max="99"
                value={inputHours}
                onChange={(e) => setInputHours(e.target.value)}
                placeholder="0"
              />
              <span>h</span>
            </div>
            <div className={styles.timeInputGroup}>
              <input
                type="number"
                min="0"
                max="59"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                placeholder="0"
              />
              <span>m</span>
            </div>
            <div className={styles.timeInputGroup}>
              <input
                type="number"
                min="0"
                max="59"
                value={inputSeconds}
                onChange={(e) => setInputSeconds(e.target.value)}
                placeholder="0"
              />
              <span>s</span>
            </div>
            <button onClick={setCustomTime}>Set</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}

        {timeLeft > 0 && (
          <div className={styles.timerControls}>
            {!isRunning ? (
              <button 
                className={`${styles.controlButton} ${styles.startButton}`}
                onClick={startTimer}
              >
                ▶ Start
              </button>
            ) : (
              <button 
                className={`${styles.controlButton} ${styles.pauseButton}`}
                onClick={pauseTimer}
              >
                ⏸ Pause
              </button>
            )}
            <button 
              className={`${styles.controlButton} ${styles.resetButton}`}
              onClick={resetTimer}
            >
              🔄 Reset
            </button>
          </div>
        )}
      </div>

      {/* Achievement Notification */}
      {showAchievement && currentAchievement && (
        <div className={styles.achievementNotification}>
          <div className={styles.achievementContent}>
            <span className={styles.achievementIcon}>{currentAchievement.icon}</span>
            <div className={styles.achievementText}>
              <h3>{currentAchievement.title}</h3>
              <p>{currentAchievement.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer; 