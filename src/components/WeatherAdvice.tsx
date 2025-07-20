import React, { useState, useEffect } from 'react';
import styles from './WeatherAdvice.module.css';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  feelsLike: number;
}

interface WeatherAdvice {
  clothing: string[];
  accessories: string[];
  footwear: string;
  umbrella: boolean;
  rainBoots: boolean;
  iceBoots: boolean;
  generalAdvice: string;
}

interface Translations {
  title: string;
  generalAdvice: string;
  clothing: string;
  accessories: string;
  footwear: string;
  rainGear: string;
  umbrella: string;
  rainBoots: string;
  iceBoots: string;
  noSpecialGear: string;
  backToClock: string;
  languageToggle: string;
}

interface WeatherAdviceProps {
  onBack?: () => void;
}

const WeatherAdvice: React.FC<WeatherAdviceProps> = ({ onBack }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(null);
  const [isEnglish, setIsEnglish] = useState(true);

  const translations = {
    en: {
      title: "Weather Advice",
      generalAdvice: "General Advice",
      clothing: "Clothing",
      accessories: "Accessories", 
      footwear: "Footwear",
      rainGear: "Rain Gear",
      umbrella: "Umbrella",
      rainBoots: "Rain Boots",
      iceBoots: "Ice Boots",
      noSpecialGear: "No special gear needed",
      backToClock: "Back to Clock",
      languageToggle: "中文"
    },
    zh: {
      title: "外出建议",
      generalAdvice: "一般建议",
      clothing: "衣着建议",
      accessories: "配饰建议",
      footwear: "鞋履建议", 
      rainGear: "雨具建议",
      umbrella: "雨伞",
      rainBoots: "雨靴",
      iceBoots: "冰靴",
      noSpecialGear: "无需特殊雨具",
      backToClock: "返回时钟",
      languageToggle: "English"
    }
  };

  const getCurrentTranslations = (): Translations => {
    return isEnglish ? translations.en : translations.zh;
  };

  const generateWeatherAdvice = (weather: WeatherData): WeatherAdvice => {
    const advice: WeatherAdvice = {
      clothing: [],
      accessories: [],
      footwear: '',
      umbrella: false,
      rainBoots: false,
      iceBoots: false,
      generalAdvice: ''
    };

    // Temperature-based clothing recommendations
    if (weather.temperature < 0) {
      advice.clothing = isEnglish 
        ? ['Heavy coat', 'Sweater', 'Scarf', 'Gloves', 'Hat']
        : ['厚外套', '毛衣', '围巾', '手套', '帽子'];
      advice.footwear = isEnglish ? 'Warm boots' : '保暖靴子';
      advice.iceBoots = true;
      advice.generalAdvice = isEnglish 
        ? 'Cold weather, stay warm'
        : '天气寒冷，注意保暖';
    } else if (weather.temperature < 10) {
      advice.clothing = isEnglish 
        ? ['Jacket', 'Long sleeve shirt', 'Long pants']
        : ['外套', '长袖衬衫', '长裤'];
      advice.footwear = isEnglish ? 'Sneakers or boots' : '运动鞋或靴子';
      advice.generalAdvice = isEnglish 
        ? 'Cool weather, wear a jacket'
        : '天气较凉，建议穿外套';
    } else if (weather.temperature < 20) {
      advice.clothing = isEnglish 
        ? ['Light jacket', 'Long sleeve shirt', 'Long pants']
        : ['轻便外套', '长袖衬衫', '长裤'];
      advice.footwear = isEnglish ? 'Sneakers' : '运动鞋';
      advice.generalAdvice = isEnglish 
        ? 'Comfortable weather, good for outdoor activities'
        : '天气舒适，适合外出';
    } else if (weather.temperature < 30) {
      advice.clothing = isEnglish 
        ? ['Short sleeve shirt', 'Shorts or pants', 'Light clothing']
        : ['短袖衬衫', '短裤或长裤', '轻便衣物'];
      advice.footwear = isEnglish ? 'Sandals or sneakers' : '凉鞋或运动鞋';
      advice.generalAdvice = isEnglish 
        ? 'Warm weather, remember sun protection'
        : '天气温暖，注意防晒';
    } else {
      advice.clothing = isEnglish 
        ? ['Short sleeve', 'Shorts', 'Light clothing']
        : ['短袖', '短裤', '轻便衣物'];
      advice.footwear = isEnglish ? 'Sandals' : '凉鞋';
      advice.accessories = isEnglish 
        ? ['Sunglasses', 'Sunscreen']
        : ['太阳镜', '防晒霜'];
      advice.generalAdvice = isEnglish 
        ? 'Hot weather, stay cool and hydrated'
        : '天气炎热，注意防暑降温';
    }

    // Weather condition-based recommendations
    if (weather.condition === 'Rainy' || weather.precipitation > 50) {
      advice.umbrella = true;
      advice.rainBoots = true;
      advice.footwear = isEnglish ? 'Rain boots' : '雨靴';
      advice.accessories.push(isEnglish ? 'Raincoat' : '雨衣');
      advice.generalAdvice += isEnglish ? ', rain expected, bring umbrella' : '，有雨，记得带伞';
    } else if (weather.condition === 'Cloudy') {
      advice.accessories.push(isEnglish ? 'Light jacket' : '薄外套');
      advice.generalAdvice += isEnglish ? ', cloudy weather' : '，多云天气';
    } else if (weather.condition === 'Sunny') {
      advice.accessories.push(
        isEnglish ? 'Sunglasses' : '太阳镜',
        isEnglish ? 'Sunscreen' : '防晒霜',
        isEnglish ? 'Hat' : '帽子'
      );
      advice.generalAdvice += isEnglish ? ', sunny weather' : '，阳光充足';
    }

    // Wind-based recommendations
    if (weather.windSpeed > 15) {
      advice.accessories.push(isEnglish ? 'Windproof jacket' : '防风外套');
      advice.generalAdvice += isEnglish ? ', windy conditions' : '，风较大';
    }

    // Humidity-based recommendations
    if (weather.humidity > 80) {
      advice.accessories.push(isEnglish ? 'Breathable clothing' : '透气衣物');
      advice.generalAdvice += isEnglish ? ', high humidity' : '，湿度较高';
    }

    return advice;
  };

  useEffect(() => {
    // Simulate weather data (in a real app, you'd fetch from a weather API)
    const mockWeather = {
      temperature: 18, // Fixed temperature for demo
      condition: 'Sunny',
      icon: '☀️',
      humidity: 65,
      windSpeed: 12,
      precipitation: 10,
      feelsLike: 20
    };
    setWeather(mockWeather);

    // Generate weather advice
    const advice = generateWeatherAdvice(mockWeather);
    setWeatherAdvice(advice);
  }, [isEnglish]); // Regenerate advice when language changes

  const handleBackToClock = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback to window.location if no onBack prop
      window.location.href = '/';
    }
  };

  if (!weather || !weatherAdvice) {
    return <div className={styles.loading}>Loading weather advice...</div>;
  }

  const t = getCurrentTranslations();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🌤️ {t.title}</h1>
        <button 
          className={styles.languageToggle}
          onClick={() => setIsEnglish(!isEnglish)}
        >
          {t.languageToggle}
        </button>
      </div>

      <div className={styles.weatherCard}>
        <div className={styles.weatherInfo}>
          <span className={styles.weatherIcon}>{weather.icon}</span>
          <div className={styles.weatherDetails}>
            <span className={styles.temperature}>{weather.temperature}°C</span>
            <span className={styles.condition}>{weather.condition}</span>
            <span className={styles.feelsLike}>
              {isEnglish ? 'Feels like' : '体感温度'}: {weather.feelsLike}°C
            </span>
          </div>
        </div>
        
        <div className={styles.weatherStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{isEnglish ? 'Humidity' : '湿度'}</span>
            <span className={styles.statValue}>{weather.humidity}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{isEnglish ? 'Wind' : '风速'}</span>
            <span className={styles.statValue}>{weather.windSpeed} km/h</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{isEnglish ? 'Rain' : '降水'}</span>
            <span className={styles.statValue}>{weather.precipitation}%</span>
          </div>
        </div>
      </div>

      <div className={styles.adviceContainer}>
        <div className={styles.generalAdvice}>
          <h2>💡 {t.generalAdvice}</h2>
          <p>{weatherAdvice.generalAdvice}</p>
        </div>

        <div className={styles.adviceGrid}>
          <div className={styles.adviceSection}>
            <h3>👕 {t.clothing}</h3>
            <div className={styles.adviceItems}>
              {weatherAdvice.clothing.map((item, index) => (
                <span key={index} className={styles.adviceItem}>{item}</span>
              ))}
            </div>
          </div>

          {weatherAdvice.accessories.length > 0 && (
            <div className={styles.adviceSection}>
              <h3>👜 {t.accessories}</h3>
              <div className={styles.adviceItems}>
                {weatherAdvice.accessories.map((item, index) => (
                  <span key={index} className={styles.adviceItem}>{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.adviceSection}>
            <h3>👟 {t.footwear}</h3>
            <span className={styles.adviceItem}>{weatherAdvice.footwear}</span>
          </div>

          <div className={styles.adviceSection}>
            <h3>🌂 {t.rainGear}</h3>
            <div className={styles.adviceItems}>
              {weatherAdvice.umbrella && <span className={styles.adviceItem}>☔ {t.umbrella}</span>}
              {weatherAdvice.rainBoots && <span className={styles.adviceItem}>👢 {t.rainBoots}</span>}
              {weatherAdvice.iceBoots && <span className={styles.adviceItem}>🥾 {t.iceBoots}</span>}
              {!weatherAdvice.umbrella && !weatherAdvice.rainBoots && !weatherAdvice.iceBoots && (
                <span className={styles.adviceItem}>{t.noSpecialGear}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button className={styles.backButton} onClick={handleBackToClock}>
        ⏰ {t.backToClock}
      </button>
    </div>
  );
};

export default WeatherAdvice; 