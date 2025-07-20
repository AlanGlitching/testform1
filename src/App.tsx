import { useState } from 'react';
import Clock from './components/Clock';
import Timer from './components/Timer';
import Alarm from './components/Alarm';
import WeatherAdvice from './components/WeatherAdvice';
import Arcade from './components/Arcade';
import './App.module.css';

type Page = 'clock' | 'timer' | 'alarm' | 'weather-advice' | 'arcade';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('clock');

  const renderPage = () => {
    switch (currentPage) {
      case 'clock':
        return <Clock onNavigate={(page) => setCurrentPage(page as Page)} />;
      case 'timer':
        return <Timer onBack={() => setCurrentPage('clock')} />;
      case 'alarm':
        return <Alarm onBack={() => setCurrentPage('clock')} />;
      case 'weather-advice':
        return <WeatherAdvice onBack={() => setCurrentPage('clock')} />;
      case 'arcade':
        return <Arcade onBack={() => setCurrentPage('clock')} />;
      default:
        return <Clock onNavigate={(page) => setCurrentPage(page as Page)} />;
    }
  };

  // Check if we're on the weather advice page via URL
  if (window.location.pathname === '/weather-advice') {
    return <WeatherAdvice />;
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App; 