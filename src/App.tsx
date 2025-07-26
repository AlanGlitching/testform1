import { useState } from 'react';
import './App.module.css';
import Clock from './components/Clock';
import Timer from './components/Timer';
import Alarm from './components/Alarm';
import Contact from './components/Contact';
import Share from './components/Share';
import WeatherAdvice from './components/WeatherAdvice';
import Arcade from './components/Arcade';

// Debug environment variables
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
  nodeEnv: import.meta.env.MODE
});

type Page = 'clock' | 'timer' | 'alarm' | 'weather-advice' | 'arcade' | 'contact' | 'share';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('clock');

  const renderPage = () => {
    try {
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
        case 'contact':
          return <Contact onBack={() => setCurrentPage('clock')} />;
        case 'share':
          return <Share onBack={() => setCurrentPage('clock')} />;
        default:
          return <Clock onNavigate={(page) => setCurrentPage(page as Page)} />;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return <div>Error loading page. Please refresh.</div>;
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '2rem'
    }}>
      {renderPage()}
    </div>
  );
}

export default App; 