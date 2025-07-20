import React, { useState, useEffect, useRef } from 'react';
import styles from './Timer.module.css';

const Timer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');
  const [isEditing, setIsEditing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Show notification when timer completes
            if (Notification.permission === 'granted') {
              new Notification('Timer Complete!', {
                body: 'Your timer has finished!',
                icon: '/vite.svg'
              });
            }
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

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerHeader}>
        <h2>Timer</h2>
        <button 
          className={styles.notificationButton}
          onClick={requestNotificationPermission}
          title="Enable notifications for timer alerts"
        >
          🔔
        </button>
      </div>

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
    </div>
  );
};

export default Timer; 