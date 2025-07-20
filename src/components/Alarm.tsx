import React, { useState, useEffect } from 'react';
import styles from './Alarm.module.css';

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  label: string;
  repeat: string[];
  snoozeCount: number;
  sound: string;
}

interface AlarmProps {
  onBack?: () => void;
}

const Alarm: React.FC<AlarmProps> = ({ onBack }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [newAlarmRepeat, setNewAlarmRepeat] = useState<string[]>([]);
  const [newAlarmSound, setNewAlarmSound] = useState('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [snoozedAlarms, setSnoozedAlarms] = useState<Set<string>>(new Set());
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [alarmSoundInterval, setAlarmSoundInterval] = useState<NodeJS.Timeout | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const alarmSounds = [
    { value: 'default', label: 'Default Bell', icon: '🔔' },
    { value: 'gentle', label: 'Gentle Wake', icon: '🌅' },
    { value: 'energetic', label: 'Energetic', icon: '⚡' },
    { value: 'nature', label: 'Nature Sounds', icon: '🌿' },
    { value: 'chime', label: 'Chime', icon: '🎵' }
  ];

  useEffect(() => {
    // Load saved alarms from localStorage
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }

    // Check for alarms every second
    const interval = setInterval(checkAlarms, 1000);
    
    // Cleanup function
    return () => {
      clearInterval(interval);
      if (alarmSoundInterval) {
        clearInterval(alarmSoundInterval);
      }
    };
  }, []);

  useEffect(() => {
    // Save alarms to localStorage whenever they change
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  const checkAlarms = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const currentDay = daysOfWeek[now.getDay()];

    alarms.forEach(alarm => {
      if (alarm.enabled && 
          alarm.time === currentTime && 
          (alarm.repeat.length === 0 || alarm.repeat.includes(currentDay)) &&
          !snoozedAlarms.has(alarm.id)) {
        triggerAlarm(alarm);
      }
    });
  };

  const triggerAlarm = (alarm: Alarm) => {
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('Alarm', {
        body: alarm.label || 'Time to wake up!',
        icon: '/vite.svg',
        requireInteraction: true
      });
    }

    // Play sound (simulated)
    playAlarmSound(alarm.sound, true);

    // Add to snoozed alarms to prevent multiple triggers
    setSnoozedAlarms(prev => new Set(prev).add(alarm.id));
  };

  const playAlarmSound = (sound: string, continuous: boolean = false) => {
    try {
      // Create a simple alarm sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sound patterns based on selection
      switch (sound) {
        case 'default':
          // Classic alarm pattern
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.6);
          break;
        case 'gentle':
          // Gentle wake pattern
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.3);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.6);
          break;
        case 'energetic':
          // Energetic pattern
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
          break;
        case 'nature':
          // Nature-inspired pattern
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.4);
          oscillator.frequency.setValueAtTime(350, audioContext.currentTime + 0.6);
          break;
        case 'chime':
          // Chime pattern
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4); // G
          oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.6); // C
          break;
        default:
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      }

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);

      // If continuous, set up repeating sound
      if (continuous) {
        const interval = setInterval(() => {
          playAlarmSound(sound, false);
        }, 2000); // Repeat every 2 seconds for alarms
        setAlarmSoundInterval(interval);
        setIsAlarmRinging(true);
      }
    } catch (error) {
      console.log('Audio playback failed, falling back to notification');
    }
  };

  const stopAlarmSound = () => {
    if (alarmSoundInterval) {
      clearInterval(alarmSoundInterval);
      setAlarmSoundInterval(null);
    }
    setIsAlarmRinging(false);
  };

  const addAlarm = () => {
    if (!newAlarmTime) return;

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      enabled: true,
      label: newAlarmLabel,
      repeat: newAlarmRepeat,
      snoozeCount: 0,
      sound: newAlarmSound
    };

    setAlarms(prev => [...prev, alarm]);
    setNewAlarmTime('');
    setNewAlarmLabel('');
    setNewAlarmRepeat([]);
    setNewAlarmSound('default');
    setShowAddForm(false);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    setSnoozedAlarms(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const snoozeAlarm = (id: string) => {
    // Add 5 minutes to the alarm time
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + 5, 0, 0);
        const newTime = date.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return { 
          ...alarm, 
          time: newTime, 
          snoozeCount: alarm.snoozeCount + 1 
        };
      }
      return alarm;
    }));

    // Remove from snoozed alarms
    setSnoozedAlarms(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleRepeatDay = (day: string) => {
    setNewAlarmRepeat(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const formatRepeatDays = (repeat: string[]): string => {
    if (repeat.length === 0) return 'Once';
    if (repeat.length === 7) return 'Daily';
    if (repeat.length === 5 && !repeat.includes('Sun') && !repeat.includes('Sat')) return 'Weekdays';
    if (repeat.length === 2 && repeat.includes('Sun') && repeat.includes('Sat')) return 'Weekends';
    return repeat.join(', ');
  };

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const testAlarmSound = () => {
    playAlarmSound(newAlarmSound, false);
  };

  return (
    <div className={styles.alarmContainer}>
      <div className={styles.alarmHeader}>
        <h2>Alarm</h2>
        <div className={styles.headerButtons}>
          <button 
            className={styles.notificationButton}
            onClick={requestNotificationPermission}
            title="Enable notifications for alarms"
          >
            🔔
          </button>
          <button 
            className={styles.soundButton}
            onClick={testAlarmSound}
            title="Test alarm sound"
          >
            🔊
          </button>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕' : '+'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.addAlarmForm}>
          <div className={styles.timeInput}>
            <input
              type="time"
              value={newAlarmTime}
              onChange={(e) => setNewAlarmTime(e.target.value)}
              className={styles.timePicker}
            />
          </div>

          <div className={styles.labelInput}>
            <input
              type="text"
              placeholder="Alarm label (optional)"
              value={newAlarmLabel}
              onChange={(e) => setNewAlarmLabel(e.target.value)}
              className={styles.textInput}
            />
          </div>

          <div className={styles.repeatSection}>
            <label>Repeat:</label>
            <div className={styles.repeatDays}>
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  className={`${styles.repeatDay} ${newAlarmRepeat.includes(day) ? styles.selected : ''}`}
                  onClick={() => toggleRepeatDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.soundSection}>
            <label>Sound:</label>
            <select 
              value={newAlarmSound} 
              onChange={(e) => setNewAlarmSound(e.target.value)}
              className={styles.soundSelect}
            >
              {alarmSounds.map(sound => (
                <option key={sound.value} value={sound.value}>
                  {sound.icon} {sound.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            className={styles.saveButton}
            onClick={addAlarm}
            disabled={!newAlarmTime}
          >
            Save Alarm
          </button>
        </div>
      )}

      <div className={styles.alarmsList}>
        {alarms.length === 0 ? (
          <div className={styles.noAlarms}>
            <span className={styles.noAlarmsIcon}>⏰</span>
            <p>No alarms set</p>
            <p>Tap + to add your first alarm</p>
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className={`${styles.alarmItem} ${!alarm.enabled ? styles.disabled : ''}`}>
              <div className={styles.alarmInfo}>
                <div className={styles.alarmTime}>{alarm.time}</div>
                <div className={styles.alarmDetails}>
                  {alarm.label && <div className={styles.alarmLabel}>{alarm.label}</div>}
                  <div className={styles.alarmRepeat}>{formatRepeatDays(alarm.repeat)}</div>
                  {alarm.snoozeCount > 0 && (
                    <div className={styles.snoozeCount}>Snoozed {alarm.snoozeCount}x</div>
                  )}
                </div>
              </div>
              
              <div className={styles.alarmControls}>
                <button
                  className={`${styles.toggleButton} ${alarm.enabled ? styles.enabled : styles.disabled}`}
                  onClick={() => toggleAlarm(alarm.id)}
                >
                  {alarm.enabled ? '🔔' : '🔕'}
                </button>
                <button
                  className={styles.snoozeButton}
                  onClick={() => snoozeAlarm(alarm.id)}
                  title="Snooze for 5 minutes"
                >
                  ⏰
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => deleteAlarm(alarm.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stop Alarm Sound Button - appears when alarm is ringing */}
      {isAlarmRinging && (
        <div className={styles.stopAlarmContainer}>
          <button 
            className={styles.stopAlarmButton}
            onClick={stopAlarmSound}
          >
            🔇 Stop Alarm
          </button>
        </div>
      )}
      
      <div className={styles.navigation}>
        <button className={styles.backButton} onClick={onBack}>
          ⏰ Back to Clock
        </button>
      </div>
    </div>
  );
};

export default Alarm; 