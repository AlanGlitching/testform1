import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Clock from './components/Clock';
import Contact from './components/Contact';
import styles from './App.module.css';

function HomePage() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>World Clock</h1>
        <p>A React 18 + Vite application showing real-time clock with timezone selection</p>
      </header>
      <main className={styles.main}>
        <Clock />
        <div className={styles.contactSection}>
          <Link to="/contact" className={styles.contactButton}>
            Contact Me
          </Link>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App; 