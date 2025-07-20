import { useState, useEffect } from 'react';
import styles from './Alarm.module.css';

interface Alarm {
  id: string;
  time: string;
  label: string;
  isActive: boolean;
  isRinging: boolean;
}

function Alarm() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarm, setNewAlarm] = useState({ time: '', label: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check for alarms that should ring
    alarms.forEach(alarm => {
      if (alarm.isActive && !alarm.isRinging) {
        const alarmTime = new Date();
        const [hours, minutes] = alarm.time.split(':');
        alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const currentTimeStr = currentTime.toTimeString().slice(0, 5);
        if (currentTimeStr === alarm.time) {
          triggerAlarm(alarm.id);
        }
      }
    });
  }, [currentTime, alarms]);

  const triggerAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, isRinging: true } : alarm
    ));
    
    // Play alarm sound (you can add an actual audio file)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarm!', {
        body: alarms.find(a => a.id === alarmId)?.label || 'Time to wake up!',
        icon: '/vite.svg'
      });
    }
  };

  const addAlarm = () => {
    if (newAlarm.time && newAlarm.label) {
      const alarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarm.time,
        label: newAlarm.label,
        isActive: true,
        isRinging: false
      };
      
      setAlarms(prev => [...prev, alarm]);
      setNewAlarm({ time: '', label: '' });
    }
  };

  const toggleAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const stopAlarm = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, isRinging: false } : alarm
    ));
  };

  const deleteAlarm = (alarmId: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== alarmId));
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className={styles.alarmContainer}>
      <h2>Alarm Settings</h2>
      
      <div className={styles.addAlarm}>
        <h3>Add New Alarm</h3>
        <div className={styles.alarmForm}>
          <input
            type="time"
            value={newAlarm.time}
            onChange={(e) => setNewAlarm(prev => ({ ...prev, time: e.target.value }))}
            className={styles.timeInput}
          />
          <input
            type="text"
            placeholder="Alarm label (optional)"
            value={newAlarm.label}
            onChange={(e) => setNewAlarm(prev => ({ ...prev, label: e.target.value }))}
            className={styles.labelInput}
          />
          <button onClick={addAlarm} className={styles.addButton}>
            Add Alarm
          </button>
        </div>
      </div>

      <div className={styles.alarmsList}>
        <h3>Your Alarms</h3>
        {alarms.length === 0 ? (
          <p className={styles.noAlarms}>No alarms set</p>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              className={`${styles.alarmItem} ${alarm.isRinging ? styles.ringing : ''}`}
            >
              <div className={styles.alarmInfo}>
                <span className={styles.alarmTime}>{alarm.time}</span>
                <span className={styles.alarmLabel}>{alarm.label || 'Alarm'}</span>
              </div>
              
              <div className={styles.alarmControls}>
                {alarm.isRinging ? (
                  <button 
                    onClick={() => stopAlarm(alarm.id)}
                    className={styles.stopButton}
                  >
                    Stop
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`${styles.toggleButton} ${!alarm.isActive ? styles.inactive : ''}`}
                    >
                      {alarm.isActive ? 'ON' : 'OFF'}
                    </button>
                    <button 
                      onClick={() => deleteAlarm(alarm.id)}
                      className={styles.deleteButton}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.notificationSettings}>
        <button onClick={requestNotificationPermission} className={styles.notificationButton}>
          Enable Notifications
        </button>
        <p className={styles.notificationInfo}>
          Enable browser notifications to receive alarm alerts
        </p>
      </div>
    </div>
  );
}

export default Alarm; 