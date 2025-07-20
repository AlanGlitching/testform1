import React, { useState, useEffect } from 'react';
import styles from './Clock.module.css';
import Alarm from './Alarm';
import Timer from './Timer';
import Games from './Games';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

interface SunData {
  sunrise: string;
  sunset: string;
  dayLength: number;
}

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');
  const [showAlarm, setShowAlarm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sunData, setSunData] = useState<SunData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const timezones = [
    { value: 'local', label: 'Local Time' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'New York, USA' },
    { value: 'America/Los_Angeles', label: 'Los Angeles, USA' },
    { value: 'America/Chicago', label: 'Chicago, USA' },
    { value: 'America/Denver', label: 'Denver, USA' },
    { value: 'Europe/London', label: 'London, UK' },
    { value: 'Europe/Paris', label: 'Paris, France' },
    { value: 'Europe/Berlin', label: 'Berlin, Germany' },
    { value: 'Europe/Rome', label: 'Rome, Italy' },
    { value: 'Europe/Madrid', label: 'Madrid, Spain' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam, Netherlands' },
    { value: 'Europe/Stockholm', label: 'Stockholm, Sweden' },
    { value: 'Europe/Vienna', label: 'Vienna, Austria' },
    { value: 'Europe/Zurich', label: 'Zurich, Switzerland' },
    { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
    { value: 'Asia/Shanghai', label: 'Shanghai, China' },
    { value: 'Asia/Taipei', label: 'Taipei, Taiwan' },
    { value: 'Asia/Seoul', label: 'Seoul, South Korea' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
    { value: 'Asia/Bangkok', label: 'Bangkok, Thailand' },
    { value: 'Asia/Manila', label: 'Manila, Philippines' },
    { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia' },
    { value: 'Asia/Kolkata', label: 'Mumbai, India' },
    { value: 'Asia/Dubai', label: 'Dubai, UAE' },
    { value: 'Asia/Tehran', label: 'Tehran, Iran' },
    { value: 'Australia/Sydney', label: 'Sydney, Australia' },
    { value: 'Australia/Melbourne', label: 'Melbourne, Australia' },
    { value: 'Australia/Perth', label: 'Perth, Australia' },
    { value: 'Pacific/Auckland', label: 'Auckland, New Zealand' },
    { value: 'America/Toronto', label: 'Toronto, Canada' },
    { value: 'America/Vancouver', label: 'Vancouver, Canada' },
    { value: 'America/Mexico_City', label: 'Mexico City, Mexico' },
    { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina' },
    { value: 'America/Santiago', label: 'Santiago, Chile' },
    { value: 'Africa/Cairo', label: 'Cairo, Egypt' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa' },
    { value: 'Africa/Lagos', label: 'Lagos, Nigeria' },
    { value: 'Africa/Nairobi', label: 'Nairobi, Kenya' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if it's dark mode based on current time
    const hour = currentTime.getHours();
    setIsDarkMode(hour < 6 || hour >= 18);
  }, [currentTime]);

  useEffect(() => {
    // Simulate weather data (in a real app, you'd fetch from a weather API)
    const mockWeather = {
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
      icon: ['☀️', '☁️', '🌧️', '🌙'][Math.floor(Math.random() * 4)]
    };
    setWeather(mockWeather);

    // Calculate sunrise/sunset times (simplified)
    const sunrise = new Date(currentTime);
    sunrise.setHours(6, 30, 0, 0);
    const sunset = new Date(currentTime);
    sunset.setHours(18, 30, 0, 0);
    
    const dayLength = sunset.getTime() - sunrise.getTime();
    
    setSunData({
      sunrise: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      sunset: sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      dayLength: Math.floor(dayLength / (1000 * 60 * 60))
    });
  }, [currentTime]);

  const formatTime = (date: Date, timezone: string): string => {
    if (timezone === 'local') {
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } else if (timezone === 'UTC') {
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone
      });
    }
  };

  const formatDate = (date: Date, timezone: string): string => {
    if (timezone === 'local') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (timezone === 'UTC') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      });
    }
  };

  const formatTimezoneOffset = (timezone: string): string => {
    if (timezone === 'local') {
      const offset = -new Date().getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (timezone === 'UTC') {
      return '+00:00';
    } else {
      try {
        const date = new Date();
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const targetTime = new Date(utc + (new Date().toLocaleString("en-US", { timeZone: timezone })));
        const offset = (targetTime.getTime() - date.getTime()) / (1000 * 60 * 60);
        const hours = Math.floor(Math.abs(offset));
        const minutes = Math.floor((Math.abs(offset) - hours) * 60);
        const sign = offset >= 0 ? '+' : '-';
        return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } catch {
        return 'N/A';
      }
    }
  };

  const getSeason = (date: Date): string => {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return '🌱 Spring';
    if (month >= 5 && month <= 7) return '☀️ Summer';
    if (month >= 8 && month <= 10) return '🍂 Fall';
    return '❄️ Winter';
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const toggleAlarm = () => {
    setShowAlarm(!showAlarm);
    setShowTimer(false);
  };

  const toggleTimer = () => {
    setShowTimer(!showTimer);
    setShowAlarm(false);
    setShowGames(false);
  };

  const toggleGames = () => {
    setShowGames(!showGames);
    setShowAlarm(false);
    setShowTimer(false);
  };

  const backToClock = () => {
    setShowAlarm(false);
    setShowTimer(false);
    setShowGames(false);
  };

  return (
    <div className={`${styles.clockContainer} ${showAlarm ? styles.alarmMode : ''} ${showTimer ? styles.timerMode : ''} ${showGames ? styles.gamesMode : ''} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.controls}>
        <div className={styles.timezoneSelector}>
          <label className={styles.timezoneLabel}>Timezone:</label>
          <select
            className={styles.timezoneSelect}
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formatControls}>
          {(showAlarm || showTimer || showGames) && (
            <button
              className={styles.backButton}
              onClick={backToClock}
            >
              ⏰ Back to Clock
            </button>
          )}
          <button
            className={`${styles.alarmButton} ${showAlarm ? styles.active : ''}`}
            onClick={toggleAlarm}
            disabled={showAlarm || showTimer || showGames}
          >
            ⏰ Alarm
          </button>
          <button
            className={`${styles.alarmButton} ${showTimer ? styles.active : ''}`}
            onClick={toggleTimer}
            disabled={showAlarm || showTimer || showGames}
          >
            ⏱️ Timer
          </button>
          <button
            className={`${styles.alarmButton} ${showGames ? styles.active : ''}`}
            onClick={toggleGames}
            disabled={showAlarm || showTimer || showGames}
          >
            🎮 Games
          </button>
        </div>
      </div>

      {!showAlarm && !showTimer && !showGames && (
        <div className={styles.clockContent}>
          <div className={styles.timeDisplay}>
            <div className={styles.time}>{formatTime(currentTime, selectedTimezone)}</div>
            <div className={styles.date}>{formatDate(currentTime, selectedTimezone)}</div>
          </div>
          
          <div className={styles.additionalInfo}>
            <div className={styles.timezone}>
              {timezones.find(tz => tz.value === selectedTimezone)?.label} ({formatTimezoneOffset(selectedTimezone)})
            </div>
            
            {weather && (
              <div className={styles.weather}>
                <span className={styles.weatherIcon}>{weather.icon}</span>
                <span className={styles.weatherTemp}>{weather.temperature}°C</span>
                <span className={styles.weatherCondition}>{weather.condition}</span>
              </div>
            )}
            
            <div className={styles.seasonInfo}>
              <span>{getSeason(currentTime)}</span>
              <span>Week {getWeekNumber(currentTime)}</span>
            </div>
            
            {sunData && (
              <div className={styles.sunInfo}>
                <div className={styles.sunTimes}>
                  <span>🌅 {sunData.sunrise}</span>
                  <span>🌇 {sunData.sunset}</span>
                </div>
                <div className={styles.dayLength}>
                  {sunData.dayLength}h daylight
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAlarm && (
        <div className={styles.alarmSection}>
          <Alarm />
        </div>
      )}

      {showTimer && (
        <div className={styles.timerSection}>
          <Timer />
        </div>
      )}

      {showGames && (
        <div className={styles.gamesSection}>
          <Games />
        </div>
      )}
    </div>
  );
};

export default Clock; 