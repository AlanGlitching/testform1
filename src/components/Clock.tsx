import React, { useState, useEffect } from 'react';
import styles from './Clock.module.css';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
}

interface SunData {
  sunrise: string;
  sunset: string;
  dayLength: number;
}

interface ClockProps {
  onNavigate?: (page: string) => void;
}

const Clock: React.FC<ClockProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('local');
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
    // Check if it's dark mode based on current time in selected timezone
    const timezoneTime = getTimezoneTime(selectedTimezone);
    const hour = timezoneTime.getHours();
    setIsDarkMode(hour < 6 || hour >= 18);
  }, [currentTime, selectedTimezone]);

  useEffect(() => {
    // Simulate weather data (in a real app, you'd fetch from a weather API)
    const mockWeather = {
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
      icon: ['☀️', '☁️', '🌧️', '🌙'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 20),
      precipitation: Math.floor(Math.random() * 100),
      feelsLike: Math.floor(Math.random() * 10) + 10
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

  const getTimezoneTime = (timezone: string): Date => {
    if (timezone === 'local') {
      return new Date();
    } else if (timezone === 'UTC') {
      return new Date(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
    } else {
      return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    }
  };

  return (
    <div className={`${styles.clockContainer} ${isDarkMode ? styles.darkMode : ''}`}>
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
        
        <div className={styles.appControls}>
          <button className={styles.navButton} onClick={() => onNavigate?.('timer')}>
            ⏱️ Timer
          </button>
          <button className={styles.navButton} onClick={() => onNavigate?.('alarm')}>
            ⏰ Alarm
          </button>
          <button className={styles.navButton} onClick={() => onNavigate?.('arcade')}>
            🎮 Arcade
          </button>
        </div>
        
        <div className={styles.formatControls}>
          <button 
            className={styles.darkModeToggle}
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className={styles.clockContent}>
        <div className={styles.timeDisplay}>
          <div className={styles.time}>
            {formatTime(currentTime, selectedTimezone)}
          </div>
          <div className={styles.date}>
            {formatDate(currentTime, selectedTimezone)}
          </div>
        </div>

        {weather && (
          <div className={styles.weather}>
            <span className={styles.weatherIcon}>{weather.icon}</span>
            <span className={styles.weatherTemp}>{weather.temperature}°C</span>
            <span className={styles.weatherCondition}>{weather.condition}</span>
            <button 
              className={styles.weatherAdviceButton}
              onClick={() => onNavigate?.('weather-advice')}
              title="View Weather Advice"
            >
              🌤️
            </button>
          </div>
        )}
        
        <div className={styles.seasonInfo}>
          <div className={styles.season}>
            {getSeason(getTimezoneTime(selectedTimezone))}
          </div>
          <div className={styles.weekNumber}>
            Week {getWeekNumber(getTimezoneTime(selectedTimezone))}
          </div>
          {sunData && (
            <div className={styles.sunInfo}>
              <div>🌅 {sunData.sunrise}</div>
              <div>🌇 {sunData.sunset}</div>
              <div>☀️ {sunData.dayLength}h</div>
            </div>
          )}
        </div>

        <div className={styles.navigation}>
          <button className={styles.navButton} onClick={() => onNavigate?.('contact')}>
            📧 Contact Creator
          </button>
          <button className={styles.navButton} onClick={() => onNavigate?.('share')}>
            📤 Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock; 